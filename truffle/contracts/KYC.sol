// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KYC
 * @dev KYC contract handles the white list for Crowdsale contract
 * Only accounts in KYC contract can buy my token.
 */

contract KYC is Ownable {
    mapping(address => bool) allowed;

    event Registered(address indexed _address);
    event Unregistered(address indexed _address);

    function register(address _address) public onlyOwner {
        allowed[_address] = true;
        emit Registered(_address);
    }

    function unregister(address _address) public onlyOwner {
        allowed[_address] = false;
        emit Unregistered(_address);
    }

    function isRegister(address _address) public view returns(bool){
        return allowed[_address];
    }
}