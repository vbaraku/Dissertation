// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const deploy = require("../lib/deploy");
const { ethers } = require("hardhat");

async function main() {
  let accounts;
  accounts = await ethers.getSigners();
  const purchase = await deploy(
    ethers.utils.parseEther("10"),
    accounts[0].address
  );
  console.log("Purchase deployed to:", purchase.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
