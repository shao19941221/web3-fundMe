const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { int } = require("hardhat/internal/core/params/argumentTypes");

describe("FundMe", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.parseEther("1");
  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function () {
    it("set args", async function () {
      const resp = await fundMe.getPriceFeed();
      assert.equal(mockV3Aggregator.target, resp);
    });
  });

  describe("fund", async function () {
    it("start fund", async function () {
      await expect(fundMe.fund()).to.be.reverted;
    });

    it("update amount", async function () {
      await fundMe.fund({ value: sendValue });
      const resp = await fundMe.addressToAmount(deployer);
      assert.equal(resp.toString(), sendValue.toString());
    });

    it("add funder", async function () {
      await fundMe.fund({ value: sendValue });
      const resp = await fundMe.funders(0);
      assert.equal(resp.toString(), deployer);
    });
  });

  describe("withdraw", async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });

    it("starting", async function () {
      const startingDeployBalance = await ethers.provider.getBalance(deployer);
      const startingAddressBalance = await ethers.provider.getBalance(
        fundMe.target
      );

      const resp = await fundMe.withdraw();
      const rece = await resp.wait(1);

      const { gasPrice, gasUsed } = rece;
      const gasCost = gasPrice * gasUsed;

      const endingDeployBalance = await ethers.provider.getBalance(deployer);
      const endingAddressBalance = await ethers.provider.getBalance(
        fundMe.target
      );

      assert.equal(endingAddressBalance, 0);
      assert.equal(
        (startingDeployBalance + startingAddressBalance).toString(),
        (endingDeployBalance + gasCost).toString()
      );
    });

    it("mul funder", async function () {
        const accounts = await ethers.getSigners()
        for (let i = 1; i<6; i++){
           const fundConnect = await fundMe.connect(accounts[i])
           await fundConnect.fund({ value: sendValue })
        }

        const startingDeployBalance = await ethers.provider.getBalance(deployer);
        const startingAddressBalance = await ethers.provider.getBalance(
          fundMe.target
        );
  
        const resp = await fundMe.withdraw();
        const rece = await resp.wait(1);
  
        const { gasPrice, gasUsed } = rece;
        const gasCost = gasPrice * gasUsed;
  
        const endingDeployBalance = await ethers.provider.getBalance(deployer);
        const endingAddressBalance = await ethers.provider.getBalance(
          fundMe.target
        );
  
        assert.equal(endingAddressBalance, 0);
        assert.equal(
          (startingDeployBalance + startingAddressBalance).toString(),
          (endingDeployBalance + gasCost).toString()
        );

        await expect(fundMe.funders(0)).to.be.reverted
        for(let j=1; j<6; j++){
            assert.equal(await fundMe.addressToAmount(accounts[j].address), 0)
        }

    });

    it("attack", async function() {
        const accounts = await ethers.getSigners()
        const attack = await fundMe.connect(accounts[1])
        await expect(attack.withdraw()).to.be.reverted
    });

    it("cheap withdraw", async function () {
        const accounts = await ethers.getSigners()
        for (let i = 1; i<6; i++){
           const fundConnect = await fundMe.connect(accounts[i])
           await fundConnect.fund({ value: sendValue })
        }

        const startingDeployBalance = await ethers.provider.getBalance(deployer);
        const startingAddressBalance = await ethers.provider.getBalance(
          fundMe.target
        );
  
        const resp = await fundMe.cheapWithdraw();
        const rece = await resp.wait(1);
  
        const { gasPrice, gasUsed } = rece;
        const gasCost = gasPrice * gasUsed;
  
        const endingDeployBalance = await ethers.provider.getBalance(deployer);
        const endingAddressBalance = await ethers.provider.getBalance(
          fundMe.target
        );
  
        assert.equal(endingAddressBalance, 0);
        assert.equal(
          (startingDeployBalance + startingAddressBalance).toString(),
          (endingDeployBalance + gasCost).toString()
        );

        await expect(fundMe.funders(0)).to.be.reverted
        for(let j=1; j<6; j++){
            assert.equal(await fundMe.addressToAmount(accounts[j].address), 0)
        }

    });



  });
});
