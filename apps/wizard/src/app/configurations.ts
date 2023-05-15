export const TEST_CONTRACT_1 = `
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract MyContract {
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
`;

export const TEST_CONTRACTS = [
    {
        name: "Simple Contract",
        content: TEST_CONTRACT_1,
    }
];

export const SOLIDITY_COMPILER_VERSION = "0.8.11+commit.d7f03943";
