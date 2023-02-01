// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "../access/ControlTower.sol";

contract Treasury is Context {
    ControlTower public immutable controlTower;

    constructor(ControlTower _controlTower) {
        controlTower = _controlTower;
    }

    receive() external payable {}

    function transfer(address payable to, uint amount) external {
        controlTower.onlyTreasurer(_msgSender());
        to.transfer(amount);
    }

    function transfer(IERC20 token, address to, uint amount) external {
        controlTower.onlyTreasurer(_msgSender());
        token.transfer(to, amount);
    }

    function approve(IERC20 token, address spender, uint amount) external {
        controlTower.onlyTreasurer(_msgSender());
        token.approve(spender, amount);
    }
}
