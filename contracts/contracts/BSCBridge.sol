// SPDX-License-Identifier: None
pragma solidity ^0.8.0;

/// @title Bridge Contract
/// @author SteffQing
/// @notice This smart contract collects and locks user's token deposit, and emits an event to mint the same amount of token on the cross chain.
/// @dev Inherits from the IBridgeBase interface.

import {IBridgeBase} from "../interface/IBridgeBase.sol";
import {IERC20} from "../interface/IERC20.sol";
import {GPv2SafeERC20} from "../interface/SafeERC20.sol";

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
    uint256 private constant TIME_INTERVAL = 1 days;
    bool private _paused;

    struct UserDeposit {
        uint256 timestamp;
        uint256 amount;
    }

    struct BucketCapacity {
        uint256 maxBucketCapacity;
        uint256 bucketLevel;
        uint256 lastUpdateTimestamp;
    }

    mapping(address => UserDeposit) public userDeposit;
    mapping(address => BucketCapacity) private isWhitelist;

    constructor(address token_, address whitelist_) {
        _token = IERC20(token_);
        bridgeAdmin = msg.sender;
        _crossChainAddrLength = block.chainid == 97 ? 34 : 42;
        isWhitelist[whitelist_] = BucketCapacity(
            100000 * (10 ** 18),
            0,
            block.timestamp
        );
    }

    modifier onlyWhitelist() {
        BucketCapacity memory bucket = isWhitelist[msg.sender];
        require(bucket.maxBucketCapacity >= 0, "Bridge: Not whitelist");
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
        require(getDepositStatus(msg.sender), "Bridge: cancelPendingDeposit");
        uint256 transferrableAmount = calculateBurnFee(amount);
        _token.safeTransferFrom(msg.sender, address(this), amount);

        UserDeposit storage userDep = userDeposit[msg.sender];
        userDep.amount = transferrableAmount;
        userDep.timestamp = block.timestamp + 10 minutes;

        _generatedFees += _bridgeFee;
        emit Deposit(msg.sender, to, transferrableAmount);
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
        _updateBucket(amount);
        uint _amount = amount - _bridgeFee;
        uint transferrableAmount = calculateBurnFee(_amount);
        _token.safeTransfer(to, _amount);
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
        require(
            whitelist_ != address(0),
            "Bridge: new whitelist address is the zero address"
        );
        require(
            isWhitelist[whitelist_].maxBucketCapacity == 0,
            "Bridge: address already whitelisted"
        );
        isWhitelist[whitelist_] = BucketCapacity(
            100000 ether,
            0,
            block.timestamp
        );
    }

    /// @inheritdoc IBridgeBase
    function removeWhitelistedAddress(
        address whitelist_
    ) external override onlyBridgeAdmin {
        require(
            isWhitelist[whitelist_].maxBucketCapacity > 0,
            "Bridge: address not whitelisted"
        );
        delete isWhitelist[whitelist_];
    }

    /// @inheritdoc IBridgeBase
    function setBucketCapacity(
        address whitelist_,
        uint256 capacity_
    ) external override onlyBridgeAdmin {
        require(
            isWhitelist[whitelist_].maxBucketCapacity > 0,
            "Bridge: address not whitelisted"
        );
        isWhitelist[whitelist_].maxBucketCapacity = capacity_;
    }

    /// @notice get bucket capacity for whitelist address
    function getBucket(
        address whitelist_
    ) external view returns (BucketCapacity memory) {
        return isWhitelist[whitelist_];
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
    function getBridgeLiquidityAndFees()
        external
        view
        override
        onlyBridgeAdmin
        returns (uint256, uint256)
    {
        return (bridgeLiquidity, _generatedFees);
    }

    /// @dev Returns the length of an address in bytes
    /// @param _str The address to get the length of
    /// @param _length The length to check against
    /// @return boolean value too confirm the address length
    function isAddressLengthEqualTo(
        string memory _str,
        uint _length
    ) private pure returns (bool) {
        bytes memory strBytes = bytes(_str);
        return strBytes.length == _length;
    }

    /// @notice calculate burn fee percentage and return the amount transferrable
    /// @param amount The initial amount to be transferred
    /// @return uint256 The amount transferrable after fee deduction
    function calculateBurnFee(uint256 amount) private view returns (uint256) {
        uint burnPercentage = _token.burnPercentage();
        uint burnAmount = (amount * burnPercentage) / 100;
        return amount - burnAmount;
    }

    /// @notice calculate and update bucketLevel for whitelisted address
    /// @param amount_ the amount to update and check against
    /// @dev used to monitor whitelisted relayers from exceeding limits
    function _updateBucket(uint amount_) private {
        BucketCapacity storage bucket = isWhitelist[msg.sender];
        uint timePassed = block.timestamp - bucket.lastUpdateTimestamp;
        if (timePassed >= TIME_INTERVAL) {
            bucket.bucketLevel = 0;
            bucket.lastUpdateTimestamp = block.timestamp;
        } else {
            uint newBucketState = bucket.bucketLevel + amount_;
            require(
                newBucketState <= bucket.maxBucketCapacity,
                "Bridge: Bucket Capacity exceeded"
            );
        }
        bucket.bucketLevel += amount_;
    }
}
