// SPDX-License-Identifier: None
pragma solidity ^0.8.0;

/// @title Interface that describes the functions that the BSCBridge contract should implement
/// @author SteffQing
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details
interface IBridgeBase {
    /// @notice event that is emitted when a user deposits tokens on the BSC chain
    /// @dev event used to trigger the script to release tokens on the Tron chain
    /// @param from The address of the user who wants to deposit
    /// @param to The address of the user to receive the deposit on the Tron chain
    /// @param value The amount of tokens to be deposited
    event Deposit(address indexed from, string to, uint256 value);

    /// @notice event that is emitted when a user withdraws tokens on the BSC chain
    /// @dev event used to trigger the script to send x tokens on BSC to user
    /// @param to The address of the user who wants to withdraw
    /// @param value The amount of tokens to be withdrawn
    event Withdraw(string from, address indexed to, uint256 value);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Burn(address indexed from, uint256 value);

    /// @notice function to handle user's deposit which locks the token on the BSC chain
    /// @dev uses strings too denote address to receive deposit on the Tron chain
    /// @param to The address of the user who wants to deposit
    /// @param value The amount of tokens to be deposited
    function deposit(string calldata to, uint256 value) external;

    /// @notice function to handle user's withdrawal controlled by the bridge
    /// @param to The address of the user who wants to withdraw
    /// @param value The amount of tokens to be withdrawn
    function withdraw(string calldata from, address to, uint256 value) external;

    /// @notice function to burn tokens after deposit is confirmed on BSC
    /// @dev function is called by the bridge after deposit is confirmed on BSC
    /// @param from The address of the user depositing
    /// @param value The amount of tokens to be burnt
    function burn(address from, uint256 value) external;

    /// @notice function to check balance of bridge
    /// @return uint256 balance of bridge
    function bridgeBalance() external returns (uint);

    /// @notice Get information about the bridge contract
    /// @return crossBridgeAddress of the contract on the cross chain,
    /// @return minDepositAmount The minimum deposit amount required for bridging
    /// @return bridgeFees The fee amount required for bridging
    /// @return bridgeClosed The current state of the bridge
    function getBridgeInfo()
        external
        view
        returns (
            string memory crossBridgeAddress,
            uint256 minDepositAmount,
            uint256 bridgeFees,
            bool bridgeClosed
        );

    /**
     * @notice Check the status of a user's pending deposit
     * @param user The address of the user
     * @return hasPendingDeposit Whether the user has a pending deposit
     */
    function getDepositStatus(
        address user
    ) external view returns (bool hasPendingDeposit);

    /**
     * @notice Cancel a user's pending withdrawal and release locked tokens
     */
    function cancelPendingDeposit() external;

    /**
     * @notice Set the minimum deposit amount required for bridging
     * @param amount The new minimum deposit amount
     */
    function setMinDepositAmount(uint256 amount) external;

    /**
     * @notice Set the fee amount required for bridging
     * @param amount The new fee amount
     */
    function setBridgeFees(uint256 amount) external;

    /**
     * @notice Pause or unpause the bridge functionality in emergencies
     * @param paused Whether to pause (true) or unpause (false) the bridge
     */
    function emergencyPause(bool paused) external;

    /**
     * @notice Set a new bridge contract address (for upgrades, if needed)
     * @param newBridgeAddress The address of the new bridge contract
     */
    function setCrossBridgeContract(string calldata newBridgeAddress) external;

    /// @notice claim bridge fees callable by owner
    function claimFees() external;

    /// @notice set bridge admin callable by owner
    function setBridgeAdmin(address newAdmin) external;

    /// @notice add whitelisted address callable by owner
    function addWhitelistedAddress(address whitelist_) external;

    /// @notice remove whitelisted address callable by owner
    function removeWhitelistedAddress(address whitelist_) external;
}
