// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../accesses/ControlTower.sol";

contract FxNFT is ERC721 {
    using Counters for Counters.Counter;

    ControlTower public immutable controlTower;
    Counters.Counter private _tokenIdCounter;

    string private baseUri;

    constructor(
        ControlTower _controlTower,
        string memory _baseUri
    ) ERC721("FxNFT", "FxNFT") {
        controlTower = _controlTower;
        baseUri = _baseUri;
    }

    function setBaseURI(string calldata _baseUri) external {
        controlTower.onlyModerator(_msgSender());
        baseUri = _baseUri;
    }

    function burn(uint tokenId) external {
        controlTower.onlyModerator(_msgSender());
        _burn(tokenId);
    }

    function mint() external {
        _safeMint(_msgSender(), _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function mint(address to) external {
        _safeMint(to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function currentTokenId() external view returns (uint) {
        return _tokenIdCounter.current();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }
}
