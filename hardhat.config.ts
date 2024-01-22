import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com',
      // accounts: ['MY_PRIVATE_KEY'],
    },
  },
  etherscan: {
    apiKey: 'MY_ETHERSCAN_API_KEY',
  },
}

export default config

