// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale,
 * allowing investors to purchase tokens with ether. This contract implements
 * such functionality in its most fundamental form and can be extended to provide additional
 * functionality and/or custom behavior.
 * The external interface represents the basic interface for purchasing tokens, and conforms
 * the base architecture for crowdsales. It is *not* intended to be modified / overridden.
 * The internal interface conforms the extensible and modifiable surface of crowdsales. Override
 * the methods to add functionality. Consider using 'super' where appropriate to concatenate
 * behavior.
 */
contract Crowdsale is Context, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // The token being sold
    IERC20 public token;

    // Address where funds are collected
    address payable public wallet;

    // How many token units a buyer gets per wei.
    // The rate is the conversion between wei and the smallest and indivisible token unit.
    // So, if you are using a rate of 1 with a ERC20Detailed token with 3 decimals called TOK
    // 1 wei will give you 1 unit, or 0.001 TOK.
    uint256 public rate;

    // Amount of raised in wei
    uint256 public raised;

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokensPurchased(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    /**
     * @param _rate Number of token units a buyer gets per wei
     * @dev The rate is the conversion between wei and the smallest and indivisible
     * token unit. So, if you are using a rate of 1 with a ERC20Detailed token
     * with 3 decimals called TOK, 1 wei will give you 1 unit, or 0.001 TOK.
     * @param _wallet Address where collected funds will be forwarded to
     * @param _token Address of the token being sold
     */
    constructor(uint256 _rate, address _wallet, IERC20 _token) {
        require(_rate > 0, "Crowdsale: ZERO_RATE");
        require(_wallet != address(0), "Crowdsale: WALLET_ADDRESS_ZERO");
        require(address(_token) != address(0), "Crowdsale: TOKEN_ADDRESS_ZERO");

        rate = _rate;
        wallet = payable(_wallet);
        token = _token;
    }

    /**
     * @dev fallback function ***DO NOT OVERRIDE***
     * Note that other contracts will transfer funds with a base gas stipend
     * of 2300, which is not enough to call buyTokens. Consider calling
     * buyTokens directly when purchasing tokens from a contract.
     */
    receive() external payable {
        buyTokens(_msgSender());
    }

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     * @param beneficiary Recipient of the token purchase
     */
    function buyTokens(address beneficiary) public payable nonReentrant {
        uint256 amount = msg.value;
        _preValidatePurchase(beneficiary, amount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(amount);

        // update state
        raised = raised + amount;

        _processPurchase(beneficiary, tokens);
        emit TokensPurchased(_msgSender(), beneficiary, amount, tokens);

        // _updatePurchasingState(beneficiary, amount);

        _forwardFunds();
        // _postValidatePurchase(beneficiary, amount);
    }

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met.
     * Use `super` in contracts that inherit from Crowdsale to extend their validations.
     * Example from CappedCrowdsale.sol's _preValidatePurchase method:
     *     super._preValidatePurchase(beneficiary, amount);
     *     require(weiRaised().add(amount) <= cap);
     * @param beneficiary Address performing the token purchase
     * @param amount Value in wei involved in the purchase
     */
    function _preValidatePurchase(
        address beneficiary,
        uint256 amount
    ) internal view virtual {
        require(
            beneficiary != address(0),
            "Crowdsale: BENEFICIARY_ADDRESS_ZERO"
        );
        require(amount != 0, "Crowdsale: ZERO_AMOUNT");
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }

    /**
     * @dev Validation of an executed purchase. Observe state and use revert statements to
     * undo rollback when valid conditions are not met.
     * @param beneficiary Address performing the token purchase
     * @param amount Value in wei involved in the purchase
     */
    function _postValidatePurchase(
        address beneficiary,
        uint256 amount
    ) internal view virtual {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Source of tokens. Override this method to modify the way in which
     * the crowdsale ultimately gets and sends its tokens.
     * @param beneficiary Address performing the token purchase
     * @param amount Number of tokens to be emitted
     */
    function _deliverTokens(
        address beneficiary,
        uint256 amount
    ) internal virtual {
        token.safeTransfer(beneficiary, amount);
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed.
     * Doesn't necessarily emit/send tokens.
     * @param beneficiary Address receiving the tokens
     * @param amount Number of tokens to be purchased
     */
    function _processPurchase(
        address beneficiary,
        uint256 amount
    ) internal virtual {
        _deliverTokens(beneficiary, amount);
    }

    /**
     * @dev Override for extensions that require an internal state to
     * check for validity (current user contributions, etc).
     * @param beneficiary Address receiving the tokens
     * @param amount Value in wei involved in the purchase
     */
    function _updatePurchasingState(
        address beneficiary,
        uint256 amount
    ) internal virtual {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param amount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _amount
     */
    function _getTokenAmount(uint256 amount) internal view returns (uint256) {
        return amount * rate;
    }

    /**F
     * @dev Determines how ETH is stored/forwarded on purchases.
     */
    function _forwardFunds() internal virtual {
        wallet.transfer(msg.value);
    }
}
