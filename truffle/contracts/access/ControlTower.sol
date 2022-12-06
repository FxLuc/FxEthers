// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ControlTower is AccessControl {
    bytes32 public constant OPERATOR_ROLE = 0x4f50455241544f525f524f4c4500000000000000000000000000000000000000;
    bytes32 public constant TREASURER_ROLE = 0x5452454153555245525f524f4c45000000000000000000000000000000000000;
    bytes32 public constant MODERATOR_ROLE = 0x4d4f44455241544f525f524f4c45000000000000000000000000000000000000;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(OPERATOR_ROLE, _msgSender());
        _grantRole(TREASURER_ROLE, _msgSender());
        _grantRole(MODERATOR_ROLE, _msgSender());
    }

    function setAdminRole(
        bytes32 role,
        bytes32 adminRole
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(role, adminRole);
    }

    function onlyOperator() external view {
        _checkRole(OPERATOR_ROLE);
    }

    function onlyTreasurer() external view{
        _checkRole(TREASURER_ROLE);
    }

    function onlyModerator() external view {
        _checkRole(MODERATOR_ROLE);
    }
}
