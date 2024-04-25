const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")


developmentChains.includes(network.name) ? describe.skip :

describe("FundMe", async function() {
    
    let deployer
    let fundMe
    const sendValue = ethers.parseEther("1")
    beforeEach("before", async function() {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)

    })
})