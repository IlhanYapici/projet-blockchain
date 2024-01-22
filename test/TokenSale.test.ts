import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenSale", function () {
    it("Should set the right sale duration", async function () {
        const MyToken = await ethers.getContractFactory("MyToken");
        const myToken = await MyToken.deploy(1000000);

        const TokenSale = await ethers.getContractFactory("TokenSale");
        const tokenSale = await TokenSale.deploy(myToken.address, 1, 3600);

        expect(await tokenSale.saleStart()).to.be.a('number');
        expect(await tokenSale.saleEnd()).to.equal(await tokenSale.saleStart() + 3600);
    });

    // Add more tests as needed...
});
