// truffle migrate -f 0001 --to 0001 --network fuji
// truffle run verify ControlTower@0x5888EBC8D57D6a1785BBDD04Cf58282de0CBe72D --network fuji

module.exports = async (deployer) => {
  const ControlTower = artifacts.require("ControlTower")

  await deployer.deploy(ControlTower)
  const ControlTowerInstance = await ControlTower.deployed()

  console.log({
    "ControlTower deployed at": ControlTowerInstance.address
  })
}
