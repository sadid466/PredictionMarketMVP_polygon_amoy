import { ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
    console.log("🚀 Starting Mint Script...");

    // 1. Setup
    // If this fails, replace process.env.POLYGON_AMOY_RPC with "https://rpc-amoy.polygon.technology"
    const rpcUrl = "https://rpc-amoy.polygon.technology/"; 
    const privateKey = process.env.PRIVATE_KEY; 

    // 👇 STEP 1: PASTE THE USDC ADDRESS HERE (Inside the quotes) 👇
    const usdcAddress = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"; 
    
    // The Bot to fund
    const botAddress = "0xB6bC87E612A96Ec7D9587032713eD6892D29A137";

    if (!privateKey) {
        console.error("❌ Error: PRIVATE_KEY is missing in .env file");
        return;
    }

    // 2. Connect
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`🔌 Connected as Owner: ${wallet.address}`);
    console.log(`🏦 USDC Contract: ${usdcAddress}`);

    // 3. Mint
    const abi = ["function mint(address to, uint256 amount) public"];
    const usdcContract = new ethers.Contract(usdcAddress, abi, wallet);

    console.log(`🖨️  Minting 1,000 USDC to: ${botAddress}...`);

    try {
        // Mint 1000 tokens (with 6 decimals)
        const tx = await usdcContract.mint(botAddress, "1000000000");
        console.log("⏳ Transaction sent! Waiting...");
        
        await tx.wait();
        console.log("✅ Success! Money printed.");
        console.log(`👉 Tx Hash: ${tx.hash}`);
    } catch (error) {
        console.error("❌ Minting failed:", error.message);
    }
}

main();