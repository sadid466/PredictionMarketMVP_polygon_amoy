import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../utils/wallet";
import { fetchMarkets } from "../../utils/api";
import { getSigner, getMarketContract, fmtUSDC, toUSDC } from "../../utils/web3";
import PoolChart from "../../components/PoolChart";
import ProbabilityChart from "../../components/ProbabilityChart";

function impliedYesProb(yesTotal, noTotal) {
  const y = Number(yesTotal || 0);
  const n = Number(noTotal || 0);
  const t = y + n;
  return t > 0 ? y / t : 0.5;
}

function getFriendlyError(e) {
  const code = e?.code;
  const message = (e?.message || "").toLowerCase();
  if (
    code === 4001 ||
    code === "ACTION_REJECTED" ||
    message.includes("user rejected") ||
    message.includes("user denied") ||
    message.includes("denied transaction signature") ||
    message.includes("rejected")
  ) {
    return "Transaction cancelled.";
  }
  if (message.includes("insufficient funds")) {
    return "Insufficient funds for this transaction.";
  }
  return e?.message || "Something went wrong. Please try again.";
}

const glassCard =
  "rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/80 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-violet-500/50";
const primaryButton =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:from-violet-500 hover:to-indigo-500 dark:shadow-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 focus:border-violet-500 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder-gray-500";

export default function MarketPage() {
  const router = useRouter();
  const { id } = router.query;
  const { address, connect: walletConnect } = useWallet();

  const [market, setMarket] = useState(null);
  const [err, setErr] = useState("");
  const [amount, setAmount] = useState("5");
  const [busy, setBusy] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [pressed, setPressed] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchMarkets()
      .then((ms) => setMarket(ms.find((x) => String(x.id) === String(id))))
      .catch((e) => setErr(getFriendlyError(e)));
  }, [id]);

  useEffect(() => {
    if (!err) return;
    const t = setTimeout(() => setErr(""), 4000);
    return () => clearTimeout(t);
  }, [err]);

  const yesProb = useMemo(() => impliedYesProb(market?.yesTotal, market?.noTotal), [market]);
  const yesPrice = useMemo(() => yesProb.toFixed(2), [yesProb]);
  const noPrice = useMemo(() => (1 - yesProb).toFixed(2), [yesProb]);

  useEffect(() => {
    let cancelled = false;
    async function loadBalance() {
      if (!address) {
        setUsdcBalance(null);
        return;
      }
      try {
        setBalanceLoading(true);
        const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
        if (!usdcAddress || !window.ethereum) {
          setUsdcBalance(null);
          return;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const erc20Abi = ["function balanceOf(address owner) view returns (uint256)"];
        const usdc = new ethers.Contract(usdcAddress, erc20Abi, provider);
        const bal = await usdc.balanceOf(address);
        if (!cancelled) setUsdcBalance(fmtUSDC(bal));
      } catch {
        if (!cancelled) setUsdcBalance(null);
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    }
    loadBalance();
    return () => {
      cancelled = true;
    };
  }, [address]);

  function saveBetRecord(side, txHash) {
    try {
      if (!address || !market) return;
      const key = `bets_${address.toLowerCase()}`;
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const price = side === "YES" ? yesPrice : noPrice;
      list.unshift({
        marketId: market.id,
        marketName: market.name,
        side,
        amount: String(amount || "0"),
        price,
        txHash,
        createdAt: Date.now()
      });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // no-op by design
    }
  }

  async function connect() {
    setPressed("connect");
    try {
      setStatus("Opening wallet...");
      await walletConnect();
    } catch (e) {
      setErr(getFriendlyError(e));
    } finally {
      setPressed(null);
      setStatus("");
    }
  }

  async function buy(side) {
    setPressed(side);
    if (!address) {
      setErr("Please connect your wallet first");
      setPressed(null);
      return;
    }

    try {
      setBusy(true);
      setStatus(`Confirming Buy ${side}...`);
      const signer = await getSigner();
      const c = getMarketContract(market.contract, signer);
      const tx = side === "YES" ? await c.buyYes(toUSDC(amount)) : await c.buyNo(toUSDC(amount));
      setStatus("Waiting for confirmation...");
      await tx.wait();
      setStatus("Success");
      saveBetRecord(side, tx.hash);
      const ms = await fetchMarkets();
      setMarket(ms.find((x) => String(x.id) === String(id)));
    } catch (e) {
      setErr(getFriendlyError(e));
    } finally {
      setBusy(false);
      setPressed(null);
      setTimeout(() => setStatus(""), 2000);
    }
  }

  async function approveUSDC() {
    setPressed("approve");
    try {
      setStatus("Checking allowance...");
      const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
      const signer = await getSigner();
      const erc20Abi = ["function approve(address spender, uint256 amount) external returns (bool)"];
      const usdc = new ethers.Contract(usdcAddress, erc20Abi, signer);
      const tx = await usdc.approve(market.contract, ethers.MaxUint256);
      setStatus("Approving...");
      await tx.wait();
      setStatus("USDC approved");
    } catch (e) {
      setErr(getFriendlyError(e));
    } finally {
      setPressed(null);
      setTimeout(() => setStatus(""), 2000);
    }
  }

  async function withdraw() {
    setPressed("withdraw");
    try {
      setStatus("Claiming winnings...");
      const signer = await getSigner();
      const c = getMarketContract(market.contract, signer);
      const tx = await c.withdraw();
      await tx.wait();
      setStatus("Winnings withdrawn");
    } catch (e) {
      setErr(getFriendlyError(e));
    } finally {
      setPressed(null);
      setTimeout(() => setStatus(""), 2000);
    }
  }

  if (!market) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-10 text-center text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Loading market details...
        </div>
      </div>
    );
  }

  const wallet = address;
  const isResolved = market.resolved;
  const expiry = new Date(Number(market.expiry) * 1000);
  const hasExpired = new Date() > expiry;
  const totalPool = Number(market.yesTotal || 0) + Number(market.noTotal || 0);
  const yesPct = (yesProb * 100).toFixed(1);
  const noPct = (100 - Number(yesPct)).toFixed(1);

  return (
    <div className="mx-auto max-w-7xl">
      <button
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-700 backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-violet-500/50 dark:hover:bg-white/10"
        onClick={() => router.push("/")}
      >
        Back to Markets
      </button>

      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-8 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute -right-24 -top-20 h-56 w-56 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-500/20" />
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-700/90 dark:text-cyan-300/80">Market Window</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl [text-shadow:none]">
          {market.name}
        </h1>
        <p className="mt-4 max-w-4xl text-slate-500 dark:text-slate-300">{market.question}</p>
      </section>

      {status && (
        <div className="mt-5 rounded-xl border border-cyan-300/40 bg-cyan-100/70 px-4 py-3 text-sm text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-200">
          {status}
        </div>
      )}
      {err && (
        <div className="mt-5 rounded-xl border border-violet-300/50 bg-violet-100/70 px-4 py-3 text-sm text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-200">
          {err}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className={glassCard}>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Pool Statistics</h3>

          <p className="mt-4 text-3xl font-bold text-violet-600 dark:text-violet-400">${totalPool.toLocaleString()}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">YES Pool</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{Number(market.yesTotal).toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">NO Pool</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{Number(market.noTotal).toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
              <span>YES {yesPct}%</span>
              <span>NO {noPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600" style={{ width: `${yesPct}%` }} />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${noPct}%` }} />
            </div>
          </div>

          {wallet && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {isResolved ? "Resolved" : hasExpired ? "Expired" : "Active"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Expiry</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{expiry.toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </section>

        <section className={glassCard}>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{isResolved ? "Resolved Market" : "Trade"}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Connect your wallet and trade YES/NO shares in real time.</p>

          <button
            onClick={connect}
            disabled={busy}
            className={`${primaryButton} mt-5 w-full ${pressed === "connect" ? "scale-[0.98]" : ""}`}
          >
            {wallet ? "Wallet Connected" : "Connect Wallet"}
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">YES Price</p>
              <p className="mt-1 text-lg font-semibold text-cyan-500 dark:text-cyan-400">${yesPrice}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">NO Price</p>
              <p className="mt-1 text-lg font-semibold text-violet-600 dark:text-violet-400">${noPrice}</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Wallet Balance (USDC)</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {wallet ? (balanceLoading ? "Loading..." : usdcBalance ?? "0.00") : "Connect to view"}
            </p>
          </div>

          {!isResolved && !hasExpired && wallet && (
            <>
              <input
                type="number"
                className={`${inputClass} mt-4`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
              />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => buy("YES")}
                  disabled={busy}
                  className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:from-violet-500 hover:to-indigo-500 dark:shadow-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                    pressed === "YES" ? "scale-[0.98]" : ""
                  }`}
                >
                  Buy YES
                </button>
                <button
                  onClick={() => buy("NO")}
                  disabled={busy}
                  className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:from-cyan-400 hover:to-blue-400 dark:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                    pressed === "NO" ? "scale-[0.98]" : ""
                  }`}
                >
                  Buy NO
                </button>
              </div>

              <button
                onClick={approveUSDC}
                disabled={busy}
                className={`mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-white/80 dark:border-white/15 dark:bg-black/20 dark:text-slate-100 dark:hover:border-violet-500/60 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                  pressed === "approve" ? "scale-[0.98]" : ""
                }`}
              >
                Approve USDC
              </button>
            </>
          )}

          {isResolved && (
            <button
              onClick={withdraw}
              disabled={busy}
              className={`mt-4 ${primaryButton} w-full ${pressed === "withdraw" ? "scale-[0.98]" : ""}`}
            >
              Withdraw Winnings
            </button>
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <PoolChart yesTotal={market.yesTotal} noTotal={market.noTotal} height={wallet ? 460 : 400} showDetails={!!wallet} />
        <ProbabilityChart yesProb={yesProb} height={wallet ? 460 : 400} />
      </div>
    </div>
  );
}
