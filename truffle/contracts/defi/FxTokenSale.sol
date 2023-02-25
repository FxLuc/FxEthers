// SPDX-License-Identifier: MIT
// FxEthers Contracts (last updated v1.0)

pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../access/ControlTower.sol";

/**
 * @title FxTokenSale
 * @dev FxTokenSale is a base contract for managing a token crowdsale, allowing investors to purchase tokens with ether. 
 */
contract FxTokenSale is Pausable, ReentrancyGuard {
    ControlTower public immutable controlTower;
    IERC20 public immutable token;
    address public immutable treasury;
    uint public rate;
    uint public raised;
    uint private constant MULTIPLIER = 1e18;

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
     * @dev The rate is the conversion between wei and the smallest and indivisible
     * token unit. So, if you are using a rate of 1e18 with a ERC20Detailed token
     * with 18 decimals called TOK, 1 wei will give you 1 unit, or 1e-18 TOK.
     * @param _treasury Address where collected funds will be forwarded to
     * @param _rate Number of token units a buyer gets per MULTIPLIER
     * @param _token Address of the token being sold
     * @param _controlTower Address of the access control
     */
    constructor(
        address _treasury,
        uint _rate,
        IERC20 _token,
        ControlTower _controlTower
    ) {
        address addressZero = address(0);
        require(_rate > 0, "TokenSale: ZERO_RATE");
        require(_treasury != addressZero, "TokenSale: ADDRESS_ZERO");
        require(address(_token) != addressZero, "TokenSale: ADDRESS_ZERO");
        require(
            address(_controlTower) != addressZero,
            "TokenSale: ADDRESS_ZERO"
        );
        rate = _rate;
        treasury = _treasury;
        token = _token;
        controlTower = _controlTower;
    }

    /**
     * @dev fallback function
     * Note that other contracts will transfer funds with a base gas stipend
     * of 2300, which is not enough to call buyTokens. Consider calling
     * buyTokens directly when purchasing tokens from a contract.
     */
    receive() external payable {
        buyTokens(_msgSender());
    }

    /**
     * @dev The rate is the conversion between wei and the smallest and indivisible
     * token unit. So, if you are using a rate of 1e18 with a ERC20Detailed token
     * with 18 decimals called TOK, 1 wei will give you 1 unit, or 1e-18 TOK.
     * @param _rate Number of token units a buyer gets per MULTIPLIER
     */
    function setRate(uint _rate) external whenPaused {
        controlTower.onlyTreasurer(_msgSender());
        rate = _rate;
    }

    /**
     * @dev low level token purchase
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     * @param beneficiary Recipient of the token purchase
     */
    function buyTokens(
        address beneficiary
    ) public payable nonReentrant whenNotPaused {
        uint amountIn = msg.value;
        uint tokenOut = getEstimateToken(amountIn);

        require(tokenOut > 0, "TokenSale: ZERO_AMOUNT");
        require(beneficiary != address(0), "TokenSale: ADDRESS_ZERO");
        controlTower.onlyWhitelist(_msgSender());

        raised += amountIn;
        payable(treasury).transfer(address(this).balance);
        token.transferFrom(treasury, beneficiary, tokenOut);
        emit TokensPurchased(_msgSender(), beneficiary, amountIn, tokenOut);
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param amountIn Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _amount
     */
    function getEstimateToken(uint amountIn) public view returns (uint) {
        return (amountIn * rate) / MULTIPLIER;
    }

    function available() public view returns (uint) {
        uint balanceOfTreasury = token.balanceOf(treasury);
        uint allowanceFromTreasury = token.allowance(treasury, address(this));
        return
            allowanceFromTreasury > balanceOfTreasury
                ? balanceOfTreasury
                : allowanceFromTreasury;
    }
}
