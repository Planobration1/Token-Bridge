// SPDX-License-Identifier: None
pragma solidity ^0.8.0;

library AddressLengthLib {
    /// @dev Returns the length of an address in bytes
    /// @param _str The address to get the length of
    /// @param _length The length to check against
    /// @return boolean value too confirm the address length
    function isAddressLengthEqualTo(
        string memory _str,
        uint _length
    ) public pure returns (bool) {
        bytes memory strBytes = bytes(_str);
        return strBytes.length == _length;
    }
}
