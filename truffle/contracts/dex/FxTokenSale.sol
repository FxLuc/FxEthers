// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../access/Whitelist.sol";

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
contract FxTokenSale is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    ControlTower public immutable controlTower;
    Whitelist public immutable whitelist;
    IERC20 public immutable token;

    address payable public immutable treasury;

    uint public rate;
    uint public raised;

    uint private constant MUTIPLIER = 1e18;

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param amountIn weis paid for purchase
     * @param tokenOut amount of tokens purchased
     */
    event TokensPurchased(
        address indexed purchaser,
        address indexed beneficiary,
        uint amountIn,
        uint tokenOut
    );

    /**
     * @param _rate Number of token units a buyer gets per MUTIPLIER
     * @dev The rate is the conversion between wei and the smallest and indivisible
     * token unit. So, if you are using a rate of 1e18 with a ERC20Detailed token
     * with 18 decimals called TOK, 1 wei will give you 1 unit, or 1e-18 TOK.
     * @param _treasury Address where collected funds will be forwarded to
     * @param _token Address of the token being sold
     * @param _whitelist Address of the KYC
     * @param _controlTower Address of the access control
     */
    constructor(
        address payable _treasury,
        uint _rate,
        IERC20 _token,
        Whitelist _whitelist,
        ControlTower _controlTower
    ) {
        address addressZero = address(0);
        require(_rate > 0, "Crowdsale: ZERO_RATE");
        require(_treasury != addressZero, "Crowdsale: ADDRESS_ZERO");
        require(address(_token) != addressZero, "Crowdsale: ADDRESS_ZERO");
        require(address(_whitelist) != addressZero, "Crowdsale: ADDRESS_ZERO");
        require(address(_controlTower) != addressZero, "Crowdsale: ADDRESS_ZERO");
        rate = _rate;
        treasury = _treasury;
        token = _token;
        whitelist = _whitelist;
        controlTower = _controlTower;
    }

    /**
     * @dev fallback function ***DO NOT OVERRIDE***
     * Note that other contracts will transfer funds with a base gas stipend
     * of 2300, which is not enough to call buytokens. Consider calling
     * buytokens directly when purchasing tokens from a contract.
     */
    receive() external payable {
        buytokens(_msgSender());
    }

    function setRate(uint _rate) external whenPaused {
        controlTower.onlyTreasurer();
        rate = _rate;
    }

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     * @param beneficiary Recipient of the token purchase
     */
    function buytokens(address beneficiary) public payable nonReentrant whenNotPaused {
        uint amountIn = msg.value;
        uint tokenOut = getEstimatetoken(amountIn);

        require(tokenOut > 0, "Crowdsale: ZERO_AMOUNT");
        require(
            beneficiary != address(0),
            "Crowdsale: BENEFICIARY_ADDRESS_ZERO"
        );
        require(whitelist.isRegister(_msgSender()), "MytokenSale: NOT_ALLOWED");

        raised += amountIn;
        treasury.transfer(amountIn);
        token.safeTransfer(beneficiary, tokenOut);
        emit TokensPurchased(_msgSender(), beneficiary, amountIn, tokenOut);
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param amountIn Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _amount
     */
    function getEstimatetoken(uint amountIn) public view returns (uint) {
        return (amountIn * rate) / MUTIPLIER;
    }
}
