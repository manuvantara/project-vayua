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

    event ProfileChanged(address owner, Profile profile);

    function setProfile(Profile calldata _profile) external {
        profiles[msg.sender] = _profile;
        emit ProfileChanged(msg.sender, _profile);
    }

    function setExtra(string calldata _extra) external {
        profiles[msg.sender].extra = _extra;
        emit ProfileChanged(msg.sender, profiles[msg.sender]);
    }
}
