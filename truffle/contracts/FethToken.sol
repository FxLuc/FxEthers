// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FethToken is ERC20 {
    constructor(uint initialSupply) ERC20("FxEthers Token", "FETH") {
        _mint(msg.sender, initialSupply * 10**decimals());
    }

    // function decimals() public pure override returns (uint8) {
    //     return 0;
    // }
}
