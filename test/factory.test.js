const { expect } = require("chai");
const { ethers } = require("hardhat");
const deploy = require("../lib/deploy");

describe("Factory", function () {
  let accounts;
  before(async () => {
    accounts = await ethers.getSigners();
  });

  it("Should deply new contracts", async function () {
      //deploy factory
    const contractFactory = await deploy();
    //have factory create 2 contracts
    await factory.createPurchase(ethers.utils.parseEther("10"), {
        msg.sender = accounts[0];
        //not sure how to pass a different msg sender
    });
    await factory.createPurchase(ethers.utils.parseEther("11"), {
        msg.sender = accounts[1];
    });

    //expect that when i call factory.getContracts() ill get the 2 contracts
    await expect()(
    );
  });

  let factory;
  beforeEach(async () => {
    factory = await Factory.deployed();
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
});
