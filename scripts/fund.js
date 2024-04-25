const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const sendValue = ethers.parseEther("0.1")
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("fundMe contract....")
  const resp = await fundMe.fund({value: sendValue})
  const rece = await resp.wait(1)
  console.log("fundMe end...")
}

main();
