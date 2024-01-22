const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log(
      "Deploying contracts with the account:",
      deployer.address
  );

  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(1000000);
  await myToken.deployed();

  const TokenSale = await hre.ethers.getContractFactory("TokenSale");
  const tokenSale = await TokenSale.deploy(myToken.address, 1, 3600);
  await tokenSale.deployed();

  console.log("MyToken deployed to:", myToken.address);
  console.log("TokenSale deployed to:", tokenSale.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
