import { deployments, ethers, getNamedAccounts } from 'hardhat'
import { FundMe } from '../typechain-types'

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe: FundMe = await ethers.getContract('FundMe', deployer)

    console.log('Funding contract....')
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther('0.04'),
    })
    await transactionResponse.wait(1)
    console.log('Funded')
}

main()
    .then(() => process.exit(0))
    .catch((err: any) => {
        console.error(err)
        process.exit(1)
    })
