import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import { getSigner, getUsdcContract } from "../src/chain.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deployedPath = path.join(__dirname, "../../shared/deployed.json");
if (!fs.existsSync(deployedPath)) {
  console.error("Missing shared/deployed.json. Deploy contracts first.");
  process.exit(1);
}
const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));

async function main() {
  const signer = getSigner();
  const botAddress = await signer.getAddress();
  const usdc = await getUsdcContract();

  console.log("Approving USDC spend for bot wallet:", botAddress);

  for (const [id, m] of Object.entries(deployed)) {
    const spender = m.contract;
    const allowance = await usdc.allowance(botAddress, spender);
    if (allowance > 0n) {
      console.log(`[skip] market ${id} already has allowance`);
      continue;
    }
    const tx = await usdc.approve(spender, ethers.MaxUint256);
    await tx.wait();
    console.log(`[ok] market ${id} approved tx=${tx.hash}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
