// ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0
// truffle test ./test/defi/Treasury.test.js --network development --compile-none --migrations_directory migrations_null

const { assert } = require('chai')
const truffleAssert = require('truffle-assertions')
const toBN = (number) => new web3.utils.toBN(number)
const parseEther = (number) => new web3.utils.toWei(toBN(number), 'ether')


contract('Treasury.test', async (accounts) => {
  before(async () => {
    const ControlTower = artifacts.require("ControlTower")
    const Treasury = artifacts.require("Treasury")
    const FxEthersToken = artifacts.require("FxEthersToken")

    this.accountOwner = accounts[0]
    this.account1 = accounts[1]

    this.ControlTowerInstance = await ControlTower.new()
    this.TreasuryInstance = await Treasury.new(this.ControlTowerInstance.address)

    this.initialSupply = parseEther('1000000')
    this.FxEthersTokenInstance = await FxEthersToken.new(
      this.initialSupply,                 // uint initialSupply,
      this.TreasuryInstance.address,      // address _treasury,
      this.ControlTowerInstance.address,  // ControlTower _controlTower
    )
  })


  it('Should have Control Tower address', async () => {
    const controlTower = await this.TreasuryInstance.controlTower()
    assert.equal(
      controlTower.toString(),
      this.ControlTowerInstance.address,
      'Treasury does not have Control Tower address exactly'
    )
  })

  it('Should be able to receive native ether', async () => {
    const amountIn = parseEther(1)
    await web3.eth.sendTransaction({ from: this.accountOwner, to: this.TreasuryInstance.address, value: amountIn })
    const balance = await web3.eth.getBalance(this.TreasuryInstance.address);
    assert.equal(
      balance.toString(),
      amountIn.toString(),
      'Treasury does not have native ether exactly'
    )
  })

  it('Should be able to approve token to another account', async () => {
    const amountApprove = parseEther('1')
    const allowanceOfAccountBefore = await this.FxEthersTokenInstance.allowance(this.TreasuryInstance.address, this.account1)
    await this.TreasuryInstance.approve(this.FxEthersTokenInstance.address, this.account1, amountApprove)
    const allowanceOfAccountAfter = await this.FxEthersTokenInstance.allowance(this.TreasuryInstance.address, this.account1)

    assert.isTrue(
      allowanceOfAccountAfter.gt(allowanceOfAccountBefore),
      'Account does not have allowance exactly after approve'
    )
    assert.equal(
      amountApprove.toString(),
      allowanceOfAccountAfter.toString(),
      'Treasury does not approve a amount exactly'
    )
  })

  it('Should be able to transfer token to another account', async () => {
    const amountTransfer = parseEther('1')
    const balanceOfTreasuryBefore = await this.FxEthersTokenInstance.balanceOf(this.TreasuryInstance.address)
    const balanceOfOwnerBefore = await this.FxEthersTokenInstance.balanceOf(this.accountOwner)
    const totalSupplyBefore = await this.FxEthersTokenInstance.totalSupply()

    await this.TreasuryInstance.transfer(this.FxEthersTokenInstance.address, this.accountOwner, amountTransfer)

    const balanceOfTreasuryAfter = await this.FxEthersTokenInstance.balanceOf(this.TreasuryInstance.address)
    const balanceOfOwnerAfter = await this.FxEthersTokenInstance.balanceOf(this.accountOwner)
    const totalSupplyAfter = await this.FxEthersTokenInstance.totalSupply()

    assert.isTrue(
      balanceOfOwnerAfter.gt(balanceOfOwnerBefore),
      'Account owner does not have a amount correctly after transfer'
    )
    assert.isTrue(
      balanceOfTreasuryAfter.lt(balanceOfTreasuryBefore),
      'Treasury does not have a amount correctly after transfer'
    )
    assert.equal(
      balanceOfTreasuryBefore.sub(balanceOfTreasuryAfter).toString(),
      balanceOfOwnerAfter.sub(balanceOfOwnerBefore).toString(),
      'FxEthers does not transfer a amount exactly'
    )
    assert.equal(
      balanceOfTreasuryBefore.sub(balanceOfTreasuryAfter).toString(),
      amountTransfer.toString(),
      'FxEthers does not transfer from Treasury a amount exactly as amount in'
    )
    assert.equal(
      balanceOfOwnerAfter.sub(balanceOfOwnerBefore).toString(),
      amountTransfer.toString(),
      'FxEthers does not transfer to account owner a amount exactly as amount in'
    )
    assert.equal(
      totalSupplyBefore.toString(),
      totalSupplyAfter.toString(),
      'Should not affect totalSupply'
    )
  })

})