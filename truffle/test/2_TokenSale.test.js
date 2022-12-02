// require('dotenv').config({path: '../.env'})
const KYC = artifacts.require('KYC')
const FethToken = artifacts.require('FethToken')
const TokenSale = artifacts.require("TokenSale")
const chai = require('./setup/chai-setup')
const BN = web3.utils.BN
const expect = chai.expect

contract('TokenSale Test', async (accounts) => {
  const [deployerAccount, recipient] = accounts

  before(async () => this.myToken = await FethToken.deployed())

  it('Should not have any tokens in deployerAccount', async () => {
    const zeroAmout = new BN(0)
    const instance = this.myToken
    await expect(
      instance.balanceOf(deployerAccount)
    ).to.eventually.be.a.bignumber.equal(zeroAmout)
  })

  it('All tokens should be in the TokenSale by default', async () => {
    const instance = this.myToken
    const balanceOfTokenSale = await instance.balanceOf(TokenSale.address)
    const totalSupply = await instance.totalSupply()
    expect(balanceOfTokenSale).to.be.a.bignumber.equal(totalSupply)
  })

  it('Should be possible to buy tokens', async () => {
    const amount = new BN(1)
    const myTokenInstance = this.myToken
    const kycInstance = await KYC.deployed();
    const myTokenSaleInstance = await TokenSale.deployed()
    const balanceOfRecipientrBefore = await myTokenInstance.balanceOf(recipient)

    await expect(kycInstance.register(recipient, { from: deployerAccount })).to.be.fulfilled;

    await expect(myTokenSaleInstance.sendTransaction({
      from: recipient,
      value: amount,
    })).to.eventually.be.fulfilled

    expect(
      myTokenInstance.balanceOf(recipient)
    ).to.eventually.be.a.bignumber.equal(
      balanceOfRecipientrBefore.add(amount)
    )
  })
})