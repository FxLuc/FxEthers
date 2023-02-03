// truffle migrate -f 0002 --to 0002 --network fuji

// truffle run verify ControlTower@0x06E22fEA735AE860B7bb1869a6ED321B6f419861 --network fuji
// truffle run verify Treasury@0x40B3b28fBd673EB0C2099C41450F6d5B97b677A7 --network fuji
// truffle run verify FxEthersToken@0x8fd342B914843F21364878183EA980D39D345205 --network fuji
// truffle run verify FxTokenSale@0xC0037959c4505560f9e7CF47a7aBaD9c09193b5f --network fuji
// truffle run verify FxNFT@0x57cC1a0922387E324eAdf3Eb6aA3C31Ca59dA52D --network fuji
// truffle run verify FxMarketplace@0xF3A67633D9dc82AeffE86dfa7e820839e9E4B484 --network fuji

module.exports = async (deployer) => {
  const toBN = (number) => new web3.utils.toBN(number)
  const parseEther = (number) => new web3.utils.toWei(toBN(number), 'ether')

  const MAX_UINT_256 = toBN('115792089237316195423570985008687907853269984665640564039457584007913129639935')

  const ControlTower = artifacts.require('ControlTower')
  const Treasury = artifacts.require('Treasury')
  const FxEthersToken = artifacts.require('FxEthersToken')
  const FxTokenSale = artifacts.require("FxTokenSale")
  const FxNFT = artifacts.require('FxNFT')
  const FxMarketplace = artifacts.require('FxMarketplace')

  await deployer.deploy(ControlTower)
  const ControlTowerInstance = await ControlTower.deployed()
  console.log({
    "ControlTower deployed at": ControlTowerInstance.address
  })

  await deployer.deploy(Treasury, ControlTowerInstance.address)
  const TreasuryInstance = await Treasury.deployed()
  console.log({
    "Treasury deployed at": TreasuryInstance.address
  })

  const initialSupply = parseEther('1000000')
  await deployer.deploy(
    FxEthersToken,
    initialSupply,
    TreasuryInstance.address,
    ControlTowerInstance.address,
  )
  const FxEthersTokenInstance = await FxEthersToken.deployed()
  console.log({
    "FxEthersToken deployed at": FxEthersTokenInstance.address
  })

  const rate = toBN('500000000000000000') // 2 ether - 1 tokens
  await deployer.deploy(
    FxTokenSale,
    TreasuryInstance.address,
    rate,
    FxEthersTokenInstance.address,
    ControlTowerInstance.address,
  )
  const FxTokenSaleInstance = await FxTokenSale.deployed()

  console.log({
    "FxTokenSale deployed at": FxTokenSaleInstance.address
  })
  await TreasuryInstance.approve(FxEthersTokenInstance.address, FxTokenSaleInstance.address, MAX_UINT_256)

  const baseUri = 'https://nft.fxethers.com/'
  await deployer.deploy(
    FxNFT,
    ControlTowerInstance.address,
    TreasuryInstance.address,
    baseUri,
  )
  const FxNFTInstance = await FxNFT.deployed()
  console.log({
    "FxNFT deployed at": FxNFTInstance.address
  })

  await deployer.deploy(
    FxMarketplace,
    ControlTowerInstance.address,
    TreasuryInstance.address,
  )
  const FxMarketplaceInstance = await FxMarketplace.deployed()

  console.log({
    "FxMarketplace deployed at": FxMarketplaceInstance.address
  })
}
