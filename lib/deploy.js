module.exports = async (title ,amount, address, cids) => {
  const hre = require("hardhat");
  const accounts = await hre.ethers.getSigners();
  const Purchase = await hre.ethers.getContractFactory("Purchase");
  const purchase = await Purchase.deploy(title, amount, address, cids);

  await purchase.deployed();

  return purchase;
};
