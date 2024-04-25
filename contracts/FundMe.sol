// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "contracts/PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant minMoney = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmount;
    address public immutable owner;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return priceFeed;
    }

    //0x694AA1769357215DE4FAC081bf1f309aDC325306
    //fund - 资金 funder - 提供资金者
    function fund() public payable {
        //人们可以通过这个函数来发送资金
        //msg.value有18位是在小数之后, 因为一个ETH是10^18个wei
        //require(msg.value.getConversionRate() >= minMoney, "Didn't send enough");
        if (msg.value.getConversionRate(priceFeed) < minMoney) {
            revert FundMe__NotOwner();
        }
        funders.push(msg.sender);
        addressToAmount[msg.sender] = msg.value;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function withdraw() public onlyOwner {
        //合约的拥有者可以提取不同的funder发送的资金

        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            addressToAmount[funder] = 0;
        }

        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "error");
    }

    function cheapWithdraw() public payable onlyOwner {
        address[] memory m_funder = funders;
        for(uint256 i=0; i<m_funder.length; i++){
            address funder = m_funder[i];
            addressToAmount[funder] = 0;
        }
        funders = new address[](0);
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }

    modifier onlyOwner() {
        //require(owner == msg.sender, "not owner");
        if (owner != msg.sender) {
            revert FundMe__NotOwner();
        }
        _;
    }
}
