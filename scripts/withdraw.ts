import { ethers, getNamedAccounts } from 'hardhat'
import { FundMe } from '../typechain-types'

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe: FundMe = await ethers.getContract('FundMe', deployer)

    console.log('Withdrawing contract....')
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log('Withdraw completed')
}

main()
    .then(() => process.exit(0))
    .catch((err: any) => {
        console.error(err)
        process.exit(1)
    })
