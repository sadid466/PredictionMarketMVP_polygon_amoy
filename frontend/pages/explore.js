import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMarkets } from "../utils/api";

export default function ExploreMarkets() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchMarkets()
      .then(setMarkets)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-8 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute -right-28 top-0 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/20" />
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-700/85 dark:text-cyan-300/80">Market Intelligence</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white [text-shadow:none]">Explore Markets</h1>
        <p className="mt-4 text-slate-500 dark:text-slate-300">Browse all markets, compare pool depth, and jump directly into trading.</p>
      </section>

      {err && (
        <div className="mt-5 rounded-xl border border-violet-300/50 bg-violet-100/70 px-4 py-3 text-sm text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-200">
          {err}
        </div>
      )}

      {loading ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-10 text-center text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Loading markets...
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100/70 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left">Market</th>
                  <th className="px-4 py-3 text-left">Expiry</th>
                  <th className="px-4 py-3 text-left">YES Pool</th>
                  <th className="px-4 py-3 text-left">NO Pool</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-200">
                {markets.map((m) => {
                  const expiry = new Date(Number(m.expiry) * 1000);
                  const hasExpired = new Date() > expiry;
                  const isResolved = m.resolved;
                  const statusLabel = isResolved ? "Resolved" : hasExpired ? "Expired" : "Active";
                  return (
                    <tr key={m.id} className="border-t border-slate-200 transition-colors hover:bg-slate-100/60 dark:border-white/10 dark:hover:bg-white/5">
                      <td className="min-w-[300px] px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{m.question}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                        {expiry.toLocaleDateString()} {expiry.toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-violet-600 dark:text-violet-300">${Number(m.yesTotal).toFixed(2)}</td>
                      <td className="px-4 py-3 text-cyan-600 dark:text-cyan-300">${Number(m.noTotal).toFixed(2)}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="rounded-md border border-slate-200 bg-white/80 px-2 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-slate-200">{statusLabel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/market/${m.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:from-violet-500 hover:to-indigo-500 dark:shadow-violet-500/20"
                        >
                          Open Market
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
