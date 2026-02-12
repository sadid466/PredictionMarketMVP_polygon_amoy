/**
 * Deploys 7 PoolPredictionMarket contracts and writes deployed addresses to ../shared/deployed.json
 *
 * BEFORE RUNNING:
 * - Set env vars in contracts/.env (RPC_URL, PRIVATE_KEY, USDC_ADDRESS, ORACLE_ADDRESS)
 * - Edit the EXPIRY timestamps below (UTC unix seconds) for each market.
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const markets = require("../../shared/markets.json");

const { USDC_ADDRESS, ORACLE_ADDRESS } = process.env;
if (!USDC_ADDRESS || !ORACLE_ADDRESS) throw new Error("Missing USDC_ADDRESS or ORACLE_ADDRESS in .env");

const FEE_BPS = 200; // 2%

// TODO: set these before deploy. Use UTC unix seconds.
const EXPIRY_BY_ID = {
  1: 1798761599, // default: 2026-12-31 23:59:59 UTC (UPDATE to real event end time when known)
  2: 1798761599, // 2026-12-31 23:59:59 UTC
  3: 1798761599, // update if event date known
  4: 1798761599, // update if split date known
  5: 1798761599, // default: 2026-12-31 23:59:59 UTC (UPDATE to real event end time when known)
  6: 1798761599, // 2026-12-31 23:59:59 UTC
  7: 1798761599  // update to release+30d
};

async function main() {
  const { ethers } = require("hardhat");
  const Factory = await ethers.getContractFactory("PoolPredictionMarket");

  const deployed = {};

  // Only deploy first 4 markets to avoid gas issues
  for (const m of markets.slice(0, 4)) {
    const expiry = EXPIRY_BY_ID[m.id];
    if (!expiry) throw new Error("Missing expiry for market id " + m.id);

    try {
      const c = await Factory.deploy(m.question, expiry, USDC_ADDRESS, ORACLE_ADDRESS, FEE_BPS);
      await c.waitForDeployment();
      const addr = await c.getAddress();

      console.log(`[deployed] ${m.id} ${m.slug}: ${addr}`);
      deployed[m.id] = { ...m, contract: addr, expiry };
    } catch (e) {
      console.warn(`[failed] ${m.id} ${m.slug}: ${e.message}`);
      break; // Stop on first failure but save what we have
    }
  }

  const outPath = path.join(__dirname, "../../shared/deployed.json");
  fs.writeFileSync(outPath, JSON.stringify(deployed, null, 2));
  console.log("Wrote deployed addresses to", outPath);
}

main().catch((e) => { console.error(e); process.exit(1); });
