// truffle run verify KYC@0x5888EBC8D57D6a1785BBDD04Cf58282de0CBe72D --network goerli
// truffle run verify FethToken@0x956e7d7e5cdEB802fd231B969430016b2D9595FA --network goerli
// truffle run verify TokenSale@0x9b08D6D7785c9Ffe43F0b4847f0777AbD0bda72D --network goerli
const KYC = artifacts.require("KYC");
const FethToken = artifacts.require("FethToken");
const TokenSale = artifacts.require("TokenSale");
const { RATE, INITIAL_SUPPLY } = require('../utils/constants')

module.exports = async (deployer) => {
  const accounts = await web3.eth.getAccounts();
  await deployer.deploy(KYC);
  await deployer.deploy(FethToken, INITIAL_SUPPLY);
  await deployer.deploy(TokenSale, RATE, accounts[0], FethToken.address, KYC.address);
  const FethTokenInstance = await FethToken.deployed();
  const deployerTokenBalance = await FethTokenInstance.balanceOf(accounts[0])
  await FethTokenInstance.transfer(TokenSale.address, deployerTokenBalance)
};
