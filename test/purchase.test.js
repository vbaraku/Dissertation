const { expect } = require("chai");
const { ethers } = require("hardhat");
const deploy = require("../lib/deploy");

describe("Purchase", function () {
  let accounts;
  before(async () => {
    accounts = await ethers.getSigners();
  });

  it("Should not be able to buy own product", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address
    );

    await expect(purchase.buy()).to.be.revertedWith(
      "You are the seller you can't purchase your own product"
    );
  });

  it("Should not be able to buy without right funds", async function () {
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address
    );
    const buyer = purchase.connect(accounts[1]);

    await expect(buyer.buy()).to.be.revertedWith("invalid amount");
  });

  it("Should not be able to change price if not owner", async function(){
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address
    )
    const buyer = purchase.connect(accounts[1]);

    await expect(buyer.setPrice(5)).to.be.revertedWith("Only the owner can change the price")
  });

  it("Should be able to change price if owner", async function(){
    const purchase = await deploy(
      ethers.utils.parseEther("10"),
      accounts[0].address
    )
    const owner = purchase.connect(accounts[0]);
    await owner.setPrice(ethers.utils.parseEther("11"));

    await expect(await ethers.utils.formatEther(await owner.getPrice())).to.be.equal("11.0")
  });

  it("Should be able to buy with right amount", async function () {
    const price = ethers.utils.parseEther("10");
    const purchase = await deploy(price, accounts[0].address);
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
});
