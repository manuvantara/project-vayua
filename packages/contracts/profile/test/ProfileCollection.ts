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

  const initialProfile = {
    name: "John Doe",
    bio: "Software Developer",
    avatar: "https://example.com/avatar.jpg",
    location: "New York",
    website: "https://example.com",
    extra: "Extra information",
  };

  const updatedProfile = {
    name: "John Doe 123",
    bio: "Senior Software Developer 123",
    avatar: "https://example.com/avatar.jpg 123",
    location: "San Francisco 123",
    website: "https://example.com 123",
    extra: "Extra information 123",
  };

  const updatedExtraProfile = {
    name: "John Doe",
    bio: "Software Developer",
    avatar: "https://example.com/avatar.jpg",
    location: "New York",
    website: "https://example.com",
    extra: "Updated extra information",
  };

  describe("Profile creation and update", function () {
    it("Should set and retrieve a profile", async function () {
      const { owner, profileCollection } = await loadFixture(
        deployProfileFixture
      );

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

  describe("Extra field update", function () {
    it("Should update extra field on existing profile", async function () {
      const { owner, profileCollection } = await loadFixture(
        deployProfileFixture
      );

      await profileCollection.setProfile(initialProfile);
      await profileCollection.setExtra("Updated extra information");
      const result = await profileCollection.profiles(owner.address);
      const resultObject = {
        name: result.name,
        bio: result.bio,
        avatar: result.avatar,
        location: result.location,
        website: result.website,
        extra: result.extra,
      };

      expect(resultObject).to.deep.equal(updatedExtraProfile);
    });

    it("Should not update extra field on non-existing profile", async function () {
      const { owner, profileCollection } = await loadFixture(
        deployProfileFixture
      );

      await expect(
        profileCollection.setExtra("Updated extra information")
      ).to.be.revertedWith("Profile does not exist");
    });
  });

  describe("Events", function () {
    it("Should emit an event on profile creation", async function () {
      const { profileCollection } = await loadFixture(deployProfileFixture);

      await expect(profileCollection.setProfile(initialProfile)).to.emit(
        profileCollection,
        "ProfileChanged"
      );
    });

    it("Should emit an event on profile update", async function () {
      const { profileCollection } = await loadFixture(deployProfileFixture);

      await profileCollection.setProfile(initialProfile);

      await expect(profileCollection.setProfile(updatedProfile)).to.emit(
        profileCollection,
        "ProfileChanged"
      );
    });

    it("Should emit an event on extra field update", async function () {
      const { profileCollection, owner } = await loadFixture(
        deployProfileFixture
      );

      await profileCollection.setProfile(initialProfile);

      await expect(profileCollection.setExtra("Updated extra"))
        .to.emit(profileCollection, "ProfileChanged")
        .withArgs(
          owner.address,
          await profileCollection.profiles(owner.address)
        );
    });
  });
});
