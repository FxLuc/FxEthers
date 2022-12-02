import React from 'react'
import { useEth } from '../../contexts';
import { ToastAutoHide } from '../Toat';

function Footer() {
    const { eth } = useEth()

    return (
        <div className="d-flex flex-column bg-primary text-light">
            <div className='container'>
                <div className='row py-1'>
                    <div className='col-12 col-md text-center text-md-start'>
                        <img
                            src="/logo/F_blue_bgwhite.jpg"
                            alt="FxEthers logo"
                            width="42"
                            height="42"
                            className="d-inline-block align-top mt-2"
                        />
                        <p className='fw-bold fs-5 mb-0'>FxEthers</p>
                        <p>FETH token crowdsale.</p>

                        <p>FETH Token Contract: { }
                            <ToastAutoHide
                                message='Copy this contract address'
                                feedback='Copied to clipboard!'
                                title={eth.FethTokenContract?.address}
                                content={eth.FethTokenContract?.address}
                            />
                        </p>
                        <p>Token Sale Contract: { }
                            <ToastAutoHide
                                message='Copy this contract address'
                                feedback='Copied to clipboard!'
                                title={eth.TokenSaleContract?.address}
                                content={eth.TokenSaleContract?.address}
                            />
                        </p>
                        <p>KYC Contract: { }
                            <ToastAutoHide
                                message='Copy this contract address'
                                feedback='Copied to clipboard!'
                                title={eth.KycContract?.address}
                                content={eth.KycContract?.address}
                            />
                        </p>
                        <p>Your address: { }
                            <ToastAutoHide
                                message='Copy your address'
                                feedback='Copied to clipboard!'
                                title={eth.account}
                                content={eth.account}
                            />
                        </p>
                    </div>
                    <div className='d-none d-sm-block col-sm text-end'>
                    </div>
                </div>
                <hr className='m-0' />
                <div className='row pt-1 pb-2'>
                    <div className='col-12 col-sm text-center text-sm-start'>
                        © 2022 <a href='https://github.com/fxluc' className='text-light'>Le Tuan Luc</a>
                    </div>
                    <div className='col-12 col-sm text-center text-sm-end'>
                        <a href='#privacy-policy' className='text-light me-3'>Privacy Policy</a>
                        <a href='#privacy-policy' className='text-light'>Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Footer;