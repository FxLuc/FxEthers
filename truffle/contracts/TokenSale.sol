// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Crowdsale.sol";
import "./KYC.sol";

contract TokenSale is Crowdsale {
    KYC kyc;

    constructor(
        uint256 _rate,
        address _wallet,
        IERC20 _token,
        KYC _kyc
    ) Crowdsale(_rate, _wallet, _token) {
        kyc = _kyc;
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view override {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(kyc.isRegister(msg.sender), "MyTokenSale: NOT_ALLOWED");
    }
}
