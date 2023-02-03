// SPDX-License-Identifier: MIT
// FxEthers Contracts (last updated v1.0)

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
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

    function transferNFT(IERC721 token, address to, uint tokenId) external {
        controlTower.onlyTreasurer(_msgSender());
        token.safeTransferFrom(address(this), to, tokenId);
    }

    function approve(IERC20 token, address spender, uint amount) external {
        controlTower.onlyTreasurer(_msgSender());
        token.approve(spender, amount);
    }

    function approveNFT(IERC721 token, address spender, uint tokenId) external {
        controlTower.onlyTreasurer(_msgSender());
        token.approve(spender, tokenId);
    }

    // Confirmation required for receiving ERC721 to smart contract
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
