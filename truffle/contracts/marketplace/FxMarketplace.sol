// SPDX-License-Identifier: MIT
// FxEthers Contracts (last updated v1.0)

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../access/ControlTower.sol";

contract FxMarketplace is Pausable {
    using SafeERC20 for IERC20;

    struct ListedItem {
        IERC20 paymentToken;
        address seller;
        address bidder;
        uint64 startTime;
        uint64 endTime;
        uint startPrice;
        uint currentPrice;
    }

    enum ItemState {
        Created,
        Sold,
        Delivered,
        Cancelled
    }

    ControlTower public immutable controlTower;
    address public immutable treasury;
    uint public constant PERCENTAGE = 10000; // x100 percent precision
    uint public serviceFeePercent;
    uint public reimbursementFeePercent;

    mapping(address => bool) public isPaymentToken;
    mapping(address => mapping(uint => ListedItem)) public listed;

    event AddPaymentToken(address token);
    event CancelListed(address nft, uint nftId);
    event ListForSale(
        address nft,
        uint nftId,
        uint64 startTime,
        uint64 endTime,
        address seller,
        address paymentToken,
        uint startPrice
    );
    event MakeAnOffer(
        address nft,
        uint nftId,
        address paymentToken,
        uint amountOffer,
        address from
    );
    event ReimbursementFeeChange(uint oldFee, uint newFee);
    event RescuesTokenStuck(address token, uint256 amount);
    event ServiceFeePercentChange(uint oldFee, uint newFee);
    event TakeOwnItem(address nft, uint nftId, address to);

    constructor(ControlTower _controlTower, address _treasury) {
        controlTower = _controlTower;
        treasury = _treasury;
        serviceFeePercent = 5; // 0.05%
        reimbursementFeePercent = 500; // 5.00%
    }

    function listForSale(
        address nft,
        uint nftId,
        uint64 startTime,
        uint64 endTime,
        address paymentToken,
        uint startPrice
    ) external whenNotPaused {
        address msgSender = _msgSender();
        ListedItem memory _listedItem = listed[nft][nftId];

        require(
            isPaymentToken[paymentToken],
            "FxMarketplace: UNACCEPTED_TOKEN"
        );
        require(
            _listedItem.endTime < block.timestamp &&
                _listedItem.bidder == address(0),
            "FxMarketplace: ITEM_LISTING"
        );

        IERC721(nft).safeTransferFrom(msgSender, address(this), nftId);

        listed[nft][nftId] = ListedItem(
            IERC20(paymentToken),
            msgSender,
            address(0),
            startTime,
            endTime,
            startPrice,
            startPrice // currentPrice
        );

        emit ListForSale(
            nft,
            nftId,
            startTime,
            endTime,
            msgSender,
            paymentToken,
            startPrice
        );
    }

    function makeAnOffer(
        address nft,
        uint nftId,
        IERC20 paymentToken,
        uint amountOffer
    ) external whenNotPaused {
        ListedItem storage listedItem = listed[nft][nftId];
        ListedItem memory _listedItem = listedItem;
        require(
            _listedItem.endTime > block.timestamp,
            "FxMarketplace: SALE_ENDED"
        );
        require(
            _listedItem.currentPrice < amountOffer,
            "FxMarketplace: OFFER_TOO_LOW"
        );
        require(
            _listedItem.paymentToken == paymentToken,
            "FxMarketplace: UNACCEPTED_TOKEN"
        );

        address msgSender = _msgSender();
        paymentToken.safeTransferFrom(msgSender, address(this), amountOffer);

        if (_listedItem.bidder != address(0)) {
            paymentToken.safeTransfer(
                _listedItem.bidder,
                _listedItem.currentPrice
            );
        }

        listedItem.currentPrice = amountOffer;
        listedItem.bidder = msgSender;

        emit MakeAnOffer(
            nft,
            nftId,
            address(paymentToken),
            amountOffer,
            msgSender
        );
    }

    function takeOwnItem(address nft, uint nftId, address to) external {
        ListedItem memory listedItem = listed[nft][nftId];
        require(
            listedItem.endTime < block.timestamp,
            "FxMarketplace: ITEM_LISTING"
        );
        require(
            listedItem.bidder == _msgSender(),
            "FxMarketplace: INVALID_PURCHASER"
        );

        uint serviceFee = (listedItem.currentPrice * serviceFeePercent) /
            PERCENTAGE;
        listedItem.paymentToken.safeTransfer(
            listedItem.seller,
            listedItem.currentPrice - serviceFee
        );

        listedItem.paymentToken.safeTransfer(treasury, serviceFee);

        IERC721(nft).safeTransferFrom(address(this), to, nftId);

        listed[nft][nftId] = ListedItem(
            IERC20(address(0)),
            address(0),
            address(0),
            0,
            0,
            0,
            0
        );

        emit TakeOwnItem(nft, nftId, to);
    }

    function cancelListed(address nft, uint nftId) external {
        ListedItem storage listedItem = listed[nft][nftId];
        ListedItem memory _listedItem = listedItem;
        address sender = _msgSender();
        require(_listedItem.seller == sender, "FxMarketplace: INVALID_SELLER");
        require(
            _listedItem.endTime > block.timestamp ||
                _listedItem.bidder == address(0),
            "FxMarketplace: SALE_ENDED"
        );

        if (_listedItem.bidder != address(0)) {
            uint reimbursementFee = (_listedItem.currentPrice *
                reimbursementFeePercent) / PERCENTAGE;
            _listedItem.paymentToken.safeTransferFrom(
                sender,
                address(this),
                reimbursementFee
            );
            _listedItem.paymentToken.safeTransfer(
                _listedItem.bidder,
                _listedItem.currentPrice + reimbursementFee
            );
        }

        IERC721(nft).safeTransferFrom(address(this), listedItem.seller, nftId);

        listed[nft][nftId] = ListedItem(
            IERC20(address(0)),
            address(0),
            address(0),
            0,
            0,
            0,
            0
        );
        emit CancelListed(nft, nftId);
    }

    function setServiceFeePercent(uint percent) external {
        require(percent < PERCENTAGE, "FxMarketplace: FEE_TOO_HIGH");
        controlTower.onlyTreasurer(msg.sender);
        emit ServiceFeePercentChange(serviceFeePercent, percent);
        serviceFeePercent = percent;
    }

    function setReimbursementFeePercent(uint percent) external {
        require(percent < PERCENTAGE, "FxMarketplace: FEE_TOO_HIGH");
        controlTower.onlyTreasurer(msg.sender);
        emit ReimbursementFeeChange(reimbursementFeePercent, percent);
        reimbursementFeePercent = percent;
    }

    function addPaymentToken(address _token) external {
        controlTower.onlyModerator(_msgSender());
        isPaymentToken[_token] = true;
        emit AddPaymentToken(_token);
    }

    function pause() public {
        controlTower.onlyModerator(_msgSender());
        _pause();
    }

    function unpause() external {
        controlTower.onlyModerator(_msgSender());
        _unpause();
    }

    /**
     * @dev Rescues random funds stuck that the strat can't handle.
     * @param _token address of the token to rescue.
     */
    function inCaseTokensGetStuck(address _token) external {
        require(!isPaymentToken[_token], "FxMarketplace: STUCK_TOKEN_ONLY");
        uint256 amount = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(treasury, amount);
        emit RescuesTokenStuck(_token, amount);
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
