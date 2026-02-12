import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ABI without JSON import assertions (more compatible across Node versions)
const abiPath = path.join(__dirname, "poolMarketAbi.json");
const ABI = JSON.parse(fs.readFileSync(abiPath, "utf-8"));

let _provider;
let _signer;

export function getProvider() {
  if (_provider) return _provider;
  if (!process.env.RPC_URL) throw new Error("RPC_URL missing in .env");
  _provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  return _provider;
}

export function getSigner() {
  if (_signer) return _signer;
  const provider = getProvider();
  if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY missing in .env");
  _signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return _signer;
}

export function getMarketContract(address, signerOrProvider) {
  const sp = signerOrProvider || getProvider();
  return new ethers.Contract(address, ABI.abi, sp);
}

export async function getUsdcContract() {
  const signer = getSigner();
  if (!process.env.USDC_ADDRESS) throw new Error("USDC_ADDRESS missing in .env");
  const usdcAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
  ];
  return new ethers.Contract(process.env.USDC_ADDRESS, usdcAbi, signer);
}
