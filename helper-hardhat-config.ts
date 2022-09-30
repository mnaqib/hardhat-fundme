export const networkConfig: {
    [key: number]: { name: string; ethUSDpriceFeed: string }
} = {
    5: {
        name: 'goerli',
        ethUSDpriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    },
}

export const developmetChains = ['hardhat', 'localhost']
export const DECIMALS = 8
export const INITIAL_ANSWER = 2000000000000
