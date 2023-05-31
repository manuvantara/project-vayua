// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Vayua Request For Comment #1 (VRC1)
contract VRC1 {
    struct Profile {
        string name;
        string bio;
        string avatar;
        string location;
        string website;
    }

    mapping(address => Profile) public profiles;
    mapping(address => string)  public profileExtensions;

    event ProfileChanged(address profileOwner, Profile profile);
    event profileExtensionChanged(address profileOwner, string extension);

    function setProfile(Profile calldata _profile) external {
        profiles[msg.sender] = _profile;
        emit ProfileChanged(msg.sender, _profile);
    }

    function setProfileExtension(string calldata _extension) external {
        profileExtensions[msg.sender] = _extension;
        emit profileExtensionChanged(msg.sender, _extension);
    }
}
