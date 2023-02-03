// SPDX-License-Identifier: MIT
// FxEthers Contracts (last updated v1.0)

pragma solidity ^0.8.0;

abstract contract Blacklist {
    mapping(address => bool) blacklisting;

    event AddToBlacklist(address indexed account);
    event RemoveFromBlacklist(address indexed account);

    function isInBlacklist(address account) public view returns (bool) {
        return blacklisting[account];
    }

    function _addToBlacklist(address account) internal virtual {
        blacklisting[account] = true;
        emit AddToBlacklist(account);
    }

    function _removeFromBlacklist(address account) internal virtual {
        blacklisting[account] = false;
        emit RemoveFromBlacklist(account);
    }
}