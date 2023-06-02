import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Profile Extension", function () {
  async function deployProfileFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, ...otherAccounts] = await ethers.getSigners();

    const VRC1 = await ethers.getContractFactory("VRC1");
    const vrc1 = await VRC1.deploy();

    return { vrc1, owner, otherAccounts };
  }

  // Data for tests
  const TEST_PROFILES = [
    {
      name: "John Doe",
      bio: "Software Developer",
      avatar: "https://example.com/avatar.jpg",
      location: "New York",
      website: "https://example.com",
    },
    {
      name: "John Doe 123",
      bio: "Senior Software Developer 123",
      avatar: "https://example.com/avatar.jpg 123",
      location: "San Francisco 123",
      website: "https://example.com 123",
    },
  ];
  const TEST_EXTENSIONS = ["initial extension", "updated extension"];

  describe("Profile creation and update", function () {
    it("Should create a profile", async function () {
      const { owner, vrc1 } = await loadFixture(deployProfileFixture);

      // Set the profile for the user
      await vrc1.setProfile(TEST_PROFILES[0]);

      // Retrieve the profile
      const result = await vrc1.profiles(owner.address);
      const resultObject = {
        name: result.name,
        bio: result.bio,
        avatar: result.avatar,
        location: result.location,
        website: result.website,
      };

      // Assert the retrieved profile matches the expected values
      expect(resultObject).to.deep.equal(TEST_PROFILES[0]);
    });

    it("Should update the existing profile", async function () {
      const { owner, vrc1 } = await loadFixture(deployProfileFixture);

      // Set the initial profile for the user
      await vrc1.setProfile(TEST_PROFILES[0]);

      // Update the profile for the user
      await vrc1.setProfile(TEST_PROFILES[1]);

      // Retrieve the updated profile
      const result = await vrc1.profiles(owner.address);
      const resultObject = {
        name: result.name,
        bio: result.bio,
        avatar: result.avatar,
        location: result.location,
        website: result.website,
      };

      // Assert the retrieved profile matches the updated values
      expect(resultObject).to.deep.equal(TEST_PROFILES[1]);
    });
  });

  describe("Profile extension creation and update", function () {
    it("Should create a profile extension", async function () {
      const { owner, vrc1 } = await loadFixture(deployProfileFixture);

      // Set the profile extension for the user
      await vrc1.setProfileExtension(TEST_EXTENSIONS[0]);

      // Retrieve the profile extension
      const result = await vrc1.profileExtensions(owner.address);

      // Assert the retrieved profile matches the expected values
      expect(result).to.equal(TEST_EXTENSIONS[0]);
    });

    it("Should update the profile extension", async function () {
      const { owner, vrc1 } = await loadFixture(deployProfileFixture);

      // Set the profile extension for the user
      await vrc1.setProfileExtension(TEST_EXTENSIONS[0]);
      // Update the profile extension for the user
      await vrc1.setProfileExtension(TEST_EXTENSIONS[1]);

      // Retrieve the updated profile extension
      const result = await vrc1.profileExtensions(owner.address);

      // Assert the retrieved profile extension matches the updated values
      expect(result).to.equal(TEST_EXTENSIONS[1]);
    });
  });

  describe("Events", function () {
    it("Should emit an event on profile creation", async function () {
      const { vrc1 } = await loadFixture(deployProfileFixture);

      // Check if event is emmited on profile creation
      await expect(vrc1.setProfile(TEST_PROFILES[0])).to.emit(
        vrc1,
        "ProfileChanged"
      );
    });

    it("Should emit an event on profile update", async function () {
      const { vrc1 } = await loadFixture(deployProfileFixture);

      await vrc1.setProfile(TEST_PROFILES[0]);

      // Check if event is emmited on profile update
      await expect(vrc1.setProfile(TEST_PROFILES[1])).to.emit(
        vrc1,
        "ProfileChanged"
      );
    });

    it("Should emit an event on profile extension creation", async function () {
      const { vrc1, owner } = await loadFixture(deployProfileFixture);

      // Check if event is emmited on profile extension creation
      await expect(vrc1.setProfileExtension(TEST_EXTENSIONS[0]))
        .to.emit(vrc1, "ProfileExtensionChanged")
        .withArgs(owner.address, TEST_EXTENSIONS[0]);
    });

    it("Should emit an event on profile extension update", async function () {
      const { vrc1, owner } = await loadFixture(deployProfileFixture);

      await vrc1.setProfileExtension(TEST_EXTENSIONS[0]);

      // Check if event is emmited on profile extension update
      await expect(vrc1.setProfileExtension(TEST_EXTENSIONS[1]))
        .to.emit(vrc1, "ProfileExtensionChanged")
        .withArgs(owner.address, TEST_EXTENSIONS[1]);
    });
  });
});
