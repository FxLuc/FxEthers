// ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0
// truffle test ./test/marketplace/FxMarketplace.test.js --network development --compile-none --migrations_directory migrations_null

const { assert } = require('chai')
const { reverts } = require('truffle-assertions')
const { isZeroAddress } = require('ethereumjs-util');

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
const MAX_UINT_256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

const toBN = (number) => new web3.utils.toBN(number)
const parseEther = (number) => new web3.utils.toWei(toBN(number), 'ether')
const getBlockTimestamp = async () => (await web3.eth.getBlock('latest')).timestamp;
const increaseTimestamp = async (seconds) => {
  const blockTimestamp = await getBlockTimestamp()
  return new Promise((resolve, reject) => web3.currentProvider.send(
    {
      jsonrpc: "2.0",
      method: "evm_mine",
      params: [blockTimestamp + seconds],
      id: blockTimestamp,
    },
    (error, result) => error ? reject(error) : resolve(result),
  ))
}
const mineToTimestamp = async (blockTimestamp) => {
  return new Promise((resolve, reject) => web3.currentProvider.send(
    {
      jsonrpc: "2.0",
      method: "evm_mine",
      params: [blockTimestamp],
      id: blockTimestamp,
    },
    (error, result) => error ? reject(error) : resolve(result),
  ))
}

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
      this.baseUri,                       // string memory _baseUri
    )

    this.FxMarketplaceInstance = await FxMarketplace.new(
      this.ControlTowerInstance.address,  // ControlTower _controlTower
      this.TreasuryInstance.address,      // address _treasury
    )

    await this.TreasuryInstance.transfer(this.FxEthersTokenInstance.address, this.account1, parseEther('100'))
    await this.TreasuryInstance.transfer(this.FxEthersTokenInstance.address, this.account2, parseEther('100'))
    await this.TreasuryInstance.transfer(this.FxEthersTokenInstance.address, this.account3, parseEther('100'))
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
    await this.FxNFTInstance.mint(this.account1)
    const currentTokenId = await this.FxNFTInstance.currentTokenId()
    const tokenId = currentTokenId.sub(toBN(1))
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
    assert.isTrue(
      isZeroAddress(itemListed.lastPurchaser),
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
      itemListed.lastPrice.toString(),
      'End price does not set exactly'
    )
  })

  it('Should be able to make an offer by user 1', async () => {
    const currentTokenId = await this.FxNFTInstance.currentTokenId()
    const tokenId = currentTokenId.sub(toBN(1))
    const itemListedBefore = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)
    const amountOffer = itemListedBefore.lastPrice.add(parseEther('1'))

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
      itemListedAfter.lastPrice.toString(),
      amountOffer.toString(),
      'Amount Offer does not set exactly'
    )
    assert.equal(
      itemListedAfter.lastPurchaser.toString(),
      this.account2.toString(),
      'Purchaser does not set exactly'
    )
  })

  it('Should be able to make an offer by user 2', async () => {
    const currentTokenId = await this.FxNFTInstance.currentTokenId()
    const tokenId = currentTokenId.sub(toBN(1))
    const itemListedBefore = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)
    const amountOffer = itemListedBefore.lastPrice.add(parseEther('1'))

    await this.FxEthersTokenInstance.approve(this.FxMarketplaceInstance.address, MAX_UINT_256, { from: this.account3 })
    await this.FxMarketplaceInstance.makeAnOffer(
      this.FxNFTInstance.address,
      tokenId,
      this.FxEthersTokenInstance.address,
      amountOffer,
      { from: this.account3 }
    )
    const itemListedAfter = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    assert.equal(
      itemListedAfter.lastPrice.toString(),
      amountOffer.toString(),
      'Amount Offer does not set exactly'
    )
    assert.equal(
      itemListedAfter.lastPurchaser.toString(),
      this.account3.toString(),
      'Purchaser does not set exactly'
    )
  })


  it('Should be able to take own item after end time', async () => {
    const currentTokenId = await this.FxNFTInstance.currentTokenId()
    const tokenId = currentTokenId.sub(toBN(1))
    const PERCENTAGE = await this.FxMarketplaceInstance.PERCENTAGE()
    const serviceFeePercent = await this.FxMarketplaceInstance.serviceFeePercent()

    const balanceOfSellerBefore = await this.FxEthersTokenInstance.balanceOf(this.account1)
    const itemListedBefore = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)

    await mineToTimestamp(itemListedBefore.endTime.add(toBN(1)).toNumber())

    await this.FxMarketplaceInstance.takeOwnItem(
      this.FxNFTInstance.address,
      tokenId,
      this.account3,
      { from: this.account3 },
    )

    const ownerOfTokenIdAfter = await this.FxNFTInstance.ownerOf(tokenId)
    const balanceOfSellerAfter = await this.FxEthersTokenInstance.balanceOf(this.account1)
    const itemListedAfter = await this.FxMarketplaceInstance.listed(this.FxNFTInstance.address, tokenId)
    
    assert.equal(
      ownerOfTokenIdAfter.toString(),
      this.account3.toString(),
      'Purchaser does not have NFT token exactly'
    )
    assert.equal(
      itemListedBefore.lastPrice.sub(itemListedBefore.lastPrice.mul(serviceFeePercent).div(PERCENTAGE)).toString(),
      balanceOfSellerAfter.sub(balanceOfSellerBefore).toString(),
      'Seller does not receive token payment exactly'
    )

  })
})