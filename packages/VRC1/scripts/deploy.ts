import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const VRC1 = await ethers.getContractFactory(
    "VRC1"
  );
  const contract = await VRC1.deploy();

  await contract.deployed();

  console.log(`VRC1 contract deployed to ${contract.address}`);

  const data = {
    address: contract.address,
    abi: JSON.parse(contract.interface.format("json") as string),
  };

  //This writes the ABI and address to the mktplace.json
  fs.writeFileSync("./VRC1.json", JSON.stringify(data));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
