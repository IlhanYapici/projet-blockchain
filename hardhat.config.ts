import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
require('dotenv').config()

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined
const apiKey = process.env.POLYGONSCAN_API_KEY

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts,
    },
  },
  etherscan: {
    apiKey,
  },
}

task('deploy-and-verify', 'Deploy and verify the TokenSale contract')
  .addParam('tokens', 'The number of tokens to mint')
  .addParam('tokenPrice', 'The price of each token')
  .addParam('saleDuration', 'The duration of the sale in seconds')
  .setAction(async (taskArgs, { ethers, run }) => {
    const [owner] = await ethers.getSigners()

    const GlockToken = await ethers.getContractFactory('GlockToken')
    const glockToken = await GlockToken.deploy(
      ethers.parseEther(taskArgs.tokens)
    )
    await glockToken.waitForDeployment()
    await glockToken.deploymentTransaction()?.wait(10)

    const TokenSale = await ethers.getContractFactory('TokenSale')
    const tokenSale = await TokenSale.deploy(
      await glockToken.getAddress(),
      taskArgs.tokenPrice,
      taskArgs.saleDuration,
      owner.address
    )
    await tokenSale.waitForDeployment()
    await tokenSale.deploymentTransaction()?.wait(10)

    console.log('TokenSale deployed to:', await tokenSale.getAddress())

    await run('verify:verify', {
      address: await glockToken.getAddress(),
      constructorArguments: [ethers.parseEther(taskArgs.tokens)],
    })

    await run('verify:verify', {
      address: await tokenSale.getAddress(),
      constructorArguments: [
        await glockToken.getAddress(),
        taskArgs.tokenPrice,
        taskArgs.saleDuration,
        owner.address,
      ],
    })
  })

export default config

