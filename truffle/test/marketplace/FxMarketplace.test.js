// ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0
// truffle test ./test/marketplace/FxMarketplace.test.js --network development --compile-none --migrations_directory migrations_null

const { assert } = require('chai')
const { reverts } = require('truffle-assertions')

const toBN = (number) => new web3.utils.toBN(number)
const parseEther = (number) => new web3.utils.toWei(toBN(number), 'ether')


contract('FxMarketplace.test', async (accounts) => {
  before(async () => {
    const ControlTower = artifacts.require("ControlTower")
    const Treasury = artifacts.require("Treasury")
    const FxMarketplace = artifacts.require("FxMarketplace")
    const FxEthersToken = artifacts.require("FxEthersToken")
    const FxNFT = artifacts.require("FxNFT")

    this.accountOwner = accounts[0]
    this.account1 = accounts[1]
    this.baseUri = 'https://nft.fxethers.com/'

    this.ControlTowerInstance = await ControlTower.new()
    this.TreasuryInstance = await Treasury.new(this.ControlTowerInstance.address)

    this.initialSupply = parseEther('1000000')
    this.FxEthersTokenInstance = await FxEthersToken.new(
      this.initialSupply,                 // uint initialSupply,
      this.TreasuryInstance.address,      // address _treasury,
      this.ControlTowerInstance.address,  // ControlTower _controlTower
    )

    this.FxNFTInstance = await FxNFT.new(
      this.ControlTowerInstance.address,  // ControlTower _controlTower
      this.baseUri,                       // string memory _baseUri
    )

    this.FxMarketplaceInstance = await FxMarketplace.new(
      this.TreasuryInstance.address,      // address payable _treasury
      this.rate,                          // uint _rate
      this.FxEthersTokenInstance.address, // IERC20 _token
      this.ControlTowerInstance.address,  // ControlTower _controlTower
    )
  })
})