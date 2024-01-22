import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('GlockToken', function () {
  async function deployToken() {
    const [owner, otherAccount] = await ethers.getSigners()

    const GlockToken = await ethers.getContractFactory('GlockToken')
    const glockToken = await GlockToken.deploy(1_000_000)

    return { glockToken, owner, otherAccount }
  }

  it('returns the right name and symbol', async function () {
    const { glockToken } = await loadFixture(deployToken)

    const name = await glockToken.name()
    const symbol = await glockToken.symbol()

    expect(name).to.equal('Glock')
    expect(symbol).to.equal('GLK')
  })

  it('sets the right total supply', async () => {
    const { glockToken } = await loadFixture(deployToken)

    const totalSupply = await glockToken.totalSupply()

    expect(totalSupply).to.equal(1_000_000)
  })

  it('assigns the total supply of tokens to the owner', async () => {
    const { glockToken, owner } = await loadFixture(deployToken)

    const ownerBalance = await glockToken.balanceOf(owner.address)
    const totalSupply = await glockToken.totalSupply()

    expect(totalSupply).to.equal(ownerBalance)
  })
})

