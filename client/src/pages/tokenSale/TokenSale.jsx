import { useEffect, useState } from 'react'
import { useEth } from '../../contexts'
import { usePageTitle } from '../../hooks'
import { BUTTON_STATE, REGEX_NUMBER, MULTIPLE, FxETH_DECIMALS } from '../../utils'
import { isAddress, parseUnits, formatUnits } from 'ethers/lib/utils'
import { ButtonSubmit, Footer } from '../../components'

function TokenSale(props) {
  const { pageTitle } = props
  usePageTitle(pageTitle)
  const [addressWhiteList, setAddressWhiteList] = useState('')
  const [amount, setAmount] = useState('')
  const [amountInWei, setAmountInWei] = useState('0')
  const [amountUnit, setAmountUnit] = useState('ether')
  const [tokensAmount, setTokensAmount] = useState('0')
  const [tokensBalance, setTokensBalance] = useState('0')
  const [addressBeneficiary, setAddressBeneficiary] = useState('')
  const [buttonWhiteListState, setButtonWhiteListState] = useState(BUTTON_STATE.DISABLE)
  const [buttonBuyNowState, setButtonBuyNowState] = useState(BUTTON_STATE.DISABLE)
  const { eth } = useEth()

  const calcTokenAmount = async (amountInWei, FxTokenSaleContract) => {
    try {
      const rate = await FxTokenSaleContract.rate()
      const newTokensAmount = amountInWei.mul(rate).div(MULTIPLE).toString()
      setTokensAmount(formatUnits(newTokensAmount, FxETH_DECIMALS))
    } catch (error) { }
  }

  useEffect(() => {
    calcTokenAmount(amountInWei, eth.FxTokenSaleContract)
    return () => setTokensAmount('0')
  }, [amountInWei, eth.FxTokenSaleContract])

  useEffect(() => {
    const calcTokenBalance = async () => {
      try {
        const balance = await eth.FxEthersTokenContract.balanceOf(eth.account)
        setTokensBalance(formatUnits(balance, FxETH_DECIMALS))
      } catch (error) { }
    }
    const calcTokenBalanceInterval = setInterval(() => calcTokenBalance(), 2000)
    return () => clearInterval(calcTokenBalanceInterval)
  }, [eth.FxEthersTokenContract, eth.account])

  const handleInputWhiteListChange = event => {
    const value = event.target.value.trim()
    setAddressWhiteList(value)
    isAddress(value)
      ? setButtonWhiteListState(BUTTON_STATE.ENABLE)
      : setButtonWhiteListState(BUTTON_STATE.DISABLE)
  }

  const handleInputBeneficiaryChange = event => {
    const value = event.target.value.trim()
    setAddressBeneficiary(value)
    isAddress(value)
      ? setButtonBuyNowState(BUTTON_STATE.ENABLE)
      : setButtonBuyNowState(BUTTON_STATE.DISABLE)
  }

  const handleInputAmountChange = event => {
    const value = event.target.value.trim()
    if (REGEX_NUMBER.test(value)) setAmount(value)
    try {
      const amountInWei = parseUnits(value, amountUnit);
      setAmountInWei(amountInWei)
      if (amountInWei.gt(0)) setButtonBuyNowState(BUTTON_STATE.ENABLE)
    } catch (error) {
      setButtonBuyNowState(BUTTON_STATE.DISABLE)
    }
  }

  const handleInputAmountUnitChange = event => {
    const unit = event.target.value
    try {
      const amountInWei = parseUnits(amount, unit);
      setAmountInWei(amountInWei)
      if (amountInWei.gt(0)) setButtonBuyNowState(BUTTON_STATE.ENABLE)
    } catch (error) {
      setButtonBuyNowState(BUTTON_STATE.DISABLE)
    }
    setAmountUnit(unit)
  }

  const resetButtonWhiteListState = () => {
    setButtonWhiteListState(BUTTON_STATE.ENABLE)
  }

  const resetButtonBuyNowState = () => {
    setButtonBuyNowState(BUTTON_STATE.ENABLE)
  }

  const handleWhiteListSubmit = (event) => {
    event.preventDefault()
    setButtonWhiteListState(BUTTON_STATE.PENDING)
    eth.ControlTowerContract.addToWhitelist(addressWhiteList)
      .then(tx => {
        setButtonWhiteListState(BUTTON_STATE.DONE)
        console.log(tx)
      })
      .catch(error => {
        setButtonWhiteListState(BUTTON_STATE.REJECTED)
        console.error(error)
      })
  }

  const handleBuyNowSubmit = (event) => {
    event.preventDefault()
    setButtonBuyNowState(BUTTON_STATE.PENDING)
    eth.FxTokenSaleContract.buyTokens(addressBeneficiary, { value: amountInWei })
      .then(tx => {
        setButtonBuyNowState(BUTTON_STATE.DONE)
        console.log(tx)
      })
      .catch(error => {
        setButtonBuyNowState(BUTTON_STATE.REJECTED)
        console.error(error)
      })
  }

  return (
    <>
      <div className='container text-center' style={{ minHeight: '80vh' }}>
        <div className='col-12 col-md-8 col-lg-6 mx-0 mx-md-3 mx-lg-5 my-5'>
          <h1><strong>FxETH TOKEN SALE</strong></h1>
          <br />
          <h4>KYC WHITELISTING</h4>
          <form onSubmit={handleWhiteListSubmit}>
            <div className='form-group my-3'>
              <label htmlFor='addressWhiteList' className='fw-bold'>
                Allow to
              </label>
              <br />
              <small className='text-muted'>
                Account who can buy FxETH token
              </small>
              <input
                name='addressWhiteList'
                id='addressWhiteList'
                value={addressWhiteList}
                onChange={handleInputWhiteListChange}
                type='text'
                autoComplete='off'
                autoCorrect='off'
                className='form-control text-center'
                placeholder='Hexadecimal address (0x...)'
                maxLength='42'
                required
              />
            </div>
            <ButtonSubmit title={'ADD TO WHITELIST'} buttonState={buttonWhiteListState} resetState={resetButtonWhiteListState} />
          </form>

          <h4 className='mt-5'>BUY FxETH TOKENS</h4>
          <form onSubmit={handleBuyNowSubmit}>
            <div className='form-group my-3'>
              <label htmlFor='address' className='fw-bold'>
                Beneficiary
              </label>
              <br />
              <small className='text-muted'>
                Recipient of the token purchase
              </small>
              <input
                name='addressBeneficiary'
                id='addressBeneficiary'
                value={addressBeneficiary}
                onChange={handleInputBeneficiaryChange}
                type='text'
                autoComplete='off'
                autoCorrect='off'
                className='form-control text-center'
                placeholder='Hexadecimal address (0x...)'
                maxLength='42'
                required
              />
            </div>

            <div className='row my-3'>
              <div className='col'>
                <div className='form-group'>
                  <label htmlFor='amount' className='fw-bold'>
                    Amount
                  </label>
                  <br />
                  <small className='text-muted'>
                    Value ETH to be converted into FxETH tokens
                  </small>
                  <input
                    name='amount'
                    id='amount'
                    onChange={handleInputAmountChange}
                    type='text'
                    className='form-control'
                    value={amount}
                    maxLength='79'
                    required
                  />
                </div>
              </div>

              <div className='col-4'>
                <div className='form-group'>
                  <label htmlFor='unit' className='fw-bold'>
                    Unit
                  </label>
                  <br />
                  <small className='text-muted'>
                    Amount in
                  </small>
                  <select
                    className='form-control'
                    onChange={handleInputAmountUnitChange}
                    name='unit'
                    id='unit'
                    defaultValue={amountUnit}
                  >
                    <option value='wei'>Wei</option>
                    <option value='gwei'>Gwei</option>
                    <option value='ether'>Ether</option>
                  </select>
                </div>
              </div>
            </div>
            <p>You already have {tokensBalance.toString()} FxETH tokens | You will buy {tokensAmount.toString()} FxETH</p>
            <ButtonSubmit title={'BUY NOW'} buttonState={buttonBuyNowState} resetState={resetButtonBuyNowState} />
          </form>
        </div>
      </div >
      <Footer />
    </>
  )
}

export { TokenSale }
