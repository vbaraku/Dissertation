const { expect } = require("chai");
const { ethers } = require("hardhat");
const deploy = require("../lib/deploy");

describe("Purchase", function () {
  let accounts;
  let testCIDs = ["abc", "def"];
  before(async () => {
    accounts = await ethers.getSigners();
  });

  it("Should not be able to buy own product", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address,
      testCIDs
    );

    await expect(purchase.buy()).to.be.revertedWith(
      "You are the seller you can't purchase your own product"
    );
  });

  it("Should not be able to buy without right funds", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address,
      testCIDs
    );
    const buyer = purchase.connect(accounts[1]);

    await expect(buyer.buy()).to.be.revertedWith("invalid amount");
  });

  it("Should not be able to change price if not owner", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address,
      testCIDs
    );
    const buyer = purchase.connect(accounts[1]);

    await expect(buyer.setPrice(5)).to.be.revertedWith(
      "Only the owner can do this action"
    );
  });

  it("Should be able to change price if owner", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address,
      testCIDs
    );
    const owner = purchase.connect(accounts[0]);
    await owner.setPrice(ethers.utils.parseEther("11"));

    await expect(
      await ethers.utils.formatEther(await owner.getPrice())
    ).to.be.equal("11.0");
  });

  it("Should be able to buy with right amount", async function () {
    const price = ethers.utils.parseEther("10");
    const purchase = await deploy(price, accounts[0].address, testCIDs);
    const buyer = purchase.connect(accounts[1]);

    const buyerInitialBalance = await ethers.provider.getBalance(
      accounts[1].address
    );
    const sellerInitialBalance = await ethers.provider.getBalance(
      accounts[0].address
    );
    const transaction = await buyer.buy({
      value: price,
    });

    const receipt = await transaction.wait();
    const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);

    await expect(
      await ethers.provider.getBalance(accounts[1].address)
    ).to.be.equal(buyerInitialBalance.sub(price).sub(gasUsed));

    await expect(
      await ethers.provider.getBalance(accounts[0].address)
    ).to.be.equal(sellerInitialBalance.add(price));
  });

  it("Should return a random hash from an array", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address,
      testCIDs
    );
    const testHash1 = ethers.utils.keccak256("0x1234");
    const testHash2 = ethers.utils.keccak256("0x5678");
    const testHash3 = ethers.utils.keccak256("0x9999");
    const testSampleKeys = [testHash1, testHash2, testHash3];
    const owner = purchase.connect(accounts[0]);

    await owner.pickHashedSample(testSampleKeys);
    const pickedSample = await owner.returnRandomHashPicked();
    await expect(pickedSample).to.be.equal(testHash1);
  });

  it("Should match unhashed to the initial hash", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address,
      testCIDs
    );
    const testUnHashed = "0x1234";
    const testHash1 = ethers.utils.keccak256(testUnHashed);

    const testSampleKeys = [testHash1];
    const owner = purchase.connect(accounts[0]);

    await owner.pickHashedSample(testSampleKeys);
    await owner.putUnhashedSample(testUnHashed);
    const unHashReturned = await owner.returnUnHashedSample();

    await expect(testUnHashed).to.be.equal(unHashReturned);
  });

  it("Should be able to purchase", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address,
      testCIDs
    );
    const price = ethers.utils.parseEther("10");
    const buyer = purchase.connect(accounts[1]);
    const buyerInitialBalance = await ethers.provider.getBalance(
      accounts[1].address
    );
    const transaction = await buyer.purchaseProducts({
      value: price,
    });
    const receipt = await transaction.wait();
    const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);
    await expect(
      await ethers.provider.getBalance(accounts[1].address)
    ).to.be.equal(buyerInitialBalance.sub(price).sub(gasUsed));
  });

  it("Should be able to withdraw", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("20"),
      accounts[0].address,
      testCIDs
    );
    const owner = purchase.connect(accounts[0]);
    const ownerInitialBalance = await ethers.provider.getBalance(
      accounts[0].address
    );
    const buyer = purchase.connect(accounts[1]);
    const price = ethers.utils.parseEther("20");

    const testHash1 = ethers.utils.keccak256("0x1234");
    const testHash2 = ethers.utils.keccak256("0x5678");
    const testHash3 = ethers.utils.keccak256("0x9999");
    const testSampleKeys = [testHash1, testHash2, testHash3];
    const testUnHashedKeys = ["0x1234", "0x5678", "0x9999"];

    const transaction1 = await owner.pickHashedSample(testSampleKeys);
    const receipt1 = await transaction1.wait();
    const gasUsed1 = receipt1.cumulativeGasUsed.mul(receipt1.effectiveGasPrice);
    await buyer.purchaseProducts({
      value: price,
    });

    const transaction2 = await owner.withdraw(testUnHashedKeys);
    const receipt2 = await transaction2.wait();
    const gasUsed2 = receipt2.cumulativeGasUsed.mul(receipt2.effectiveGasPrice);

    await expect(
      await ethers.provider.getBalance(accounts[0].address)
    ).to.be.equal(ownerInitialBalance.add(price).sub(gasUsed1).sub(gasUsed2));
  });
});
