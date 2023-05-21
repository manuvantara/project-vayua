import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Profile Collection", function () {
  async function deployProfileFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, ...otherAccounts] = await ethers.getSigners();

    const ProfileCollection = await ethers.getContractFactory(
      "ProfileCollection"
    );
    const profileCollection = await ProfileCollection.deploy();

    return { profileCollection, owner, otherAccounts };
  }

  it("Should set and retrieve a profile", async function () {
    const { owner, profileCollection } = await loadFixture(
      deployProfileFixture
    );

    const initialProfile = {
      name: "John Doe",
      bio: "Software Developer",
      avatar: "https://example.com/avatar.jpg",
      location: "New York",
      website: "https://example.com",
      extra: "Extra information",
    };

    // Set the profile for the user
    await profileCollection.setProfile(initialProfile);

    // Retrieve the profile
    const result = await profileCollection.profiles(owner.address);
    const resultObject = {
      name: result.name,
      bio: result.bio,
      avatar: result.avatar,
      location: result.location,
      website: result.website,
      extra: result.extra,
    };

    // Assert the retrieved profile matches the expected values
    expect(resultObject).to.deep.equal(initialProfile);
  });

  it("Should update an existing profile", async function () {
    const { owner, profileCollection } = await loadFixture(
      deployProfileFixture
    );

    const initialProfile = {
      name: "John Doe",
      bio: "Software Developer",
      avatar: "https://example.com/avatar.jpg",
      location: "New York",
      website: "https://example.com",
      extra: "Extra information",
    };

    const updatedProfile = {
      name: "John Doe",
      bio: "Senior Software Developer",
      avatar: "https://example.com/avatar.jpg",
      location: "San Francisco",
      website: "https://example.com",
      extra: "Updated extra information",
    };

    // Set the initial profile for the user
    await profileCollection.setProfile(initialProfile);

    // Update the profile for the user
    await profileCollection.setProfile(updatedProfile);

    // Retrieve the updated profile
    const result = await profileCollection.profiles(owner.address);
    const resultObject = {
      name: result.name,
      bio: result.bio,
      avatar: result.avatar,
      location: result.location,
      website: result.website,
      extra: result.extra,
    };

    // Assert the retrieved profile matches the updated values
    expect(resultObject).to.deep.equal(updatedProfile);
  });
});
