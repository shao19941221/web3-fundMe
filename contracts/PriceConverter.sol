// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {

function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256){
//ABI
//address 0x694AA1769357215DE4FAC081bf1f309aDC325306
//AggregatorV3Interface agg = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
(, int256 price, , , ) = priceFeed.latestRoundData();
//ETH相对于USD的价格
//3000个USD : 1ETH
//pricefeed返回的值有8个0在小数点之后, 3000.00000000, 喂价是8位小数, msg.value是18位小数, 为了统一单位, 喂价需要*1e10
return uint256(price * 1e10);//这里*1e10是统一转换为wei单位, 因为喂价后面就跟8个0所以就乘10 加起来是18个0; msg.value本身就是wei单位
}

function getConversionRate(uint256 _ethAmount, AggregatorV3Interface priceFeed) internal view returns(uint256) {
uint256 price = getPrice(priceFeed);
return (_ethAmount * price) / 1e18;
}

function getVerson() internal view returns(uint256){
AggregatorV3Interface agg = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
return agg.version();
}


}