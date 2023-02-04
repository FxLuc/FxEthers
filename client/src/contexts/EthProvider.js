import { useState, createContext, useEffect, useCallback, useContext, useMemo } from 'react'
import { ethers } from "ethers"
import { DEFAULT_CHAIN, RPC_URI } from '../utils'

const EthContext = createContext()

function EthProvider({ children }) {
  const [eth, setEth] = useState({ artifacts: undefined })

  const init = useCallback(
    async artifacts => {
      let provider, signer, network, account
      let ControlTowerContract, FxNFTContract, FxEthersTokenContract, FxTokenSaleContract, FxMarketplaceContract
      try {
        if (window.ethereum) {
          provider = new ethers.providers.Web3Provider(window.ethereum)
          const accounts = await provider.send("eth_requestAccounts", [])
          account = accounts[0]
          signer = provider.getSigner()
        } else {
          provider = new ethers.providers.JsonRpcProvider(RPC_URI)
        }
        network = await provider.detectNetwork()

        const signerContract = signer || provider
        let networkChainId = network.chainId
        let contractAddress = artifacts.ControlTower.networks[networkChainId]?.address
        if (!contractAddress) networkChainId = DEFAULT_CHAIN

        contractAddress = artifacts.ControlTower.networks[networkChainId].address
        ControlTowerContract = new ethers.Contract(contractAddress, artifacts.ControlTower.abi, signerContract)

        contractAddress = artifacts.FxNFT.networks[networkChainId].address
        FxNFTContract = new ethers.Contract(contractAddress, artifacts.FxNFT.abi, signerContract)

        contractAddress = artifacts.FxEthersToken.networks[networkChainId].address
        FxEthersTokenContract = new ethers.Contract(contractAddress, artifacts.FxEthersToken.abi, signerContract)

        contractAddress = artifacts.FxTokenSale.networks[networkChainId].address
        FxTokenSaleContract = new ethers.Contract(contractAddress, artifacts.FxTokenSale.abi, signerContract)

        contractAddress = artifacts.FxMarketplace.networks[networkChainId].address
        FxMarketplaceContract = new ethers.Contract(contractAddress, artifacts.FxMarketplace.abi, signerContract)

        // eslint-disable-next-line eqeqeq
        if (network.chainId != DEFAULT_CHAIN) console.error(
          'UNSUPPORTED NETWORK CHAIN ID: ',
          network.chainId,
          '\nREVERT TO AVALANCHE FUJI TESTNET DEFAULT CHAIN ID:',
          Number(DEFAULT_CHAIN)
        )
      } catch (err) {
        console.error(err)
      }
      setEth({
        artifacts,
        provider,
        account,
        signer,
        network,
        ControlTowerContract,
        FxNFTContract,
        FxEthersTokenContract,
        FxTokenSaleContract,
        FxMarketplaceContract
      })
    }, [])

  // useEffect(() => {
  //   const isConnected = localStorage.getItem('isConnected')
  //   setIsConnected(isConnected ? false : true)
  // }, [init])

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifacts = {
          ControlTower: require('../contracts/ControlTower.json'),
          FxNFT: require('../contracts/FxNFT.json'),
          FxEthersToken: require('../contracts/FxEthersToken.json'),
          FxTokenSale: require('../contracts/FxTokenSale.json'),
          FxMarketplace: require('../contracts/FxMarketplace.json'),
        }
        init(artifacts)
      } catch (err) {
        console.error(err)
      }
    }
    tryInit()
  }, [init])

  useEffect(() => {
    if (window.ethereum) {
      const events = ["chainChanged", "accountsChanged"]
      const handleChange = () => init(eth.artifacts)
      events.forEach(e => window.ethereum.on(e, handleChange))
      return () => {
        events.forEach(e => window.ethereum.removeListener(e, handleChange))
      }
    }
  }, [init, eth.artifacts, eth.account])

  const ethContext = useMemo(() => ({ eth, setEth }), [eth])

  return (
    <EthContext.Provider value={ethContext}>
      {children}
    </EthContext.Provider>
  )
}

function useEth() {
  return useContext(EthContext)
}

export {
  EthProvider,
  EthContext,
  useEth,
}
