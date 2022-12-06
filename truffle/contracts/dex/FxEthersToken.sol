// SPDX-License-Identifier: MIT
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
    ) ERC20("FxEthers Token", "FETH") {
        controlTower = _controlTower;
        treasury = _treasury;
        _mint(_treasury, initialSupply * 10 ** decimals());
    }

    function mint(uint amount) external {
        controlTower.onlyTreasurer();
        _mint(treasury, amount);
    }
}
