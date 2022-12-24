// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract Whitelist {
    mapping(address => bool) public whitelisting;

    event AddToWhitelist(address indexed account);
    event RemoveFromWhitelist(address indexed account);

    function isInWhitelist(address account) public view returns (bool) {
        return whitelisting[account];
    }

    function _addToWhitelist(address account) internal virtual {
        whitelisting[account] = true;
        emit AddToWhitelist(account);
    }

    function _removeFromWhitelist(address account) internal virtual {
        whitelisting[account] = false;
        emit RemoveFromWhitelist(account);
    }
}