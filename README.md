# Gaming Prediction Market MVP — Polygon Amoy (Testnet)

This package is set up to deploy and run on **Polygon PoS Amoy testnet** (Mumbai replacement).
It’s designed so a cheap freelancer can deploy quickly and you can validate end‑to‑end flows:
**connect wallet → approve USDC → buy YES/NO → resolve → withdraw**.

## Network defaults (already wired)
- **Network:** Polygon Amoy testnet
- **Chain ID:** 80002
- **RPC:** https://rpc-amoy.polygon.technology
- **Explorer:** https://amoy.polygonscan.com
- **Test USDC address:** 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582 (Circle testnet USDC)

## What’s inside
- `contracts/` Hardhat project + Solidity contract + deploy script for all 7 markets
- `backend/` Express API + MM bot + approve + resolve scripts
- `frontend/` Next.js app (wallet connect + buy YES/NO + withdraw)
- `shared/markets.json` market definitions + suggested MM parameters
- `shared/deployed.json` written automatically after deploy (frontend + backend read it)

---

# 1) Prerequisites
Install:
- Node.js 18+ (recommended)
- npm
- Git
- MetaMask

Create a dev wallet (same wallet can be deployer + oracle + MM bot for MVP):
- Fund it with **Amoy POL/MATIC** from a faucet
- Get **test USDC** from Circle faucet

## Faucets
- Polygon Amoy test token faucets: use Polygon docs / community faucets (search “Amoy faucet”)
- Circle USDC faucet: https://faucet.circle.com  (select **Polygon PoS Amoy**)

---

# 2) Configure environment
There are two `.env` files:

### `contracts/.env`
Copy `contracts/.env.example` → `contracts/.env`

### `backend/.env`
Copy `backend/.env.example` → `backend/.env`

Fill these values (defaults are already set for Amoy):
- `RPC_URL` = https://rpc-amoy.polygon.technology
- `CHAIN_ID` = 80002
- `USDC_ADDRESS` = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
- `PRIVATE_KEY` = your deployer/oracle/MM wallet private key
- `ORACLE_ADDRESS` = the address allowed to resolve (use deployer wallet for MVP)

---

# 3) Deploy the 7 markets (contracts)
```bash
cd contracts
npm install
npx hardhat compile
# IMPORTANT: confirm `EXPIRY_BY_ID` values in scripts/deploy-markets.js are in the FUTURE.
# Defaults are set to 2026-12-31 UTC for safety; update to the real event end times when known.
npx hardhat run scripts/deploy-markets.js --network amoy
```

After deploy it writes:
- `shared/deployed.json` (addresses + expiry + market metadata)

---

# 4) Approve USDC for the MM bot wallet (required)
The contract uses ERC20 `transferFrom`, so each market contract needs allowance.

```bash
cd backend
npm install
cp .env.example .env
node scripts/approve-all.js
```

---

# 5) Run backend + MM bots
```bash
cd backend
npm start
```

Backend:
- `GET /health`
- `GET /markets` (frontend uses this)
- `POST /resolve` (optional API resolve endpoint)

MM bot:
- Starts automatically (one bot loop per market)
- Buys YES or NO periodically using the config (initial probs + min/max sizes)

---

# 6) Run frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

---

# 7) MetaMask network settings (if needed)
- Network Name: Polygon Amoy Testnet
- RPC URL: https://rpc-amoy.polygon.technology
- Chain ID: 80002
- Currency Symbol: POL (or MATIC depending on wallet)
- Block Explorer: https://amoy.polygonscan.com

---

# Important notes / known simplifications (MVP)
1. This is **pool-based** (not an orderbook). “Price” is implied by pool ratio.
2. Resolution is **oracle/manual** for MVP (same wallet is fine). Automate later.
3. **Expiry timestamps** in `deploy-markets.js` MUST be updated before deployment.
4. “Atomic Heart 1M active players” needs an agreed oracle definition; keep it simple for MVP.

---

# Mainnet migration later
After you’re happy on Amoy:
- redeploy the same contracts to Polygon mainnet
- swap `RPC_URL`, `CHAIN_ID=137`, and `USDC_ADDRESS` (Circle mainnet USDC for Polygon PoS)
- rebuild frontend + restart backend bots

License: MIT

---

# Freelancer “Run These Commands” Checklist (copy/paste)

## A) Setup (once)
1) Install deps:
```
### Frontend env required for Approve button
The market page includes an **Approve USDC** button. It needs the USDC token address in:
- `frontend/.env.local` → `NEXT_PUBLIC_USDC_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`

(You can just copy it from `frontend/.env.example`.)
bash
node -v   # should be 18+
npm -v
```

2) Create env files:
```bash
# contracts env
cp contracts/.env.example contracts/.env

# backend env
cp backend/.env.example backend/.env

# frontend env
cp frontend/.env.example frontend/.env.local
```

3) Edit BOTH `contracts/.env` and `backend/.env`:
- Set `PRIVATE_KEY=...`  (deployer/oracle/MM wallet for MVP)
- Set `ORACLE_ADDRESS=...` (same wallet address is fine for MVP)

> Leave RPC/chainId/USDC defaults as-is for Polygon Amoy unless you know what you’re doing.

---

## B) Deploy contracts (writes shared/deployed.json)
```bash
cd contracts
npm install
npx hardhat compile

# IMPORTANT: confirm EXPIRY timestamps in scripts/deploy-markets.js are in the FUTURE
npx hardhat run scripts/deploy-markets.js --network amoy
```

✅ Expected output:
- 7 deployed addresses printed
- `shared/deployed.json` populated

---

## C) Backend + approvals + bot
```bash
cd ../backend
npm install

# approve USDC spend for each market contract
node scripts/approve-all.js

# start backend (also starts MM bot)
npm start
```

✅ Expected output:
- “Backend listening…”
- bot logs like `[bot] market 1 YES 5 USDC tx=...`

---

## D) Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open: http://localhost:3000

---

# Troubleshooting (common cheap-freelancer errors)

## 1) “MetaMask not found”
- Install MetaMask extension
- Ensure you’re opening the site in a browser with MetaMask enabled

## 2) Trades revert / “transferFrom failed” / “insufficient allowance”
Cause: user or bot did not approve USDC for the market contract.
Fix:
- For bot wallet: run `backend/scripts/approve-all.js`
- For user wallet: in the UI, first call `USDC.approve(marketAddress, amount)` (MetaMask will prompt)
  - Easiest: use a block explorer “Write Contract” or add a simple approve button later

## 3) “insufficient funds for gas”
Cause: wallet has no Amoy POL/MATIC for gas
Fix:
- Get faucet funds on Polygon Amoy and retry

## 4) Backend says: “No deployed.json found”
Cause: contracts not deployed or deploy script didn’t write file
Fix:
- Run deploy step again: `contracts/scripts/deploy-markets.js`
- Confirm `shared/deployed.json` exists and is not `{}`

## 5) Wrong network in MetaMask
Fix:
- Switch to Polygon Amoy (chainId 80002)
- RPC: https://rpc-amoy.polygon.technology
- Explorer: https://amoy.polygonscan.com

---

# Approve USDC button (already included)
✅ The UI now includes an **Approve USDC** button on each market page. It calls:
- `USDC.approve(marketContractAddress, amount)`
This is a ~10-minute change for a dev.



---

# OWNER / NON-TECHNICAL VERIFICATION CHECKLIST
(Use this to accept or reject freelancer work)

This section is written for **non-technical founders**.  
Require screenshots, Polygonscan links, and transaction hashes for **every item** below.

---

## Milestone 1 — Contracts Deployed & Verified
Freelancer must provide:
1. Polygonscan (Amoy) links for **all 7 market contracts**
2. Each page must show **“Contract Source Code Verified”**
3. Screenshot of deploy script output showing all addresses
4. Screenshot or snippet of `shared/deployed.json`

You verify:
- All links open
- Code is verified (not “unverified”)
- Addresses match deploy output

---

## Milestone 2 — Trading Works (Approve → Buy YES/NO)
Freelancer must provide:
1. Screen recording or screenshots showing:
   - Wallet connected
   - Market page opened
   - **Approve USDC** clicked and confirmed in MetaMask
   - Buy YES and Buy NO executed
2. At least **2 transaction hashes** (approve + buy)

You verify:
- Tx hashes open on Polygonscan
- Pool totals change after trades

---

## Milestone 3 — Backend & API Running
Freelancer must provide:
1. Screenshot of backend terminal:
   - `Backend listening on http://localhost:3001`
2. Browser screenshots:
   - `http://localhost:3001/health`
   - `http://localhost:3001/markets` (must return 7 markets)

You verify:
- `/markets` returns non-empty JSON with contract addresses

---

## Milestone 4 — Market Resolution & Withdrawals
Freelancer must provide:
1. Tx hash for resolving a market
2. Tx hash for withdrawing winnings
3. Screenshot of MetaMask confirmations

You verify:
- Resolve tx succeeded
- Withdraw tx succeeded
- Wallet balance updates

---

## Milestone 5 — Market Maker Bot Running
Freelancer must provide:
1. Screenshot of bot logs showing repeated trades
2. At least **2 bot transaction hashes**
3. Bot wallet public address (NO private keys)

You verify:
- Bot tx hashes exist and succeed
- Logs show continuous activity

---

## FINAL HANDOFF REQUIREMENTS (MANDATORY)
Before final payment, require:

1. Final project folder (or zip) with:
   - Same structure as this repo
   - **NO private keys**
   - `.env` files removed or blank
2. `DEPLOYMENT_NOTES.md` containing:
   - Network (Polygon Amoy)
   - RPC used
   - Contract addresses
   - Bot wallet public address
   - Exact commands run
3. Short (2–5 min) walkthrough video
4. Written confirmation:
   - No upgradeable proxies
   - No admin withdraw functions
   - Contracts verified on Polygonscan

---

## IMMEDIATE RED FLAGS (STOP WORK)
- Requests for private keys
- Unverified contracts
- “Emergency withdraw” functions
- Proxy / upgradeable contracts
- No tx hashes or explorer links

If any red flag appears: **STOP AND DO NOT PAY.**

---
