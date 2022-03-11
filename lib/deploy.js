module.exports = async (amount, address) => {
  const hre = require("hardhat");
  const accounts = await hre.ethers.getSigners();
  const Purchase = await hre.ethers.getContractFactory("Purchase");
  const purchase = await Purchase.deploy(amount, address);

  await purchase.deployed();

  return purchase;
};
