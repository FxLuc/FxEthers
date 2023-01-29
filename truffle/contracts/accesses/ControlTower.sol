// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Blacklist.sol";
import "./Whitelist.sol";

contract ControlTower is AccessControl, Blacklist, Whitelist {
    bytes32 public constant OPERATOR_ROLE = 0x4f50455241544f525f524f4c4500000000000000000000000000000000000000;
    bytes32 public constant TREASURER_ROLE = 0x5452454153555245525f524f4c45000000000000000000000000000000000000;
    bytes32 public constant MODERATOR_ROLE = 0x4d4f44455241544f525f524f4c45000000000000000000000000000000000000;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(OPERATOR_ROLE, _msgSender());
        _grantRole(TREASURER_ROLE, _msgSender());
        _grantRole(MODERATOR_ROLE, _msgSender());
        _addToWhitelist(_msgSender());
    }

    function setAdminRole(
        bytes32 role,
        bytes32 adminRole
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(role, adminRole);
    }

    function onlyOperator(address account) external view {
        require(hasRole(OPERATOR_ROLE, account), "ControlTower: OPERATOR_ONLY");
    }

    function onlyTreasurer(address account) external view{
        require(hasRole(TREASURER_ROLE, account), "ControlTower: TREASURER_ONLY");
    }

    function onlyModerator(address account) external view {
        require(hasRole(MODERATOR_ROLE, account), "ControlTower: MODERATOR_ONLY");
    }

    function onlyWhitelist(address account) external view {
        require(isInWhitelist(account), "ControlTower: WHITELIST_ONLY");
    }

    function notInBlacklist(address account) external view {
        require(!isInBlacklist(account), "ControlTower: BLACKLISTED");
    }

    function addToWhitelist(address account) external onlyRole(OPERATOR_ROLE) {
        _removeFromBlacklist(account);
        _addToWhitelist(account);
    }

    function removeFromWhitelist(address account) external onlyRole(OPERATOR_ROLE) {
        _removeFromWhitelist(account);
    }

    function addToBlacklist(address account) external onlyRole(OPERATOR_ROLE) {
        _removeFromWhitelist(account);
        _addToBlacklist(account);
    }

    function removeFromBlacklist(address account) external onlyRole(OPERATOR_ROLE) {
        _removeFromBlacklist(account);
    }
}
