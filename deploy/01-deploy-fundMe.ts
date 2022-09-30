import { DeployFunction } from 'hardhat-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { developmetChains, networkConfig } from '../helper-hardhat-config'
import { verify } from '../utils/verify'
import 'dotenv/config'

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
    network,
}: HardhatRuntimeEnvironment) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId as number

    let ethUSDpriceFeedAddress: string

    if (developmetChains.includes(network.name)) {
        ethUSDpriceFeedAddress = (await get('MockV3Aggregator')).address
    } else {
        ethUSDpriceFeedAddress = networkConfig[chainId].ethUSDpriceFeed
    }

    //when going for localhost or hardhat network we want use a mock.
    const fundMe = await deploy('FundMe', {
        from: deployer,
        args: [
            //address
            ethUSDpriceFeedAddress,
        ],
        log: true,
        waitConfirmations: developmetChains.includes(network.name) ? 1 : 6,
    })

    if (!developmetChains.includes(network.name) && process.env.API_KEY) {
        await verify(fundMe.address, [ethUSDpriceFeedAddress])
    }

    log('------------------------------------------------------')
}

export default func
func.tags = ['all', 'fundme']
