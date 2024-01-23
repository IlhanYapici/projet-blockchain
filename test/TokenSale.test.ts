import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { assert, expect } from 'chai'
import { ethers } from 'hardhat'

describe('TokenSale', function () {
  async function deployToken() {
    const [owner, otherAccount] = await ethers.getSigners()

    const GlockToken = await ethers.getContractFactory('GlockToken')
    const glockToken = await GlockToken.deploy(ethers.parseEther('1500'))

    return { glockToken, owner, otherAccount }
  }

  async function deployTokenSale() {
    const { glockToken, owner, otherAccount } = await loadFixture(deployToken)
    const tokenAddress = await glockToken.getAddress()

    const TokenSale = await ethers.getContractFactory('TokenSale')
    const tokenSale = await TokenSale.deploy(
      tokenAddress,
      1,
      3_600,
      owner.address
    )

    return { tokenSale, glockToken, owner, otherAccount }
  }

  it('sets the initial state correctly', async () => {
    const { tokenSale, glockToken } = await loadFixture(deployTokenSale)

    const tokenAddress = await tokenSale.token()
    const tokenPrice = await tokenSale.tokenPrice()
    const saleStart = await tokenSale.saleStart()
    const saleEnd = await tokenSale.saleEnd()

    expect(tokenAddress).to.equal(await glockToken.getAddress())
    expect(tokenPrice).to.equal(1)
    expect(saleStart).to.be.closeTo(Math.floor(Date.now() / 1_000), 4)
    expect(saleEnd).to.be.closeTo(Math.floor(Date.now() / 1_000) + 3_600, 4)
  })

  it('allows users to buy tokens', async () => {
    const { tokenSale, glockToken, otherAccount } = await loadFixture(
      deployTokenSale
    )

    // Transfer 100 tokens from the current account to the token sale contract.
    // This is done to supply the token sale contract with tokens that it can sell.
    await glockToken.transfer(
      await tokenSale.getAddress(),
      ethers.parseEther('100')
    )

    // Simulate a user (otherAccount) buying tokens from the token sale contract.
    // The user is sending 1 Ether to buy tokens
    await tokenSale
      .connect(otherAccount)
      .buyTokens({ value: ethers.parseEther('1') })

    // Check that the user's token balance has increased by 1.
    // This means that the user should have received 1 token from the token sale
    expect(await glockToken.balanceOf(otherAccount.address)).to.equal(
      ethers.parseEther('1')
    )

    // Get the address of the token sale contract.
    const tokenSaleAddress = await tokenSale.getAddress()

    // Get the Ether balance of the token sale contract.
    const tokenSaleBalance = await ethers.provider.getBalance(tokenSaleAddress)

    // Check that the Ether balance of the token sale contract is 1.
    expect(tokenSaleBalance).to.equal(ethers.parseEther('1'))
  })

  it('throws an error when buying 0 token', async () => {
    const { tokenSale, otherAccount } = await loadFixture(deployTokenSale)

    await expect(
      tokenSale.connect(otherAccount).buyTokens({ value: 0 })
    ).to.be.revertedWithCustomError(tokenSale, 'InvalidTokenAmount')
  })

  it('allows the owner to end the sale', async () => {
    const { tokenSale, owner, glockToken, otherAccount } = await loadFixture(
      deployTokenSale
    )

    const initialOwnerEtherBalance = await ethers.provider.getBalance(
      owner.address
    )

    expect(await tokenSale.closed()).to.be.false

    await glockToken.transfer(
      await tokenSale.getAddress(),
      ethers.parseEther('2')
    )

    await tokenSale
      .connect(otherAccount)
      .buyTokens({ value: ethers.parseEther('1') })

    // It should not be possible to end the sale before we reach the sale end time
    await expect(
      tokenSale.connect(owner).endSale()
    ).to.be.revertedWithCustomError(tokenSale, 'SaleNotOverYet')

    // Fast forward 1 hour
    await ethers.provider.send('evm_increaseTime', [3_600])

    // End the sale
    await tokenSale.connect(owner).endSale()
    expect(await tokenSale.closed()).to.be.true

    // Get the final token balance of the owner
    const finalOwnerTokenBalance = await glockToken.balanceOf(owner.address)

    // Get the final Ether balance of the owner
    const finalOwnerEtherBalance = await ethers.provider.getBalance(
      owner.address
    )

    // Check that the owner's token balance has increased by the remaining tokens
    expect(finalOwnerTokenBalance).to.equal(ethers.parseEther('1499'))

    // Check that the owner's Ether balance has increased by the Ether collected in the sale
    expect(finalOwnerEtherBalance).to.be.gt(initialOwnerEtherBalance)
  })
})

