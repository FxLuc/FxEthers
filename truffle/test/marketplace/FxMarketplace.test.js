// ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0
// truffle test ./test/marketplace/FxMarketplace.test.js --network development --compile-none --migrations_directory migrations_null

const { assert } = require('chai')
const { reverts } = require('truffle-assertions')
const {
  ADDRESS_ZERO,
  ZERO,
  MAX_UINT_256,
  toBN,
  parseEther,
  getBlockTimestamp,
  mineToTimestamp,
} = require('../utils/helper')

contract('FxMarketplace.test', async (accounts) => {
  before(async () => {
    const ControlTower = artifacts.require('ControlTower')
    const Treasury = artifacts.require('Treasury')
    const FxMarketplace = artifacts.require('FxMarketplace')
    const FxEthersToken = artifacts.require('FxEthersToken')
    const FxNFT = artifacts.require('FxNFT')

    this.accountOwner = accounts[0]
    this.account1 = accounts[1]
    this.account2 = accounts[2]
    this.account3 = accounts[3]
    this.account4 = accounts[4]
    this.account5 = accounts[5]
    this.baseUri = 'https://nft.fxethers.com/'

    this.ControlTowerInstance = await ControlTower.new()
    this.TreasuryInstance = await Treasury.new(this.ControlTowerInstance.address)

    this.initialSupply = parseEther('1000000')
    this.FxEthersTokenInstance = await FxEthersToken.new(
      this.initialSupply,                 // uint initialSupply
      this.TreasuryInstance.address,      // address _treasury
      this.ControlTowerInstance.address,  // ControlTower _controlTower
    )

    this.FxNFTInstance = await FxNFT.new(
      this.ControlTowerInstance.address,  // ControlTower _controlTower
      this.TreasuryInstance.address,      // address payable _treasury
      this.baseUri,                       // string memory _baseUri
    )

    this.FxMarketplaceInstance = await FxMarketplace.new(
      this.ControlTowerInstance.address,  // ControlTower _controlTower
      this.TreasuryInstance.address,      // address _treasury
    )

    await this.TreasuryInstance.transfer(this.FxEthersTokenInstance.address, this.account1, parseEther('100'))
    await this.TreasuryInstance.transfer(this.FxEthersTokenInstance.address, this.account2, parseEther('100'))
    await this.TreasuryInstance.transfer(this.FxEthersTokenInstance.address, this.account3, parseEther('100'))
    await this.TreasuryInstance.transfer(this.FxEthersTokenInstance.address, this.account4, parseEther('100'))
  })

  it('Should be able to add token payment', async () => {
    const isPaymentTokenBefore = await this.FxMarketplaceInstance.isPaymentToken(this.FxEthersTokenInstance.address)
    await this.FxMarketplaceInstance.addPaymentToken(this.FxEthersTokenInstance.address)
    const isPaymentTokenAfter = await this.FxMarketplaceInstance.isPaymentToken(this.FxEthersTokenInstance.address)

    assert.notEqual(
      isPaymentTokenBefore.toString(),
      isPaymentTokenAfter.toString(),
      'FxMarketplace does not toggle token payment exactly'
    )
    assert.isTrue(
      isPaymentTokenAfter,
      'FxETH is not a token payment'
    )
  })

  it('Should be able to list NFT for sale', async () => {
    const hashedMetadata = web3.utils.soliditySha3(this.accountOwner)
    await this.FxNFTInstance.mint(this.account1, hashedMetadata)
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    await this.FxNFTInstance.approve(this.FxMarketplaceInstance.address, tokenId, { from: this.account1 })

    const timestamp = await getBlockTimestamp()
    const endTime = timestamp + 60 * 60 * 24 // 60s * 60m * 24h
    const startPrice = parseEther('1')
    await this.FxMarketplaceInstance.listForSale(
      this.FxNFTInstance.address,
      tokenId,
      timestamp,
      endTime,
      this.FxEthersTokenInstance.address,
      startPrice,
      { from: this.account1 }
    )
    const itemListed = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    assert.equal(
      itemListed.paymentToken.toLowerCase(),
      this.FxEthersTokenInstance.address.toLowerCase(),
      'PaymentToken does not set exactly'
    )
    assert.equal(
      itemListed.seller.toLowerCase(),
      this.account1.toLowerCase(),
      'Seller does not set exactly'
    )
    assert.equal(
      itemListed.bidder,
      ADDRESS_ZERO,
      'Purchaser does not set exactly'
    )
    assert.equal(
      itemListed.startTime.toString(),
      timestamp.toString(),
      'Start time does not set exactly'
    )
    assert.equal(
      itemListed.endTime.toString(),
      endTime.toString(),
      'End time does not set exactly'
    )
    assert.equal(
      itemListed.startPrice.toString(),
      startPrice.toString(),
      'Start price does not set exactly'
    )
    assert.equal(
      itemListed.startPrice.toString(),
      itemListed.currentPrice.toString(),
      'Last price does not set exactly'
    )
  })

  it('Should be able to make an offer by user 1', async () => {
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const itemListedBefore = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)
    const amountOffer = itemListedBefore.currentPrice.add(parseEther('1'))
    const balanceOfUserBefore = await this.FxEthersTokenInstance.balanceOf(this.account2)

    await this.FxEthersTokenInstance.approve(this.FxMarketplaceInstance.address, MAX_UINT_256, { from: this.account2 })
    await this.FxMarketplaceInstance.makeAnOffer(
      this.FxNFTInstance.address,
      tokenId,
      this.FxEthersTokenInstance.address,
      amountOffer,
      { from: this.account2 }
    )
    const balanceOfUserAfter = await this.FxEthersTokenInstance.balanceOf(this.account2)
    const itemListedAfter = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    assert.equal(
      balanceOfUserBefore.sub(balanceOfUserAfter).toString(),
      amountOffer.toString(),
      'Transfer an amount offer not exactly'
    )
    assert.equal(
      itemListedAfter.currentPrice.toString(),
      amountOffer.toString(),
      'Amount Offer does not set exactly'
    )
    assert.equal(
      itemListedAfter.bidder.toString(),
      this.account2.toString(),
      'Purchaser does not set exactly'
    )
  })

  it('Should be able to make an offer by user 2', async () => {
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const itemListedBefore = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)
    const amountOffer = itemListedBefore.currentPrice.add(parseEther('1'))
    const balanceOfUserBefore = await this.FxEthersTokenInstance.balanceOf(this.account3)

    await this.FxEthersTokenInstance.approve(this.FxMarketplaceInstance.address, MAX_UINT_256, { from: this.account3 })
    await this.FxMarketplaceInstance.makeAnOffer(
      this.FxNFTInstance.address,
      tokenId,
      this.FxEthersTokenInstance.address,
      amountOffer,
      { from: this.account3 }
    )

    const balanceOfUserAfter = await this.FxEthersTokenInstance.balanceOf(this.account3)
    const itemListedAfter = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    assert.equal(
      balanceOfUserBefore.sub(balanceOfUserAfter).toString(),
      amountOffer.toString(),
      'Transfer an amount offer not exactly'
    )
    assert.equal(
      itemListedAfter.currentPrice.toString(),
      amountOffer.toString(),
      'Amount Offer does not set exactly'
    )
    assert.equal(
      itemListedAfter.bidder.toString(),
      this.account3.toString(),
      'Purchaser does not set exactly'
    )
  })

  it('Should be revert when trying to make an offer lower than last price', async () => {
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const itemListed = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)
    const amountOffer = itemListed.currentPrice
    await this.FxEthersTokenInstance.approve(this.FxMarketplaceInstance.address, MAX_UINT_256, { from: this.account4 })
    await reverts(
      this.FxMarketplaceInstance.makeAnOffer(
        this.FxNFTInstance.address,
        tokenId,
        this.FxEthersTokenInstance.address,
        amountOffer,
        { from: this.account4 }
      ),
      "FxMarketplace: OFFER_TOO_LOW",
    )
  })

  it('Should be revert when trying to make an offer with insufficiency token payment amount last price', async () => {
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const itemListed = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)
    const amountOffer = itemListed.currentPrice.add(toBN(1))
    await this.FxEthersTokenInstance.approve(this.FxMarketplaceInstance.address, MAX_UINT_256, { from: this.account5 })
    await reverts(
      this.FxMarketplaceInstance.makeAnOffer(
        this.FxNFTInstance.address,
        tokenId,
        this.FxEthersTokenInstance.address,
        amountOffer,
        { from: this.account5 }
      ),
      "ERC20: transfer amount exceeds balance",
    )
  })

  it('Should be revert when trying to make an offer after end time', async () => {
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const itemListed = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)
    await mineToTimestamp(itemListed.endTime.add(toBN(1)).toNumber())
    const amountOffer = itemListed.currentPrice.add(toBN(1))
    await this.FxEthersTokenInstance.approve(this.FxMarketplaceInstance.address, MAX_UINT_256, { from: this.account4 })
    await reverts(
      this.FxMarketplaceInstance.makeAnOffer(
        this.FxNFTInstance.address,
        tokenId,
        this.FxEthersTokenInstance.address,
        amountOffer,
        { from: this.account4 }
      ),
      "FxMarketplace: SALE_ENDED",
    )
  })

  it('Should be able to take own item after end time', async () => {
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const PERCENTAGE = await this.FxMarketplaceInstance.PERCENTAGE()
    const serviceFeePercent = await this.FxMarketplaceInstance.serviceFeePercent()

    const balanceOfSellerBefore = await this.FxEthersTokenInstance.balanceOf(this.account1)
    const balanceOfTreasuryBefore = await this.FxEthersTokenInstance.balanceOf(this.TreasuryInstance.address)
    const itemListedBefore = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    await this.FxMarketplaceInstance.takeOwnItem(
      this.FxNFTInstance.address,
      tokenId,
      this.account3,
      { from: this.account3 },
    )

    const ownerOfTokenIdAfter = await this.FxNFTInstance.ownerOf(tokenId)
    const balanceOfSellerAfter = await this.FxEthersTokenInstance.balanceOf(this.account1)
    const balanceOfTreasuryAfter = await this.FxEthersTokenInstance.balanceOf(this.TreasuryInstance.address)
    const itemListedAfter = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    assert.equal(
      ownerOfTokenIdAfter.toString(),
      this.account3.toString(),
      'Purchaser does not have NFT token exactly'
    )
    assert.equal(
      itemListedBefore.currentPrice.sub(itemListedBefore.currentPrice.mul(serviceFeePercent).div(PERCENTAGE)).toString(),
      balanceOfSellerAfter.sub(balanceOfSellerBefore).toString(),
      'Seller does not receive token payment exactly'
    )
    assert.equal(
      balanceOfTreasuryAfter.sub(balanceOfTreasuryBefore).toString(),
      itemListedBefore.currentPrice.mul(serviceFeePercent).div(PERCENTAGE).toString(),
      'Treasury does not receive token payment exactly'
    )
    assert.equal(
      itemListedAfter.paymentToken.toLowerCase(),
      ADDRESS_ZERO.toLowerCase(),
      'PaymentToken does not set exactly'
    )
    assert.equal(
      itemListedAfter.seller.toLowerCase(),
      ADDRESS_ZERO.toLowerCase(),
      'Seller does not set exactly'
    )
    assert.equal(
      itemListedAfter.bidder.toLowerCase(),
      ADDRESS_ZERO.toLowerCase(),
      'Purchaser does not set exactly'
    )
    assert.equal(
      itemListedAfter.startTime.toString(),
      ZERO.toString(),
      'Start time does not set exactly'
    )
    assert.equal(
      itemListedAfter.endTime.toString(),
      ZERO.toString(),
      'End time does not set exactly'
    )
    assert.equal(
      itemListedAfter.startPrice.toString(),
      ZERO.toString(),
      'Start price does not set exactly'
    )
    assert.equal(
      itemListedAfter.currentPrice.toString(),
      ZERO.toString(),
      'Last price does not set exactly'
    )
  })

  it('Should be able to list that item for sale again', async () => {
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    await this.FxNFTInstance.approve(this.FxMarketplaceInstance.address, tokenId, { from: this.account3 })

    const timestamp = await getBlockTimestamp()
    const endTime = timestamp + 60 * 60 * 24 // 60s * 60m * 24h
    const startPrice = parseEther('1')
    await this.FxMarketplaceInstance.listForSale(
      this.FxNFTInstance.address,
      tokenId,
      timestamp,
      endTime,
      this.FxEthersTokenInstance.address,
      startPrice,
      { from: this.account3 }
    )
    const itemListed = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    assert.equal(
      itemListed.paymentToken.toLowerCase(),
      this.FxEthersTokenInstance.address.toLowerCase(),
      'PaymentToken does not set exactly'
    )
    assert.equal(
      itemListed.seller.toLowerCase(),
      this.account3.toLowerCase(),
      'Seller does not set exactly'
    )
    assert.equal(
      itemListed.paymentToken,
      this.FxEthersTokenInstance.address,
      'PaymentToken does not set exactly'
    )
    assert.equal(
      itemListed.startTime.toString(),
      timestamp.toString(),
      'Start time does not set exactly'
    )
    assert.equal(
      itemListed.endTime.toString(),
      endTime.toString(),
      'End time does not set exactly'
    )
    assert.equal(
      itemListed.startPrice.toString(),
      startPrice.toString(),
      'Start price does not set exactly'
    )
    assert.equal(
      itemListed.startPrice.toString(),
      itemListed.currentPrice.toString(),
      'Last price does not set exactly'
    )
  })

  it('Should be able to make an offer', async () => {
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))
    const itemListedBefore = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)
    const amountOffer = itemListedBefore.currentPrice.add(parseEther('1'))

    await this.FxEthersTokenInstance.approve(this.FxMarketplaceInstance.address, MAX_UINT_256, { from: this.account2 })
    await this.FxMarketplaceInstance.makeAnOffer(
      this.FxNFTInstance.address,
      tokenId,
      this.FxEthersTokenInstance.address,
      amountOffer,
      { from: this.account2 }
    )
    const itemListedAfter = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    assert.equal(
      itemListedAfter.currentPrice.toString(),
      amountOffer.toString(),
      'Amount Offer does not set exactly'
    )
    assert.equal(
      itemListedAfter.bidder.toString(),
      this.account2.toString(),
      'Purchaser does not set exactly'
    )
  })

  it('Should be able to cancel item listed', async () => {
    const totalSupply = await this.FxNFTInstance.totalSupply()
    const tokenId = totalSupply.sub(toBN(1))

    await this.FxMarketplaceInstance.cancelListed(
      this.FxNFTInstance.address,
      tokenId,
      { from: this.account3 }
    )
    const itemListed = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    assert.equal(
      itemListed.paymentToken.toLowerCase(),
      ADDRESS_ZERO.toLowerCase(),
      'PaymentToken does not set exactly'
    )
    assert.equal(
      itemListed.seller.toLowerCase(),
      ADDRESS_ZERO.toLowerCase(),
      'Seller does not set exactly'
    )
    assert.equal(
      itemListed.bidder.toLowerCase(),
      ADDRESS_ZERO.toLowerCase(),
      'Purchaser does not set exactly'
    )
    assert.equal(
      itemListed.startTime.toString(),
      ZERO.toString(),
      'Start time does not set exactly'
    )
    assert.equal(
      itemListed.endTime.toString(),
      ZERO.toString(),
      'End time does not set exactly'
    )
    assert.equal(
      itemListed.startPrice.toString(),
      ZERO.toString(),
      'Start price does not set exactly'
    )
    assert.equal(
      itemListed.currentPrice.toString(),
      ZERO.toString(),
      'Last price does not set exactly'
    )
  })
})