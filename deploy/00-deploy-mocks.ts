import { DeployFunction } from 'hardhat-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import {
    DECIMALS,
    developmetChains,
    INITIAL_ANSWER,
} from '../helper-hardhat-config'

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
    network,
}: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmetChains.includes(network.name)) {
        log('Local network detected! Deploying mocks...')
        await deploy('MockV3Aggregator', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log('Mocks deployed!')
        log('----------------------------------------------------------')
    }
}
export default func
func.tags = ['mocks', 'all']
