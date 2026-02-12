const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying MockUSDC from the contracts folder...");

  // 1. Deploy the Token
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const token = await MockUSDC.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("✅ Success! New USDC Address:", address);

  // 2. Fund the Bot immediately
  const botAddress = "0xB6bC87E612A96Ec7D9587032713eD6892D29A137";
  console.log("💰 Minting 10,000 USDC to bot...");
  await token.mint(botAddress, "10000000000"); // 10,000 * 10^6
  console.log("✅ Bot Funded!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});