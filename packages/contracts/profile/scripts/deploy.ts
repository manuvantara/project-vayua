import { ethers } from "hardhat";

async function main() {
  const ProfileCollection = await ethers.getContractFactory(
    "ProfileCollection"
  );
  const profileCollection = await ProfileCollection.deploy();

  await profileCollection.deployed();

  console.log(`Profile contract deployed to ${profileCollection.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
