// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Counter {
    uint public count;

    error CountCannotBeNegative();

    event Incremented(uint value);
    event Decremented(uint value);
    event Reset(uint value);

    // Function to get the current count
    function get() public view returns (uint) {
        return count;
    }

    // Function to increment count by 1
    function inc() public {
        count += 1;
        emit Incremented(count);
    }

    // Function to decrement count by 1
    function dec() public {
        // This function will fail if count = 0
        if (count == 0) {
            revert CountCannotBeNegative();
        }
        // Equivalent to :
        // require(count > 0, "Count cannot be negative");

        count -= 1;
        emit Decremented(count);
    }

    function reset() public {
        count = 0;
        emit Reset(count);
    }
}
