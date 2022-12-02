// require('dotenv').config({path: '../.env'})
const FethToken = artifacts.require('FethToken')
const chai = require('./setup/chai-setup')
const { INITIAL_SUPPLY } = require('../utils/constants')
const BN = web3.utils.BN
const expect = chai.expect

contract('FethToken Test', async (accounts) => {
  const [deployerAccount, recipient] = accounts

  // beforeEach(async () => this.myToken = await Token.new())
  before(async () => this.myToken = await FethToken.new(INITIAL_SUPPLY))

  it('all tokens should be in my account', async () => {
    const instance = this.myToken
    const totalSupply = await instance.totalSupply()
    expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
  })

  it('is possible to send tokens between accounts', async () => {
    const tokenAmount = new BN(1)
    const instance = this.myToken
    const totalSupply = await instance.totalSupply()
    expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
    await expect(instance.transfer(recipient, tokenAmount)).to.eventually.be.fulfilled
    expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply.sub(tokenAmount))
    expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(tokenAmount)
  })

  it('is not possible to send more tokens than available in total', async () => {
    const instance = this.myToken
    const balanceOfDeployer = await instance.balanceOf(deployerAccount)
    await expect(instance.transfer(recipient, new BN(balanceOfDeployer + 1))).to.eventually.be.rejected
    expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceOfDeployer)
  })

  it('It should have decimals 18', async () => {
    const instance = this.myToken
    const decimals = new BN(18)
    expect(instance.decimals()).to.eventually.be.a.bignumber.equal(decimals)
  })
})