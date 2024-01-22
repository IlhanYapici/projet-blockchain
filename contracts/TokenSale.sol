// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {GlockToken} from "./GlockToken.sol";

contract TokenSale is Ownable {
    GlockToken public token;
    uint256 public tokenPrice;
    uint256 public saleStart;
    uint256 public saleEnd;
    bool public closed;

    constructor(GlockToken _token, uint256 _tokenPrice, uint256 _saleDuration, address initialOwner) Ownable(initialOwner) {
        token = _token;
        tokenPrice = _tokenPrice;
        saleStart = block.timestamp;
        saleEnd = saleStart + _saleDuration;
    }

    function buyTokens() public payable {
        require(block.timestamp >= saleStart && block.timestamp <= saleEnd, "Sale is not open");

        uint256 _numberOfTokens = msg.value * tokenPrice;

        require(token.balanceOf(address(this)) >= _numberOfTokens, "Not enough tokens left");

        token.transfer(msg.sender, _numberOfTokens);
    }

    function endSale() public onlyOwner {
        require(block.timestamp > saleEnd, "Sale is not over yet");

        // Transfer remaining tokens back to owner
        uint256 remainingTokens = token.balanceOf(address(this));
        if (remainingTokens > 0) {
            token.transfer(owner(), remainingTokens);
        }

        // Transfer collected Ethers to owner
        payable(owner()).transfer(address(this).balance);

        closed = true;
    }
}
