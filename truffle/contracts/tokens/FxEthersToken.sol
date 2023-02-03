// SPDX-License-Identifier: MIT
// FxEthers Contracts (last updated v1.0)

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../access/ControlTower.sol";

contract FxEthersToken is ERC20 {
    ControlTower public immutable controlTower;

    address public immutable treasury;

    constructor(
        uint initialSupply,
        address _treasury,
        ControlTower _controlTower
    ) ERC20("FxEthers Token", "FxETH") {
        controlTower = _controlTower;
        treasury = _treasury;
        _mint(_treasury, initialSupply);
    }

    function mint(uint amount) external {
        controlTower.onlyTreasurer(msg.sender);
        _mint(treasury, amount);
    }
}
