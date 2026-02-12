// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PoolPredictionMarket
 * @notice Simple YES/NO pool market:
 *  - Users buy YES or NO shares (1 USDC == 1 share unit for MVP).
 *  - At resolution, winners split losers pool pro-rata.
 *  - Optional fee taken on profits (basis points).
 *
 * This is an MVP for speed. Not an orderbook exchange.
 */
contract PoolPredictionMarket {
    string public question;
    uint256 public expiry;
    IERC20 public token;          // USDC (6 decimals)
    address public oracle;        // allowed to resolve
    uint16 public feeBps;         // e.g. 200 = 2%

    uint256 public yesTotal;
    uint256 public noTotal;

    mapping(address => uint256) public yesBalance;
    mapping(address => uint256) public noBalance;
    mapping(address => bool) public withdrawn;

    bool public resolved;
    bool public outcomeYes; // true => YES wins, false => NO wins

    event Buy(address indexed user, bool yesSide, uint256 amount);
    event Resolve(bool outcomeYes);
    event Withdraw(address indexed user, uint256 payout, uint256 fee);

    error MarketExpired();
    error MarketNotExpired();
    error NotOracle();
    error AlreadyResolved();
    error NotResolved();
    error AlreadyWithdrawn();
    error ZeroAmount();

    constructor(
        string memory _question,
        uint256 _expiry,
        address _token,
        address _oracle,
        uint16 _feeBps
    ) {
        require(_token != address(0), "token=0");
        require(_oracle != address(0), "oracle=0");
        require(_feeBps <= 1000, "fee too high"); // max 10% for MVP
        question = _question;
        expiry = _expiry;
        token = IERC20(_token);
        oracle = _oracle;
        feeBps = _feeBps;
    }

    function buyYes(uint256 amount) external {
        _buy(true, amount);
    }

    function buyNo(uint256 amount) external {
        _buy(false, amount);
    }

    function _buy(bool yesSide, uint256 amount) internal {
        if (amount == 0) revert ZeroAmount();
        if (block.timestamp >= expiry) revert MarketExpired();
        // transferFrom requires user approval to this contract
        bool ok = token.transferFrom(msg.sender, address(this), amount);
        require(ok, "transferFrom failed");

        if (yesSide) {
            yesBalance[msg.sender] += amount;
            yesTotal += amount;
        } else {
            noBalance[msg.sender] += amount;
            noTotal += amount;
        }
        emit Buy(msg.sender, yesSide, amount);
    }

    function resolve(bool _outcomeYes) external {
        if (msg.sender != oracle) revert NotOracle();
        if (resolved) revert AlreadyResolved();
        if (block.timestamp < expiry) revert MarketNotExpired();
        resolved = true;
        outcomeYes = _outcomeYes;
        emit Resolve(_outcomeYes);
    }

    /// @notice Withdraw winnings after resolution.
    /// Payout includes stake + share of losing pool. Fee applies to profit only.
    function withdraw() external {
        if (!resolved) revert NotResolved();
        if (withdrawn[msg.sender]) revert AlreadyWithdrawn();
        withdrawn[msg.sender] = true;

        uint256 userStake = outcomeYes ? yesBalance[msg.sender] : noBalance[msg.sender];
        if (userStake == 0) {
            emit Withdraw(msg.sender, 0, 0);
            return;
        }

        uint256 winnersTotal = outcomeYes ? yesTotal : noTotal;
        uint256 losersTotal = outcomeYes ? noTotal : yesTotal;

        // If nobody on losing side, user just gets stake back (no profit).
        uint256 grossPayout = userStake;
        if (losersTotal > 0 && winnersTotal > 0) {
            uint256 share = (userStake * losersTotal) / winnersTotal;
            grossPayout = userStake + share;
        }

        uint256 profit = grossPayout > userStake ? (grossPayout - userStake) : 0;
        uint256 fee = (profit * feeBps) / 10_000;
        uint256 netPayout = grossPayout - fee;

        bool ok = token.transfer(msg.sender, netPayout);
        require(ok, "transfer failed");

        emit Withdraw(msg.sender, netPayout, fee);
    }

    // --- Admin helpers (MVP) ---
    function setOracle(address newOracle) external {
        if (msg.sender != oracle) revert NotOracle();
        require(newOracle != address(0), "oracle=0");
        oracle = newOracle;
    }
}
