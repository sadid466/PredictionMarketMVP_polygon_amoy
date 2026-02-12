import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline/promises";
import { getSigner, getMarketContract } from "../src/chain.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deployedPath = path.join(__dirname, "../../shared/deployed.json");
if (!fs.existsSync(deployedPath)) {
  console.error("Missing shared/deployed.json. Deploy contracts first.");
  process.exit(1);
}
const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const marketId = await rl.question("Market ID to resolve (1-7): ");
  const outcome = await rl.question("Outcome YES? (true/false): ");
  rl.close();

  const m = deployed[String(marketId)];
  if (!m) throw new Error("Unknown market id");

  const signer = getSigner();
  const market = getMarketContract(m.contract, signer);
  const tx = await market.resolve(outcome.trim() === "true");
  await tx.wait();
  console.log("Resolved. tx=", tx.hash);
}

main().catch((e) => { console.error(e); process.exit(1); });
