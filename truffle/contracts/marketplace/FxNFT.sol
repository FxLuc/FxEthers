// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../access/ControlTower.sol";

contract FxNFT is ERC721 {
    using Counters for Counters.Counter;

    ControlTower public immutable controlTower;
    Counters.Counter private _tokenIdCounter;

    string private baseUri;

    constructor(
        ControlTower _controlTower,
        string memory _baseUri
    ) ERC721("FxNFT", "FNFT") {
        controlTower = _controlTower;
        baseUri = _baseUri;
    }

    function setBaseURI(string calldata _baseUri) external {
        controlTower.onlyModerator(msg.sender);
        baseUri = _baseUri;
    }

    function burn(uint tokenId) external {
        controlTower.onlyModerator(msg.sender);
        _burn(tokenId);
    }

    function mint() public {
        uint tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_msgSender(), tokenId);
    }

    function mint(address to) public {
        uint tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function currentTokenIdCounter() public view returns (uint) {
        return _tokenIdCounter.current();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }
}
