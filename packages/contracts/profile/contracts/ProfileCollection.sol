// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract ProfileCollection {
    struct Profile {
        string name;
        string bio;
        string avatar;
        string location;
        string website;
        string extra;
    }

    mapping(address => Profile) public profiles;

    function setProfile(Profile calldata _profile) external {
        profiles[msg.sender] = _profile;
    }
}
