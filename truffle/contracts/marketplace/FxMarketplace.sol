// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../access/ControlTower.sol";

contract FxMarketplace is Pausable {
    using SafeERC20 for IERC20;

    struct ListedItem {
        IERC20 paymentToken;
        address seller;
        address lastPurchaser;
        uint64 startTime;
        uint64 endTime;
        uint startPrice;
        uint lastPrice;
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

    mapping(address => bool) public isPaymentTokens;
    mapping(address => mapping(uint => ListedItem)) public listed;

    event ListForSale(
        address nft,
        uint nftId,
        uint64 startTime,
        uint64 endTime,
        address paymentToken,
        uint startPrice
    );

    event MakeAnOffer(
        address paymentToken,
        address nft,
        uint nftId,
        uint amountOffer
    );

    event TakeOwnItem(address nft, uint nftId, address to);
    event ServiceFeePercentChange(uint oldFee, uint newFee);
    event ReimbursementFeeChange(uint oldFee, uint newFee);

    constructor(address _treasury, ControlTower _controlTower) {
        controlTower = _controlTower;
        treasury = _treasury;
    }

    function listForSale(
        address nft,
        uint nftId,
        uint64 startTime,
        uint64 endTime,
        address paymentToken,
        uint startPrice
    ) external whenNotPaused {
        require(
            isPaymentTokens[paymentToken],
            "FxMarketplace: UNACCEPTED_TOKEN"
        );
        require(
            listed[nft][nftId].endTime < block.timestamp,
            "FxMarketplace: ITEM_LISTING"
        );
        IERC721(nft).approve(address(this), nftId);
        listed[nft][nftId] = ListedItem(
            IERC20(paymentToken),
            _msgSender(),
            address(0),
            startTime,
            endTime,
            startPrice,
            startPrice // lastPrice
        );

        emit ListForSale(
            nft,
            nftId,
            startTime,
            endTime,
            paymentToken,
            startPrice
        );
    }

    function makeAnOffer(
        IERC20 paymentToken,
        address nft,
        uint nftId,
        uint amountOffer
    ) external whenNotPaused {
        ListedItem storage listedItem = listed[nft][nftId];
        require(
            listedItem.endTime >= block.timestamp,
            "FxMarketplace: SALE_ENDED"
        );
        require(
            listedItem.lastPrice > amountOffer,
            "FxMarketplace: OFFER_TOO_LOW"
        );
        require(
            listedItem.paymentToken == paymentToken,
            "FxMarketplace: UNACCEPTED_TOKEN"
        );

        paymentToken.safeTransferFrom(
            _msgSender(),
            address(this),
            listedItem.lastPrice
        );
        paymentToken.safeTransfer(listedItem.lastPurchaser, amountOffer);
        listedItem.lastPrice = amountOffer;
        listedItem.lastPurchaser = _msgSender();

        emit MakeAnOffer(address(paymentToken), nft, nftId, amountOffer);
    }

    function takeOwnItem(
        address nft,
        uint nftId,
        address to
    ) external whenNotPaused {
        ListedItem memory listedItem = listed[nft][nftId];
        require(
            listedItem.endTime < block.timestamp,
            "FxMarketplace: ITEM_LISTING"
        );
        require(
            listedItem.lastPurchaser == _msgSender(),
            "FxMarketplace: INVALID_PURCHASER"
        );

        uint serviceFee = (listedItem.lastPrice * serviceFeePercent) /
            PERCENTAGE;
        listedItem.paymentToken.safeTransfer(
            listedItem.seller,
            listedItem.lastPrice - serviceFee
        );

        IERC721(nft).safeTransferFrom(listedItem.seller, to, nftId);

        emit TakeOwnItem(nft, nftId, to);
    }

    function cancelListed(address nft, uint nftId) external {
        ListedItem storage listedItem = listed[nft][nftId];
        address sender = _msgSender();
        require(
            listedItem.endTime > block.timestamp,
            "FxMarketplace: SALE_ENDED"
        );
        require(listedItem.seller == sender, "FxMarketplace: INVALID_SELLER");

        uint reimbursementFee = (listedItem.lastPrice *
            reimbursementFeePercent) / PERCENTAGE;
        listedItem.paymentToken.safeTransferFrom(
            sender,
            address(this),
            reimbursementFee
        );

        listedItem.paymentToken.safeTransfer(
            listedItem.lastPurchaser,
            listedItem.lastPrice + reimbursementFee
        );
        listedItem.lastPurchaser = sender;
        listedItem.endTime = uint64(block.timestamp);
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
}
