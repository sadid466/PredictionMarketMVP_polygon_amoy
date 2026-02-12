import { ethers } from "ethers";
import { getSigner, getMarketContract } from "./chain.js";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function ensureApproval(usdc, owner, spender, minAllowance) {
  const allowance = await usdc.allowance(owner, spender);
  if (allowance >= minAllowance) return;
  const tx = await usdc.approve(spender, ethers.MaxUint256);
  await tx.wait();
}

export async function startBots(deployed) {
  const signer = getSigner();
  const botAddress = await signer.getAddress();

  const { getUsdcContract } = await import("./chain.js");
  const usdc = await getUsdcContract();

  console.log("MM bot wallet:", botAddress);

  for (const [id, m] of Object.entries(deployed)) {
    const contractAddr = m.contract;
    const market = getMarketContract(contractAddr, signer);

    // approve once (best effort)
    try {
      await ensureApproval(usdc, botAddress, contractAddr, 1n);
      console.log(`[approve] market ${id} ok`);
    } catch (e) {
      console.warn(`[approve] market ${id} failed:`, e.message);
    }

    const min = Number(m.min_trade_usdc ?? 1);
    const max = Number(m.max_trade_usdc ?? 10);
    const p = Number(m.initial_yes_prob ?? 0.5);

    const intervalMs = 60_000; // 60 seconds
    setInterval(async () => {
      try {
        // Skip if expired
        const expiry = await market.expiry();
        const now = Math.floor(Date.now() / 1000);
        if (now >= Number(expiry)) return;

        const amount = randInt(min, max);
        const yesSide = Math.random() < p;

        const amt = ethers.parseUnits(String(amount), 6);
        const tx = yesSide ? await market.buyYes(amt) : await market.buyNo(amt);
        await tx.wait();

        console.log(`[bot] market ${id} ${yesSide ? "YES" : "NO"} ${amount} USDC tx=${tx.hash}`);
      } catch (e) {
        console.warn(`[bot] market ${id} error:`, e.message);
      }
    }, intervalMs);
  }
}
