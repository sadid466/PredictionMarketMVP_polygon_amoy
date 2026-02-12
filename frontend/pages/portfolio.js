import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "../utils/wallet";

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "-";
  }
}

function truncateHash(hash) {
  if (!hash) return "-";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export default function Portfolio() {
  const { address } = useWallet();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setBets([]);
      setLoading(false);
      return;
    }
    const key = `bets_${address.toLowerCase()}`;
    try {
      const raw = localStorage.getItem(key);
      setBets(raw ? JSON.parse(raw) : []);
    } catch {
      setBets([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    const handleStorage = () => {
      if (!address) return;
      const key = `bets_${address.toLowerCase()}`;
      try {
        const raw = localStorage.getItem(key);
        setBets(raw ? JSON.parse(raw) : []);
      } catch {
        // no-op
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
    };
  }, [address]);

  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-8 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute -right-28 top-0 h-56 w-56 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-500/20" />
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-700/85 dark:text-cyan-300/80">Portfolio Engine</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white [text-shadow:none]">My Bets</h1>
        <p className="mt-4 text-slate-500 dark:text-slate-300">Track fills, revisit active markets, and execute follow-up trades.</p>
      </section>

      {!address && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-6 text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Connect your wallet to see your bet history.
        </div>
      )}

      {address && loading && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-6 text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Loading bets...
        </div>
      )}

      {address && !loading && bets.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-6 text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          No bets yet. Place a trade to populate this table.
        </div>
      )}

      {address && bets.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100/70 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left">Market</th>
                  <th className="px-4 py-3 text-left">Side</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Placed</th>
                  <th className="px-4 py-3 text-left">Tx</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-200">
                {bets.map((b, idx) => (
                  <tr key={`${b.txHash || "bet"}-${idx}`} className="border-t border-slate-200 transition-colors hover:bg-slate-100/60 dark:border-white/10 dark:hover:bg-white/5">
                    <td className="min-w-[260px] px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{b.marketName || `Market ${b.marketId}`}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">ID #{b.marketId}</div>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${b.side === "YES" ? "text-violet-600 dark:text-violet-300" : "text-cyan-600 dark:text-cyan-300"}`}>{b.side}</td>
                    <td className="px-4 py-3">${Number(b.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">${Number(b.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{truncateHash(b.txHash)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/market/${b.marketId}`}
                        className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:from-violet-500 hover:to-indigo-500 dark:shadow-violet-500/20"
                      >
                        Open Market
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
