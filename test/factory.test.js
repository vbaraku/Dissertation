const { expect } = require("chai");
const { ethers } = require("hardhat");
const deploy = require("../lib/deploy");

describe("Factory", function () {
  let accounts;
  before(async () => {
    accounts = await ethers.getSigners();
  });

  it("Should deploy contract correctly", async function () {
    const Factory = await ethers.getContractFactory("ContractFactory");
    const contractFactory = await Factory.deploy();
    const testCIDs = ["abc", "def"];
    const testTitle = "Title of contract";

    await contractFactory
      .connect(accounts[0])
      .createPurchase(testTitle, ethers.utils.parseEther("10"), testCIDs);
    await contractFactory
      .connect(accounts[1])
      .createPurchase(testTitle, ethers.utils.parseEther("11"), testCIDs);

    const returnedAddresses = await contractFactory.getContracts();

    const Purchase = await ethers.getContractFactory("Purchase");
    let purchase = Purchase.attach(returnedAddresses[0]);
    let purchase2 = Purchase.attach(returnedAddresses[1]);

    await expect(await purchase.getOwner()).to.be.equal(accounts[0].address);
    
    await expect(
      await ethers.utils.formatEther(await purchase.getPrice())
    ).to.be.equal("10.0");

    await expect(await purchase2.getOwner()).to.be.equal(accounts[1].address);
    
    await expect(
      await ethers.utils.formatEther(await purchase2.getPrice())
    ).to.be.equal("11.0");
  });

});
