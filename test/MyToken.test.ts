import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyToken", function () {
    it("Should return the right name and symbol", async function () {
        const MyToken = await ethers.getContractFactory("MyToken");
        const myToken = await MyToken.deploy(1000000);

        expect(await myToken.name()).to.equal("MyCompanyToken");
        expect(await myToken.symbol()).to.equal("MCT");
    });

    // Add more tests as needed...
});
