import { useState, createContext, useEffect, useCallback, useContext } from 'react'
import { ethers } from "ethers";

const EthContext = createContext()

function EthProvider({ children }) {
  const [eth, setEth] = useState({ artifacts: undefined })

  const init = useCallback(
    async artifacts => {
      let provider, signer, account, network, KycContract, FethTokenContract, TokenSaleContract
      try {
        if (window.ethereum) {
          provider = new ethers.providers.Web3Provider(window.ethereum)
          const accounts = await provider.send("eth_requestAccounts", [])
          account = accounts[0]
          signer = provider.getSigner()
          network = await provider.getNetwork()
          const kycAddress = artifacts.KYC.networks[network.chainId].address
          KycContract = new ethers.Contract(kycAddress, artifacts.KYC.abi, signer)

          const tokenAddress = artifacts.FethToken.networks[network.chainId].address
          FethTokenContract = new ethers.Contract(tokenAddress, artifacts.FethToken.abi, signer)

          const tokenSaleAddress = artifacts.TokenSale.networks[network.chainId].address
          TokenSaleContract = new ethers.Contract(tokenSaleAddress, artifacts.TokenSale.abi, signer)
        } else {
          provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURA_API_KEY)
          network = await provider.getNetwork()

          const kycAddress = artifacts.KYC.networks[network.chainId].address
          KycContract = new ethers.Contract(kycAddress, artifacts.KYC.abi, provider)

          const tokenAddress = artifacts.FethToken.networks[network.chainId].address
          FethTokenContract = new ethers.Contract(tokenAddress, artifacts.FethToken.abi, provider)

          const tokenSaleAddress = artifacts.TokenSale.networks[network.chainId].address
          TokenSaleContract = new ethers.Contract(tokenSaleAddress, artifacts.TokenSale.abi, provider)
        }
      } catch (err) {
        if (network.chainId !== process.env.REACT_APP_DEFAULT_CHAIN) console.error('UNSUPPORTED NETWORK CHAIN ID: ', network.chainId)
        console.error(err)
      }
      setEth({ artifacts, provider, signer, account, network, KycContract, FethTokenContract, TokenSaleContract })
    }, [])

  // useEffect(() => {
  //   const isConnected = localStorage.getItem('isConnected')
  //   setIsConnected(isConnected ? false : true)
  // }, [init])

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifacts = {
          KYC: require('../contracts/KYC.json'),
          FethToken: require('../contracts/FETHToken.json'),
          TokenSale: require('../contracts/TokenSale.json'),
        }
        init(artifacts);
      } catch (err) {
        console.error(err);
      }
    };
    tryInit();
  }, [init]);

  useEffect(() => {
    if (window.ethereum) {
      const events = ["chainChanged", "accountsChanged"]
      const handleChange = () => init(eth.artifacts)
      events.forEach(e => window.ethereum.on(e, handleChange))
      return () => {
        events.forEach(e => window.ethereum.removeListener(e, handleChange))
      }
    }
  }, [init, eth.artifacts, eth.accounts])

  return (
    <EthContext.Provider value={{ eth, setEth }}>
      {children}
    </EthContext.Provider>
  )
}

function useEth() {
  return useContext(EthContext);
}

export {
  EthProvider,
  EthContext,
  useEth,
}
