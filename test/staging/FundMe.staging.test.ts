import { ethers, getNamedAccounts, network } from 'hardhat'
import { developmetChains } from '../../helper-hardhat-config'
import { FundMe } from '../../typechain-types'
import { assert } from 'chai'

developmetChains.includes(network.name)
    ? describe.skip
    : describe('FundMe', async () => {
          let fundMe: FundMe
          let deployer: string
          const sendValue = ethers.utils.parseEther('0.04')

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract('FundMe', deployer)
          })

          it('allows people to fund and withdraw', async () => {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )

              assert.equal(endingFundMeBalance.toString(), '0')
          })
      })
