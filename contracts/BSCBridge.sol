// SPDX-License-Identifier: None
pragma solidity ^0.8.0;

/// @title Bridge Contract
/// @author SteffQing
/// @notice This smart contract collects and locks user's token deposit, and emits an event to mint the same amount of token on the cross chain.
/// @dev Inherits from the IBridgeBase interface.

import {IBridgeBase} from "./interface/IBridgeBase.sol";
import {IERC20} from "./interface/IERC20.sol";
import {GPv2SafeERC20} from "./interface/SafeERC20.sol";

contract Bridge is IBridgeBase {
    using GPv2SafeERC20 for IERC20;
    IERC20 private immutable _token;

    address public bridgeAdmin;
    uint256 private bridgeLiquidity;
    string private _crossBridgeAddress;
    uint256 private _bridgeFee;
    uint256 private _minDepositAmount;
    uint256 private _generatedFees;
    uint256 private _crossChainAddrLength;
    bool private _paused;

    struct UserDeposit {
        uint256 timestamp;
        uint256 amount;
    }

    mapping(address => UserDeposit) public userDeposit;
    mapping(address => bool) private isWhitelist;

    constructor(address token_, address[] memory whitelist_) {
        _token = IERC20(token_);
        bridgeAdmin = msg.sender;
        _crossChainAddrLength = block.chainid == 97 ? 34 : 42;
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
    function deposit(
        string calldata to,
        uint256 amount
    ) external override notPaused {
        require(amount >= _minDepositAmount, "Bridge: amount too small");
        require(
            isAddressLengthEqualTo(to, _crossChainAddrLength),
            "Bridge: to address length invalid"
        );
        uint256 transferrableAmount = calculateBurnFee(amount);
        uint _amount = transferrableAmount - _bridgeFee;
        _generatedFees += _bridgeFee;
        _token.safeTransferFrom(msg.sender, address(this), amount);
        userDeposit[msg.sender].amount = _amount;
        userDeposit[msg.sender].timestamp = block.timestamp + 10 minutes;
        emit Deposit(msg.sender, to, _amount);
    }

    /// @inheritdoc IBridgeBase
    function withdraw(
        string calldata from,
        address to,
        uint256 amount
    ) external override onlyWhitelist notPaused {
        require(amount > 0, "Bridge: amount must be greater than 0");
        uint balance = bridgeBalance();
        require(balance >= amount, "Bridge: insufficient balance");
        uint transferrableAmount = calculateBurnFee(amount);
        _token.safeTransfer(to, amount);
        emit Withdraw(from, to, transferrableAmount);
    }

    /// @inheritdoc IBridgeBase
    function burn(
        address from,
        uint256 amount
    ) external override onlyWhitelist notPaused {
        require(amount > 0, "Bridge: amount must be greater than 0");
        require(getDepositStatus(from), "Bridge: 0 balance");
        delete userDeposit[from];
        emit Burn(from, amount);
    }

    /// @inheritdoc IBridgeBase
    function bridgeBalance() public view override returns (uint256) {
        uint balance = _token.balanceOf(address(this));
        return balance;
    }

    /// @inheritdoc IBridgeBase
    function getDepositStatus(
        address from
    ) public view override returns (bool hasPendingDeposit) {
        return userDeposit[from].amount > 0;
    }

    /// @inheritdoc IBridgeBase
    function getBridgeInfo()
        external
        view
        override
        returns (
            string memory crossBridgeAddress,
            uint256 minDepositAmount,
            uint256 bridgeFees,
            bool bridgeClosed
        )
    {
        crossBridgeAddress = _crossBridgeAddress;
        minDepositAmount = _minDepositAmount;
        bridgeFees = _bridgeFee;
        bridgeClosed = _paused;
    }

    /// @inheritdoc IBridgeBase
    function cancelPendingDeposit() external override {
        require(getDepositStatus(msg.sender), "Bridge: no pending deposit");
        require(
            userDeposit[msg.sender].timestamp < block.timestamp,
            "Bridge: deposit not yet available for withdrawal"
        );
        uint256 amount = userDeposit[msg.sender].amount;
        delete userDeposit[msg.sender];
        _token.safeTransfer(msg.sender, amount);
    }

    /// @inheritdoc IBridgeBase
    function setMinDepositAmount(
        uint256 amount
    ) external override onlyBridgeAdmin {
        require(amount > 0, "Bridge: amount must be greater than 0");
        _minDepositAmount = amount;
    }

    /// @inheritdoc IBridgeBase
    function setBridgeFees(uint256 fee) external override onlyBridgeAdmin {
        require(fee > 0, "Bridge: fee must be greater than 0");
        _bridgeFee = fee;
    }

    /// @inheritdoc IBridgeBase
    function emergencyPause(bool paused) external override onlyBridgeAdmin {
        _paused = paused;
    }

    /// @inheritdoc IBridgeBase
    function setCrossBridgeContract(
        string calldata newBridgeAddress
    ) external override onlyBridgeAdmin {
        require(
            isAddressLengthEqualTo(newBridgeAddress, _crossChainAddrLength),
            "Bridge: crossBridge address length invalid"
        );
        _crossBridgeAddress = newBridgeAddress;
    }

    /// @inheritdoc IBridgeBase
    function claimFees() external override onlyBridgeAdmin {
        require(
            _generatedFees > 0,
            "Bridge: generated fees must be greater than 0"
        );
        uint generatedFees = _generatedFees;
        _generatedFees = 0;
        _token.safeTransfer(msg.sender, generatedFees);
    }

    /// @inheritdoc IBridgeBase
    function setBridgeAdmin(
        address newBridgeAdmin
    ) external override onlyBridgeAdmin {
        require(
            newBridgeAdmin != address(0),
            "Bridge: new bridge admin is the zero address"
        );
        bridgeAdmin = newBridgeAdmin;
    }

    /// @inheritdoc IBridgeBase
    function addWhitelistedAddress(
        address whitelist_
    ) external override onlyBridgeAdmin {
        isWhitelist[whitelist_] = true;
    }

    /// @inheritdoc IBridgeBase
    function removeWhitelistedAddress(
        address whitelist_
    ) external override onlyBridgeAdmin {
        isWhitelist[whitelist_] = false;
    }

    /// @inheritdoc IBridgeBase
    function addLiquidity(uint256 amount) external override onlyBridgeAdmin {
        require(amount > 0, "Bridge: amount must be greater than 0");
        uint256 transferrableAmount = calculateBurnFee(amount);
        _token.safeTransferFrom(msg.sender, address(this), amount);
        bridgeLiquidity += transferrableAmount;
    }

    /// @inheritdoc IBridgeBase
    function removeLiquidity(uint256 amount) external override onlyBridgeAdmin {
        require(
            bridgeLiquidity >= amount,
            "Bridge: insufficient bridge liquidity"
        );
        require(
            amount <= bridgeBalance(),
            "Bridge: Insufficient funds in bridge"
        );
        bridgeLiquidity -= amount;
        _token.safeTransfer(msg.sender, amount);
    }

    /// @inheritdoc IBridgeBase
    function isAddressLengthEqualTo(
        string memory _str,
        uint _length
    ) public pure override returns (bool) {
        bytes memory strBytes = bytes(_str);
        return strBytes.length == _length;
    }

    /// @inheritdoc IBridgeBase
    function calculateBurnFee(
        uint256 amount
    ) public view override returns (uint256) {
        uint burnPercentage = _token.burnPercentage();
        return (amount * burnPercentage) / 100;
    }
}
