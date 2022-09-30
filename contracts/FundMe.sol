// SPDX-License-Identifier: MIT
//pragma
pragma solidity ^0.8.8;

//imports
import "./PriceConverter.sol";


//error codes
error FundMe__NotOwner();
error FundMe__CallFailed(); 
error FundMe__NotEnoughUSD();

//contracts
/**
@title A contract for crowd funding.
@author Mohammed Naqib
 */
contract FundMe {
    //constant amd immutable keywoords -> decrease the gas price.

    //type declarations
    using PriceConverter for uint256;

    //state variables
    uint256 public constant MIN_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface private immutable i_priceFeed;

    //modifier
    modifier onlyOwner {
        // require(msg.sender == i_owner, "Sender is not owner!");
        if(msg.sender != i_owner) { revert FundMe__NotOwner(); }
        _;
    }

    constructor(address priceFeedAddress){
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //what happens if someone sends eth without using fund function.
    //receive, fallback

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
    @notice This fund function funds this contract
    */
    function fund() public payable {
        //want to be able to set a min fund amount in usd
        // require(msg.value.getConversionRate(i_priceFeed) >= MIN_USD, "Didn't send enough ether");
        // 1e18 = 1 * 10 ** 18 == 1000000000000000000

        if(msg.value.getConversionRate(i_priceFeed) < MIN_USD) { revert FundMe__NotEnoughUSD(); }

        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for(uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex = funderIndex + 1) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        //reset the array
        s_funders = new address[](0);
        
        //withdraw the funds
        //transfer, send, call

        //msg.sender = address, payable = payable address;
        //payable(msg.sender).transfer(address(this).balance);

       //bool sendSuccess =  payable(msg.sender).send(address(this).balance);
       //require(sendSuccess, "Send failed");

       ( bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
       //require(callSuccess, "Call failed");
       if(!callSuccess) { revert FundMe__CallFailed(); }
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        uint256 length = funders.length;

        for(uint256 index = 0; index < length; index = index + 1) {
            address funder = funders[index];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}("");
        if(!success) { revert FundMe__CallFailed(); }
    }

    function getOwner() public view returns(address) {
        return i_owner;
    }
    
    function getFunder(uint256 index) public view returns(address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns(uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return i_priceFeed;
    }
}

