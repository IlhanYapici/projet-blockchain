import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Counter", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deploy() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Counter = await ethers.getContractFactory("Counter");
        const counter = await Counter.deploy();

        return { counter, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            const { counter } = await loadFixture(deploy);

            expect(await counter.getAddress()).not.undefined;
        });

        it("Should increment", async function () {
            const { counter } = await loadFixture(deploy);

            await expect(counter.inc()).to.emit(counter, "Increment");

            expect(await counter.get()).to.equal(1);
        });

        it("Should decrement", async function () {
            const { counter } = await loadFixture(deploy);

            await counter.inc();
            await counter.dec();

            expect(await counter.get()).to.equal(0);
        });

        it("Should revert", async function () {
            const { counter } = await loadFixture(deploy);

            await expect(counter.dec()).to.revertedWithCustomError(
                counter,
                "CountCannotBeNegative"
            );
        });
    });
});
