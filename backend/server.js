import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { getProvider, getSigner, getMarketContract } from "./src/chain.js";
import { startBots } from "./src/mmBot.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
function normalizeOrigin(value) {
  return (value || "").trim().replace(/\/+$/, "");
}

const allowedOrigins = new Set(
  [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    ...(process.env.FRONTEND_URL || "").split(",")
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);

function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.has(normalized)) return true;
  // Allow Vercel preview/production subdomains without per-deploy env churn.
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser and same-origin requests (no Origin header).
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) return callback(null, true);
    // Block cross-origin without crashing request handling.
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());

const deployedPath = path.join(__dirname, "../shared/deployed.json");
const historyPath = path.join(__dirname, "../shared/history.json");

function loadHistory() {
  if (!fs.existsSync(historyPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(historyPath, "utf-8"));
  } catch {
    return {};
  }
}

function saveHistory(history) {
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf-8");
}

function loadDeployed() {
  if (!fs.existsSync(deployedPath)) return null;
  return JSON.parse(fs.readFileSync(deployedPath, "utf-8"));
}

// In-memory cache of time-series history, persisted to shared/history.json
let marketHistory = loadHistory();

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/markets", async (req, res) => {
  try {
    const deployed = loadDeployed();
    if (!deployed || Object.keys(deployed).length === 0) {
      return res.status(400).json({ error: "No deployed.json found. Deploy contracts first." });
    }

    const result = [];
    const now = Date.now();
    for (const [id, m] of Object.entries(deployed)) {
      try {
        const c = getMarketContract(m.contract);
        const yesTotal = await c.yesTotal();
        const noTotal = await c.noTotal();
        const resolved = await c.resolved();
        const outcomeYes = resolved ? await c.outcomeYes() : null;

        const yesStr = yesTotal.toString();
        const noStr = noTotal.toString();

        // Append to history for charts
        const key = String(id);
        if (!marketHistory[key]) marketHistory[key] = [];
        marketHistory[key].push({
          ts: now,
          yesTotal: yesStr,
          noTotal: noStr
        });
        // Limit stored points per market
        if (marketHistory[key].length > 500) {
          marketHistory[key] = marketHistory[key].slice(-500);
        }

        result.push({
          id: Number(id),
          slug: m.slug,
          name: m.name,
          question: m.question,
          contract: m.contract,
          expiry: m.expiry,
          yesTotal: yesStr,
          noTotal: noStr,
          resolved,
          outcomeYes
        });
      } catch (contractError) {
        // If contract call fails, return mock data for demo
        result.push({
          id: Number(id),
          slug: m.slug,
          name: m.name,
          question: m.question,
          contract: m.contract,
          expiry: m.expiry,
          yesTotal: "0",
          noTotal: "0",
          resolved: false,
          outcomeYes: null
        });
      }
    }

    // Persist history snapshot for charts
    saveHistory(marketHistory);

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Historical YES/NO time series for a single market
app.get("/markets/:id/history", (req, res) => {
  try {
    const id = String(req.params.id);
    const history = marketHistory[id] || [];
    const enriched = history.map((point) => {
      const yes = Number(point.yesTotal || 0);
      const no = Number(point.noTotal || 0);
      const total = yes + no;
      const yesPct = total > 0 ? (yes / total) * 100 : 50;
      const noPct = 100 - yesPct;
      return {
        ...point,
        yesPct,
        noPct
      };
    });
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/resolve", async (req, res) => {
  try {
    const { marketId, outcomeYes } = req.body;
    const deployed = loadDeployed();
    if (!deployed) return res.status(400).json({ error: "No deployed.json found." });
    const m = deployed[String(marketId)];
    if (!m) return res.status(404).json({ error: "Unknown marketId" });

    const signer = getSigner();
    const c = getMarketContract(m.contract, signer);
    const tx = await c.resolve(!!outcomeYes);
    await tx.wait();

    res.json({ ok: true, tx: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Start bots automatically if deployed.json exists
const deployed = loadDeployed();
if (deployed) {
  startBots(deployed).catch((e) => console.error("Bot start error:", e));
} else {
  console.log("No deployed.json yet. Bots will start after you deploy and restart backend.");
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
