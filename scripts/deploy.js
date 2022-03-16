// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const deploy = require("../lib/deploy");
const { ethers } = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("ContractFactory");
  const factory = await Factory.deploy();

  await factory.deployed();
  console.log("Factory deployed to:", factory.address);

  // let accounts;
  // accounts = await ethers.getSigners();
  
  // const purchase = await deploy(
  //   ethers.utils.parseEther("10"),
  //   accounts[0].address
  // ); 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
