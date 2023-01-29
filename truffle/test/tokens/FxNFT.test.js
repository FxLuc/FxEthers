// ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0
// truffle test ./test/tokens/FxNFT.test.js --network development --compile-none --migrations_directory migrations_null

const { assert } = require('chai')
const { reverts } = require('truffle-assertions')

const toBN = (number) => new web3.utils.toBN(number)
const parseEther = (number) => new web3.utils.toWei(toBN(number), 'ether')


contract('FxNFT.test', async (accounts) => {
  before(async () => {
    const ControlTower = artifacts.require("ControlTower")
    const Treasury = artifacts.require("Treasury")
    const FxNFT = artifacts.require("FxNFT")

    this.accountOwner = accounts[0]
    this.account1 = accounts[1]
    this.baseUri = 'https://nft.fxethers.com/'

    this.ControlTowerInstance = await ControlTower.new()
    this.TreasuryInstance = await Treasury.new(this.ControlTowerInstance.address)
    this.FxNFTInstance = await FxNFT.new(
      this.ControlTowerInstance.address,  // ControlTower _controlTower
      this.baseUri,                       // string memory _baseUri
    )
  })

  // it('Should all token in Treasury after deploy', async () => {
  //   const totalSupply = await this.FxNFTInstance.totalSupply()
  //   const balanceOfTreasury = await this.FxNFTInstance.balanceOf(this.TreasuryInstance.address)
  //   assert.equal(
  //     totalSupply.toString(),
  //     this.baseUri.toString(),
  //     'Should mint an amount equal the amount when init supply'
  //   )
  //   assert.equal(
  //     totalSupply.toString(),
  //     balanceOfTreasury.toString(),
  //     'All token does not in Treasury exactly'
  //   )
  // })

  it('Should not have any tokens in account owner', async () => {
    const balanceOfOwner = await this.FxNFTInstance.balanceOf(this.accountOwner)
    assert.equal(
      '0',
      balanceOfOwner.toString(),
      'Account owner does not have a amount of NFT exactly'
    )
  })

  it('Should have token information', async () => {
    const name = await this.FxNFTInstance.name()
    const symbol = await this.FxNFTInstance.symbol()
    assert.equal(name, 'FxNFT', 'FxNFT does not have name correctly')
    assert.equal(symbol, 'FxNFT', 'FxNFT does not have symbol correctly')
  })

  
  it('Should be able to mint tokens by role Treasury', async () => {
    const balanceOfAccountBefore = await this.FxNFTInstance.balanceOf(this.accountOwner)
    await this.FxNFTInstance.mint()
    const balanceOfAccountAfter = await this.FxNFTInstance.balanceOf(this.accountOwner)
    const currentTokenId = await this.FxNFTInstance.currentTokenId()
    const tokenId = currentTokenId.sub(toBN(1))
    const ownerOfTokenId = await this.FxNFTInstance.ownerOf(tokenId)
    const baseUriOfTokenId = await this.FxNFTInstance.tokenURI(tokenId)

    assert.isTrue(
      balanceOfAccountAfter.gt(balanceOfAccountBefore),
      'Account owner does not have balance exactly after mint'
    )
    assert.equal(
      ownerOfTokenId.toString(),
      this.accountOwner.toString(),
      'FxNFT does not have owner exactly'
    )
    assert.equal(
      baseUriOfTokenId.toString(),
      this.baseUri.concat(tokenId.toString()),
      'FxNFT does not have URI exactly'
    )
  })

  it('Should be able to transfer token to another account', async () => {
    const balanceOfOwnerBefore = await this.FxNFTInstance.balanceOf(this.accountOwner)
    const balanceOfOtherAccBefore = await this.FxNFTInstance.balanceOf(this.account1)
    const currentTokenId = await this.FxNFTInstance.currentTokenId()
    const tokenId = currentTokenId.sub(toBN(1))
  
    await this.FxNFTInstance.transferFrom(this.accountOwner, this.account1, tokenId)

    const ownerOfTokenId = await this.FxNFTInstance.ownerOf(tokenId)
    const balanceOfOwnerAfter = await this.FxNFTInstance.balanceOf(this.accountOwner)
    const balanceOfOtherAccAfter = await this.FxNFTInstance.balanceOf(this.account1)

    assert.isTrue(
      balanceOfOwnerBefore.gt(0),
      'Account owner does not have a balance exactly before transfer'
    )
    assert.isTrue(
      balanceOfOtherAccAfter.gt(balanceOfOtherAccBefore),
      'Other Account does not have a amount exactly after transfer'
    )
    assert.isTrue(
      balanceOfOwnerAfter.lt(balanceOfOwnerBefore),
      'Owner Account does not have a amount exactly after transfer'
    )
    assert.equal(
      ownerOfTokenId.toString(),
      this.account1.toString(),
      'Other Account is not owned of the NFT after transfer'
    )
  })

  // it('Should have Control Tower address', async () => {
  //   const controlTower = await this.FxNFTInstance.controlTower()
  //   assert.equal(
  //     controlTower.toString(),
  //     this.ControlTowerInstance.address,
  //     'TokenSale does not have Control Tower address exactly'
  //   )
  // })

  // it('Should be able to approve token to another account', async () => {
  //   const amountApprove = parseEther('1')
  //   const allowanceOfAccountBefore = await this.FxNFTInstance.allowance(this.accountOwner, this.account1)
  //   await this.FxNFTInstance.approve(this.account1, amountApprove)
  //   const allowanceOfAccountAfter = await this.FxNFTInstance.allowance(this.accountOwner, this.account1)

  //   assert.isTrue(
  //     allowanceOfAccountAfter.gt(allowanceOfAccountBefore),
  //     'Account owner does not have allowance exactly after approve'
  //   )
  //   assert.equal(
  //     amountApprove.toString(),
  //     allowanceOfAccountAfter.toString(),
  //     'FxNFT does not approve a amount exactly'
  //   )
  // })

  // it('Should be revert when trying to mint tokens by account not has role Treasury', async () => {
  //   const amountIn = parseEther('1')
  //   await reverts(this.FxNFTInstance.mint(amountIn, { from: this.account1 }), "ControlTower: TREASURER_ONLY")
  // })

  // it('Should be revert when trying to transfer more than balance', async () => {
  //   const balanceOfOwner = await this.FxNFTInstance.balanceOf(this.accountOwner)
  //   const amountTransfer = toBN(balanceOfOwner).add(toBN(1))
  //   await reverts(this.FxNFTInstance.transfer(this.FxNFTInstance.address, amountTransfer), "ERC20: transfer amount exceeds balance")
  // })

})