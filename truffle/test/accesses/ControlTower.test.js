// ganache-cli --fork https://api.avax-test.network/ext/bc/C/rpc -a 10 -l 80000000 -e 1000000 -b 0 --miner.timestampIncrement=0
// truffle test ./test/access/ControlTower.test.js --network development --compile-none --migrations_directory migrations_null
const { assert } = require('chai')
const { reverts } = require('truffle-assertions')

contract('ControlTower.test', async (accounts) => {
  const [accountOwner, account1, account2] = accounts

  before(async () => {
    const ControlTower = artifacts.require("ControlTower")
    this.ControlTowerInstance = await ControlTower.new()
  })

  it('Should account owner is role admin as default', async () => {
    const defaultAdminRole = await this.ControlTowerInstance.DEFAULT_ADMIN_ROLE()
    const hasRole = await this.ControlTowerInstance.hasRole(defaultAdminRole, accountOwner)
    assert.isTrue(hasRole, 'Role admin default does not set exactly')
  })

  it('Should account owner is role operator as default', async () => {
    const operatorRole = await this.ControlTowerInstance.OPERATOR_ROLE()
    const hasRole = await this.ControlTowerInstance.hasRole(operatorRole, accountOwner)
    assert.isTrue(hasRole, 'Role admin operator does not set exactly')
  })

  it('Should account owner is role treasury as default', async () => {
    const treasuryRole = await this.ControlTowerInstance.TREASURER_ROLE()
    const hasRole = await this.ControlTowerInstance.hasRole(treasuryRole, accountOwner)
    assert.isTrue(hasRole, 'Role admin treasury does not set exactly')
  })

  it('Should account owner is role moderator as default', async () => {
    const moderatorRole = await this.ControlTowerInstance.MODERATOR_ROLE()
    const hasRole = await this.ControlTowerInstance.hasRole(moderatorRole, accountOwner)
    assert.isTrue(hasRole, 'Role admin operator does not set exactly')
  })

  it('Should be able to add account to whitelist', async () => {
    await this.ControlTowerInstance.addToWhitelist(account1)
    const isInWhitelist = await this.ControlTowerInstance.isInWhitelist(account1)
    assert.isTrue(isInWhitelist, 'Whitelist does not set exactly')
  })

  it('Should be able to add account to blacklist', async () => {
    await this.ControlTowerInstance.addToBlacklist(account1)
    const isInBlacklist = await this.ControlTowerInstance.isInBlacklist(account1)
    assert.isTrue(isInBlacklist, 'Whitelist does not set exactly')
  })

  it('Should be able to set role member by admin role', async () => {
    const operatorRole = await this.ControlTowerInstance.OPERATOR_ROLE()
    await this.ControlTowerInstance.grantRole(operatorRole, account1)
    const hasRole = await this.ControlTowerInstance.hasRole(operatorRole, account1)
    assert.isTrue(hasRole, 'Role admin operator does not set exactly')
  })

  it('Should be revert when trying to set role member by account not has admin role', async () => {
    const defaultAdminRole = await this.ControlTowerInstance.DEFAULT_ADMIN_ROLE()
    const operatorRole = await this.ControlTowerInstance.OPERATOR_ROLE()
    const revertMessageExpect = `AccessControl: account ${account2.toLowerCase()} is missing role ${defaultAdminRole.toString()}`
    await reverts(
      this.ControlTowerInstance.grantRole(operatorRole, account2, { from: account2 }),
      revertMessageExpect
    )
  })
})