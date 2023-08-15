// SPDX-License-Identifier: None
pragma solidity ^0.8.0;

/// @title Bridge Contract
/// @author SteffQing
/// @notice This smart contract collects and locks user's token deposit, and emits an event to mint the same amount of token on the cross chain.
/// @dev Inherits from the IBridgeBase interface.

import {IBridgeBase} from "./interface/IBridgeBase.sol";
import {IERC20} from "./interface/IERC20.sol";
import {GPv2SafeERC20} from "./interface/SafeERC20.sol";
import {AddressLengthLib} from "./library/AddressLength.sol";

contract Bridge is IBridgeBase {
    using GPv2SafeERC20 for IERC20;
    IERC20 private immutable _token;

    address public bridgeAdmin;
    string private _crossBridgeAddress;
    uint256 private _bridgeFee;
    uint256 private _minDepositAmount;
    bool private _paused;

    mapping(address => uint256) private userDeposit;
    mapping(address => bool) private isWhitelist;

    constructor(address token_, address[] memory whitelist_) {
        _token = IERC20(token_);
        bridgeAdmin = msg.sender;
        for (uint256 i = 0; i < whitelist_.length; i++) {
            isWhitelist[whitelist_[i]] = true;
        }
    }

    modifier onlyWhitelist() {
        require(isWhitelist[msg.sender], "Bridge: caller is not whitelist");
        _;
    }

    modifier onlyBridgeAdmin() {
        require(
            msg.sender == bridgeAdmin,
            "Bridge: caller is not bridge admin"
        );
        _;
    }

    modifier notPaused() {
        require(!_paused, "Bridge: paused");
        _;
    }

    /// @inheritdoc IBridgeBase
    function deposit(string calldata to, uint256 amount) external notPaused {
        require(amount > _minDepositAmount, "Bridge: amount too small");
        require(
            AddressLengthLib.isAddressLengthEqualTo(to, 34),
            "Bridge: to address length must be 34"
        );
        uint _amount = amount - _bridgeFee;
        _token.safeTransferFrom(msg.sender, address(this), amount);
        userDeposit[msg.sender] += amount;
        emit Deposit(msg.sender, to, _amount);
    }

    /// @inheritdoc IBridgeBase
    function withdraw(
        string calldata from,
        address to,
        uint256 amount
    ) external onlyWhitelist notPaused {
        require(amount > 0, "Bridge: amount must be greater than 0");
        uint balance = bridgeBalance();
        require(balance >= amount, "Bridge: insufficient balance");
        _token.safeTransfer(to, amount);
        emit Withdraw(msg.sender, from, amount);
    }

    /// @inheritdoc IBridgeBase
    function burn(
        address from,
        uint256 amount
    ) external onlyWhitelist notPaused {
        require(amount > 0, "Bridge: amount must be greater than 0");
        require(userDeposit[from] == amount, "Bridge: incorrect balance");
        delete userDeposit[from];
        emit Burn(from, amount);
    }

    /// @inheritdoc IBridgeBase
    function bridgeBalance() public view returns (uint256) {
        uint balance = _token.balanceOf(address(this));
        return balance;
    }

    /// @inheritdoc IBridgeBase
    function getDepositStatus(
        address from
    ) public view returns (bool hasPendingDeposit) {
        return userDeposit[from] > 0;
    }

    /// @inheritdoc IBridgeBase
    function getBridgeInfo()
        external
        view
        returns (
            string memory crossBridgeAddress,
            uint256 minDepositAmount,
            uint256 bridgeFees,
            bool bridgeState
        )
    {
        crossBridgeAddress = _crossBridgeAddress;
        minDepositAmount = _minDepositAmount;
        bridgeFees = _bridgeFee;
        bridgeState = _paused;
    }

    /// @inheritdoc IBridgeBase
    function cancelPendingDeposit() external {
        uint256 amount = userDeposit[msg.sender];
        require(getDepositStatus(msg.sender), "Bridge: no pending deposit");
        delete userDeposit[msg.sender];
        _token.safeTransfer(msg.sender, amount);
    }

    /// @inheritdoc IBridgeBase
    function setMinDepositAmount(uint256 amount) external onlyBridgeAdmin {
        _minDepositAmount = amount;
    }

    /// @inheritdoc IBridgeBase
    function setBridgeFees(uint256 amount) external onlyBridgeAdmin {
        _bridgeFee = amount;
    }

    /// @inheritdoc IBridgeBase
    function emergencyPause(bool paused) external onlyBridgeAdmin {
        _paused = paused;
    }

    /// @inheritdoc IBridgeBase
    function setCrossBridgeContract(
        string calldata newBridgeAddress
    ) external onlyBridgeAdmin {
        _crossBridgeAddress = newBridgeAddress;
    }
}
