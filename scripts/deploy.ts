import { ethers } from "hardhat";

async function main() {

  const MockPermitToken = await ethers.getContractFactory("MockPermitToken");
  const mock = await MockPermitToken.deploy();

  await mock.deployed();
  const owner = await mock.OWNER()
  console.log(
    `MockPermitToken deployed to ${mock.address} with owner ${owner}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
