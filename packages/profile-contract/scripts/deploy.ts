import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const ProfileCollection = await ethers.getContractFactory(
    "ProfileCollection"
  );
  const profileCollection = await ProfileCollection.deploy();

  await profileCollection.deployed();

  console.log(`Profile contract deployed to ${profileCollection.address}`);

  const data = {
    address: profileCollection.address,
    abi: JSON.parse(profileCollection.interface.format("json") as string),
  };

  //This writes the ABI and address to the mktplace.json
  fs.writeFileSync("./profile-contract.json", JSON.stringify(data));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
