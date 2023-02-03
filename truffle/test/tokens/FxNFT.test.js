// ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0
// truffle test ./test/tokens/FxNFT.test.js --network development --compile-none --migrations_directory migrations_null

const { assert } = require('chai')
const { reverts } = require('truffle-assertions')
const { toBN, parseEther } = require('../utils/helper')

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
      this.TreasuryInstance.address,      // address payable _treasury
      this.baseUri,                       // string memory _baseUri
    )

    await this.FxNFTInstance.setServiceFee(parseEther('1'))
  })

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


  it('Should be able to mint token', async () => {
    const balanceOfAccountBefore = await this.FxNFTInstance.balanceOf(this.accountOwner)
    const hashedMetadata = web3.utils.soliditySha3(this.accountOwner)
    await this.FxNFTInstance.mint(this.accountOwner, hashedMetadata)
    const balanceOfAccountAfter = await this.FxNFTInstance.balanceOf(this.accountOwner)
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const ownerOfTokenId = await this.FxNFTInstance.ownerOf(tokenId)
    const baseUriOfTokenId = await this.FxNFTInstance.tokenURI(tokenId)
    const hashedMetadataActually = await this.FxNFTInstance.hashedMetadata(tokenId)

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
    assert.equal(
      hashedMetadata,
      hashedMetadataActually,
      'FxNFT does not have hashed metadata exactly'
    )
  })

  it('Should be able to transfer token to another account', async () => {
    const balanceOfOwnerBefore = await this.FxNFTInstance.balanceOf(this.accountOwner)
    const balanceOfOtherAccBefore = await this.FxNFTInstance.balanceOf(this.account1)
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))

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

  it('Should be able to mint token by role Treasury', async () => {
    const hashedMetadata = web3.utils.soliditySha3(this.accountOwner)
    const balanceOfAccountBefore = await this.FxNFTInstance.balanceOf(this.account1)

    await this.FxNFTInstance.mint(this.account1, hashedMetadata)

    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const ownerOfTokenId = await this.FxNFTInstance.ownerOf(tokenId)
    const hashedMetadataActually = await this.FxNFTInstance.hashedMetadata(tokenId)
    const balanceOfAccountAfter = await this.FxNFTInstance.balanceOf(this.account1)

    assert.equal(this.account1, ownerOfTokenId)
    assert.equal(hashedMetadata, hashedMetadataActually)
    assert.equal(balanceOfAccountAfter.sub(balanceOfAccountBefore).toString(), toBN(1).toString())
  })

  it('Should be revert when trying to mint token by role not Treasury', async () => {
    const hashedMetadata = web3.utils.soliditySha3(this.accountOwner)
    await reverts(
      this.FxNFTInstance.mint(this.account1, hashedMetadata, { from: this.account1 }),
      'ControlTower: MODERATOR_ONLY',
    )
  })

  it('Should be able to mint token with fee by any account', async () => {
    const hashedMetadata = web3.utils.soliditySha3(this.accountOwner)
    const balanceOfAccountBefore = await this.FxNFTInstance.balanceOf(this.account1)
    const serviceFee = await this.FxNFTInstance.serviceFee()

    await this.FxNFTInstance.mintWithFee(
      this.account1,
      hashedMetadata,
      { from: this.account1, value: serviceFee },
    )

    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const ownerOfTokenId = await this.FxNFTInstance.ownerOf(tokenId)
    const hashedMetadataActually = await this.FxNFTInstance.hashedMetadata(tokenId)
    const balanceOfAccountAfter = await this.FxNFTInstance.balanceOf(this.account1)

    assert.equal(this.account1, ownerOfTokenId)
    assert.equal(hashedMetadata, hashedMetadataActually)
    assert.equal(balanceOfAccountAfter.sub(balanceOfAccountBefore).toString(), toBN(1).toString())
  })

  it('Should be revert when trying to mint token with fee by any account when fee not enough', async () => {
    const hashedMetadata = web3.utils.soliditySha3(this.accountOwner)
    const serviceFee = await this.FxNFTInstance.serviceFee()
    await reverts(
      this.FxNFTInstance.mintWithFee(
        this.account1,
        hashedMetadata,
        { from: this.account1, value: serviceFee.sub(toBN(1)) },
      ),
      "FxNFT: INVALID_FEE",
    )
  })

  it('Should be able to approve token to another account', async () => {
    const hashedMetadata = web3.utils.soliditySha3(this.accountOwner)
    await this.FxNFTInstance.mint(this.account1, hashedMetadata)
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    await this.FxNFTInstance.approve(this.accountOwner, tokenId, { from: this.account1 })
    const approvedOfTokenIdAfter = await this.FxNFTInstance.getApproved(tokenId)

    assert.equal(
      approvedOfTokenIdAfter.toString(),
      this.accountOwner.toString(),
      'Account owner does not have allowance of token ID exactly after approve'
    )
  })
})