// ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0
// truffle test ./test/defi/FxEthersToken.test.js --network development --compile-none --migrations_directory migrations_null

const { assert } = require('chai')
const truffleAssert = require('truffle-assertions')
const toBN = (number) => new web3.utils.toBN(number)
const parseEther = (number) => new web3.utils.toWei(toBN(number), 'ether')


contract('FxEthersToken.test', async (accounts) => {
  before(async () => {
    const ControlTower = artifacts.require("ControlTower")
    const Treasury = artifacts.require("Treasury")
    const FxEthersToken = artifacts.require("FxEthersToken")

    this.accountOwner = accounts[0]
    this.account1 = accounts[1]
    this.initialSupply = parseEther('1000000')

    this.ControlTowerInstance = await ControlTower.new()
    this.TreasuryInstance = await Treasury.new(this.ControlTowerInstance.address)
    this.FxEthersTokenInstance = await FxEthersToken.new(
      this.initialSupply,                 // uint initialSupply,
      this.TreasuryInstance.address,      // address _treasury,
      this.ControlTowerInstance.address,  // ControlTower _controlTower
    )
  })

  it('Should all token in Treasury after deploy', async () => {
    const totalSupply = await this.FxEthersTokenInstance.totalSupply()
    const balanceOfTreasury = await this.FxEthersTokenInstance.balanceOf(this.TreasuryInstance.address)
    assert.equal(
      totalSupply.toString(),
      this.initialSupply.toString(),
      'Should mint an amount equal the amount when init supply'
    )
    assert.equal(
      totalSupply.toString(),
      balanceOfTreasury.toString(),
      'All token does not in Treasury exactly'
    )
  })

  it('Should not have any token in account owner', async () => {
    const balanceOfOwner = await this.FxEthersTokenInstance.balanceOf(this.accountOwner)
    assert.equal(
      '0',
      balanceOfOwner.toString(),
      'Account owner does not have a amount exactly'
    )
  })

  it('Should have token information', async () => {
    const name = await this.FxEthersTokenInstance.name()
    const symbol = await this.FxEthersTokenInstance.symbol()
    const decimals = await this.FxEthersTokenInstance.decimals()

    assert.equal(name, 'FxEthers Token', 'FxEthers does not have name correctly')
    assert.equal(symbol, 'FETH', 'FxEthers does not have symbol correctly')
    assert.equal(decimals.toString(), '18', 'FxEthers does not have decimals correctly')
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

  it('Should have Control Tower address', async () => {
    const controlTower = await this.FxEthersTokenInstance.controlTower()
    assert.equal(
      controlTower.toString(),
      this.ControlTowerInstance.address,
      'TokenSale does not have Control Tower address exactly'
    )
  })

  it('Should be able to approve token to another account', async () => {
    const amountApprove = parseEther('1')
    const allowanceOfAccountBefore = await this.FxEthersTokenInstance.allowance(this.accountOwner, this.account1)
    await this.FxEthersTokenInstance.approve(this.account1, amountApprove)
    const allowanceOfAccountAfter = await this.FxEthersTokenInstance.allowance(this.accountOwner, this.account1)

    assert.isTrue(
      allowanceOfAccountAfter.gt(allowanceOfAccountBefore),
      'Account owner does not have allowance exactly after approve'
    )
    assert.equal(
      amountApprove.toString(),
      allowanceOfAccountAfter.toString(),
      'FxEthers does not approve a amount exactly'
    )
  })

  it('Should be able to mint tokens by role Treasury', async () => {
    const amountIn = parseEther('1')
    const balanceOfTreasuryBefore = await this.FxEthersTokenInstance.balanceOf(this.TreasuryInstance.address)
    await this.FxEthersTokenInstance.mint(amountIn)
    const balanceOfTreasuryAfter = await this.FxEthersTokenInstance.balanceOf(this.TreasuryInstance.address)

    assert.isTrue(
      balanceOfTreasuryAfter.gt(balanceOfTreasuryBefore),
      'Account owner does not have balance exactly after mint'
    )
    assert.equal(
      amountIn.toString(),
      balanceOfTreasuryAfter.sub(balanceOfTreasuryBefore).toString(),
      'FxEthers does not mint a amount exactly'
    )
  })

  it('Should be revert when trying to mint tokens by account not has role Treasury', async () => {
    const amountIn = parseEther('1')
    await truffleAssert.reverts(this.FxEthersTokenInstance.mint(amountIn, { from: this.account1 }), "ControlTower: TREASURER_ONLY")
  })

  it('Should be revert when trying to transfer more than balance', async () => {
    const balanceOfOwner = await this.FxEthersTokenInstance.balanceOf(this.accountOwner)
    const amountTransfer = toBN(balanceOfOwner).add(toBN(1))
    await truffleAssert.reverts(this.FxEthersTokenInstance.transfer(this.FxEthersTokenInstance.address, amountTransfer), "ERC20: transfer amount exceeds balance")
  })

})