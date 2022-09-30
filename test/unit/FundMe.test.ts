import { deployments, ethers, getNamedAccounts, network } from 'hardhat'
import { FundMe, MockV3Aggregator } from '../../typechain-types'
import { assert, expect } from 'chai'
import { developmetChains } from '../../helper-hardhat-config'

!developmetChains.includes(network.name)
    ? describe.skip
    : describe('FundMe', async () => {
          let fundMe: FundMe
          let deployer: string
          let mockV3Aggregator: MockV3Aggregator
          const sendValue = ethers.utils.parseEther('1')

          beforeEach(async () => {
              //deploy our fund me contract
              //using hardhat-deploy

              // const accounts = await ethers.getSigners()
              // const deployer = accounts[0]

              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(['all'])
              fundMe = await ethers.getContract('FundMe', deployer)
              mockV3Aggregator = await ethers.getContract(
                  'MockV3Aggregator',
                  deployer
              )
          })

          describe('constructor', async () => {
              it('sets the aggregator address correctly', async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe('fund', async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWithCustomError(
                      fundMe,
                      'FundMe__NotEnoughUSD'
                  )
              })

              it('Updated the amount funded data structure', async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )

                  assert.equal(response.toString(), sendValue.toString())
              })

              it('Adds funder to array of funders', async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)

                  assert.equal(funder, deployer)
              })
          })

          describe('withdraw', async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it('Withdraw ETH from a single funder', async () => {
                  //arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //act
                  const transaction = await fundMe.withdraw()
                  const transactionReceipt = await transaction.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //gascost

                  //assert
                  assert.equal(endingFundMeBalance.toString(), '0')
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(totalGasCost).toString()
                  )
              })

              it('Allows us to withdraw with multiple funders', async () => {
                  //arrange
                  const accounts = await ethers.getSigners()

                  for (let i = 1; i < 6; i++) {
                      const fundMeConnected = fundMe.connect(accounts[i])
                      await fundMeConnected.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //act
                  const transaction = await fundMe.withdraw()
                  const transactionReceipt = await transaction.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  assert.equal(endingFundMeBalance.toString(), '0')
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(totalGasCost).toString()
                  )

                  //make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              )
                          ).toString(),
                          '0'
                      )
                  }
              })

              it('Only allows the owner to withdraw', async () => {
                  const accounts = await ethers.getSigners()
                  const connectedFund = fundMe.connect(accounts[1])

                  await expect(
                      connectedFund.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
              })

              it('CheapWithdraw ETH from a single funder', async () => {
                  //arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //act
                  const transaction = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transaction.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //gascost

                  //assert
                  assert.equal(endingFundMeBalance.toString(), '0')
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(totalGasCost).toString()
                  )
              })

              it('CheaperWithdraw testing...', async () => {
                  //arrange
                  const accounts = await ethers.getSigners()

                  for (let i = 1; i < 6; i++) {
                      const fundMeConnected = fundMe.connect(accounts[i])
                      await fundMeConnected.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //act
                  const transaction = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transaction.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  assert.equal(endingFundMeBalance.toString(), '0')
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(totalGasCost).toString()
                  )

                  //make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              )
                          ).toString(),
                          '0'
                      )
                  }
              })
          })
      })
