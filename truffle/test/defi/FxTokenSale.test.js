// ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0
// truffle test ./test/defi/FxTokenSale.test.js --network development --compile-none --migrations_directory migrations_null

const { assert } = require('chai')
const { reverts } = require('truffle-assertions')
const { toBN, parseEther } = require('../utils/helper')


contract('FxTokenSale.test', async (accounts) => {
  before(async () => {
    const ControlTower = artifacts.require("ControlTower")
    const Treasury = artifacts.require("Treasury")
    const FxEthersToken = artifacts.require("FxEthersToken")
    const FxTokenSale = artifacts.require("FxTokenSale")

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

    this.rate = parseEther('2') // 1 ether - 2 tokens
    this.FxTokenSaleInstance = await FxTokenSale.new(
      this.TreasuryInstance.address,      // address payable _treasury
      this.rate,                          // uint _rate
      this.FxEthersTokenInstance.address, // IERC20 _token
      this.ControlTowerInstance.address,  // ControlTower _controlTower
    )

    await this.TreasuryInstance.approve(this.FxEthersTokenInstance.address, this.FxTokenSaleInstance.address, parseEther('4'))
  })


  it('Should have Control Tower address', async () => {
    const controlTower = await this.FxTokenSaleInstance.controlTower()
    assert.equal(
      controlTower.toString(),
      this.ControlTowerInstance.address,
      'TokenSale does not have Control Tower address exactly'
    )
  })

  it('Should have Treasury', async () => {
    const treasury = await this.FxTokenSaleInstance.treasury()
    assert.equal(
      this.TreasuryInstance.address,
      treasury,
      'TokenSale does not have allowance exactly'
    )
  })
  
  it('Should have rate', async () => {
    const rate = await this.FxTokenSaleInstance.rate()
    assert.equal(
      rate.toString(),
      this.rate.toString(),
      'TokenSale does not have rate exactly'
    )
  })

  it('Should have token address', async () => {
    const token = await this.FxTokenSaleInstance.token()
    assert.equal(
      token.toString(),
      this.FxEthersTokenInstance.address,
      'TokenSale does not have token address exactly'
    )
  })

  it('Should have allowance token from Treasury', async () => {
    const allowanceFromTreasury = await this.FxEthersTokenInstance.allowance(
      this.TreasuryInstance.address,
      this.FxTokenSaleInstance.address,
    )
    const available = await this.FxTokenSaleInstance.available()

    assert.isTrue(
      allowanceFromTreasury.gt(0),
      'TokenSale does not have any allowance'
    )
    assert.equal(
      allowanceFromTreasury.toString(),
      available.toString(),
      'TokenSale does not have allowance exactly'
    )
  })

  it('Should be revert when trying to buy tokens from account not in whitelist', async () => {
    const amountIn = parseEther(1)
    await reverts(
      this.FxTokenSaleInstance.buyTokens(this.account1, { from: this.account1, value: amountIn }),
      "ControlTower: WHITELIST_ONLY",
    )
  })

  it('Should be able to buy tokens', async () => {
    const amountIn = parseEther(1)
    const estimateToken = await this.FxTokenSaleInstance.getEstimateToken(amountIn)

    const balanceOfTreasuryBefore = await this.FxEthersTokenInstance.balanceOf(this.TreasuryInstance.address)
    const balanceBefore = await this.FxEthersTokenInstance.balanceOf(this.account1)

    await this.FxTokenSaleInstance.buyTokens(this.account1, { value: amountIn })

    const balanceAfter = await this.FxEthersTokenInstance.balanceOf(this.account1)
    const balanceOfTreasuryAfter = await this.FxEthersTokenInstance.balanceOf(this.TreasuryInstance.address)

    assert.isTrue(
      balanceAfter.gt(balanceBefore),
      'Account owner does not have a amount correctly after buy'
    )
    assert.isTrue(
      balanceOfTreasuryAfter.lt(balanceOfTreasuryBefore),
      'Treasury does not have a amount correctly after buy'
    )
    assert.equal(
      balanceOfTreasuryBefore.sub(balanceOfTreasuryAfter).toString(),
      balanceAfter.sub(balanceBefore).toString(),
      'FxEthers does not transfer a amount exactly'
    )
    assert.equal(
      balanceOfTreasuryBefore.sub(balanceOfTreasuryAfter).toString(),
      estimateToken.toString(),
      'FxEthers does not transfer from Treasury a amount exactly as estimated'
    )
    assert.equal(
      balanceAfter.sub(balanceBefore).toString(),
      estimateToken.toString(),
      'FxEthers does not transfer a amount exactly as estimated'
    )
  })

  it('Should be revert when trying to buy tokens more than available', async () => {
    const available = await this.FxTokenSaleInstance.available()
    const rate = await this.FxTokenSaleInstance.rate()
    const MULTIPLIER = parseEther(1)
    const amountIn = toBN(available).mul(MULTIPLIER).div(rate).add(toBN(1))
    await reverts(
      this.FxTokenSaleInstance.buyTokens(this.account1, { value: amountIn }),
      "ERC20: insufficient allowance",
    )
  })

})