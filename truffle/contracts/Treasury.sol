// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./access/ControlTower.sol";

contract Treasury {
    ControlTower public controlTower;

    constructor(ControlTower _controlTower) {
        controlTower = _controlTower;
    }

    function transfer(address payable to, uint amount) external {
        controlTower.onlyTreasurer();
        to.transfer(amount);
    }

    function transfer(IERC20 token, address to, uint amount) external {
        controlTower.onlyTreasurer();
        token.transfer(to, amount);
    }

    function approve(IERC20 token, address spender, uint amount) external {
        controlTower.onlyTreasurer();
        token.approve(spender, amount);
    }

}
