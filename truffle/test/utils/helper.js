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

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
const ZERO = toBN(0)
const MAX_UINT_256 = toBN('115792089237316195423570985008687907853269984665640564039457584007913129639935')

module.exports = {
    ADDRESS_ZERO,
    ZERO,
    MAX_UINT_256,
    toBN,
    parseEther,
    getBlockTimestamp,
    increaseTimestamp,
    mineToTimestamp,
}