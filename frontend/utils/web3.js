import { ethers } from "ethers";
import ABI from "../abis/poolMarketAbi.json";

export async function getBrowserProvider() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

export async function getSigner() {
  const provider = await getBrowserProvider();
  return await provider.getSigner();
}

export function getMarketContract(address, signerOrProvider) {
  return new ethers.Contract(address, ABI.abi, signerOrProvider);
}

export function fmtUSDC(x) {
  try { return Number(ethers.formatUnits(x, 6)).toFixed(2); } catch { return "0.00"; }
}

export function toUSDC(amountStr) {
  return ethers.parseUnits(String(amountStr || "0"), 6);
}
