import { BigNumber } from "ethers"

const toBN = (value) => BigNumber.from(value.toString())
const getBlockTimestamp = () => Math.floor((new Date()).getTime() / 1000.0)

export {
    toBN,
    getBlockTimestamp,
}