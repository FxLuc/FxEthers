import { constants } from "ethers"

const FxETH_DECIMALS = '18'
const MULTIPLE = constants.WeiPerEther

const DEFAULT_CHAIN = process.env.REACT_APP_DEFAULT_CHAIN

const API_BASE_URI= process.env.REACT_APP_API_BASE_URI
const NFT_BASE_URI= process.env.REACT_APP_NFT_BASE_URI
const RPC_URI= process.env.REACT_APP_RPC_URI

const FAUCET_URI = {
    AVAX: 'https://faucet.avax.network/'
}

export {
    FxETH_DECIMALS,
    MULTIPLE,
    DEFAULT_CHAIN,
    API_BASE_URI,
    NFT_BASE_URI,
    RPC_URI,
    FAUCET_URI
}