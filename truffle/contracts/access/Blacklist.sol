// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ControlTower.sol";

contract Blacklist {
    ControlTower public controlTower;

    mapping(address => bool) blacklisted;

    event Registered(address indexed account);
    event Unregistered(address indexed account);

    constructor (ControlTower _controlTower) {
        controlTower = _controlTower;
    }

    function register(address account) external {
        controlTower.onlyOperator();
        blacklisted[account] = true;
        emit Registered(account);
    }

    function unregister(address account) external {
        controlTower.onlyOperator();
        blacklisted[account] = false;
        emit Unregistered(account);
    }

    function isRegister(address account) external view returns(bool){
        return blacklisted[account];
    }
}