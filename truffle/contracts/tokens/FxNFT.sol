// SPDX-License-Identifier: MIT
// FxEthers Contracts (last updated v1.0)

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../access/ControlTower.sol";

contract FxNFT is ERC721 {
    using Counters for Counters.Counter;

    address payable public immutable treasury;
    uint public serviceFee;

    ControlTower public immutable controlTower;
    Counters.Counter private _tokenIdCounter;

    string private baseURI;

    // Mapping from token ID to hashed metadata
    mapping(uint => bytes) public hashedMetadata;

    event BaseURIChange(string oldBaseURI, string newBaseURI);
    event ServiceFeeChange(uint oldServiceFee, uint newServiceFee);
    event RescuesTokenStuck(address token, uint256 amount);

    constructor(
        ControlTower _controlTower,
        address payable _treasury,
        string memory _tokenBaseURI
    ) ERC721("FxNFT", "FxNFT") {
        controlTower = _controlTower;
        treasury = _treasury;
        baseURI = _tokenBaseURI;
    }

    receive() external payable {}

    function totalSupply() external view returns (uint) {
        return _tokenIdCounter.current();
    }

    function mint(address to, bytes calldata _hashedMetadata) external {
        controlTower.onlyModerator(_msgSender());
        _mint(_hashedMetadata, to);
    }

    function mintWithFee(address to, bytes calldata _hashedMetadata) external payable {
        require(msg.value >= serviceFee, "FxNFT: INVALID_FEE");
        treasury.transfer(address(this).balance);
        _mint(_hashedMetadata, to);
    }

    function setBaseURI(string calldata _tokenBaseURI) external {
        controlTower.onlyModerator(_msgSender());
        emit BaseURIChange(baseURI, _tokenBaseURI);
        baseURI = _tokenBaseURI;
    }

    function setServiceFee(uint _serviceFee) external {
        require(_serviceFee <= 1 ether, "FxNFT: FEE_TOO_HIGH");
        controlTower.onlyTreasurer(_msgSender());
        emit ServiceFeeChange(serviceFee, _serviceFee);
        serviceFee = _serviceFee;
    }

    /**
     * @dev Rescues random funds stuck that the strat can't handle.
     * @param _token address of the token to rescue.
     */
    function inCaseTokensGetStuck(address _token) external {
        uint amount = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(treasury, amount);
        emit RescuesTokenStuck(_token, amount);
    }

    function _mint(bytes calldata _hashedMetadata, address to) private {
        uint tokenId = _tokenIdCounter.current();
        hashedMetadata[tokenId] = _hashedMetadata;
        _safeMint(to, tokenId);
        _tokenIdCounter.increment();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}
