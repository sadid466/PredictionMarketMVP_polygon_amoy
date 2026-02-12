import { useEffect, useState } from "react";
import { fetchMarkets } from "../utils/api";
import MarketCard from "../components/MarketCard";

export default function Home() {
  const [markets, setMarkets] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkets()
      .then(setMarkets)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-8 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute -right-28 top-0 h-56 w-56 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-500/20" />
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-700/90 dark:text-cyan-300/90">Deep Tech Prediction Layer</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-violet-700 to-cyan-700 dark:from-white dark:via-violet-200 dark:to-cyan-300 sm:text-5xl [text-shadow:none]">
          Gaming Prediction Markets
        </h1>
        <p className="mt-4 max-w-3xl text-slate-500 dark:text-slate-300">
          Predict outcomes, execute trades, and monitor live pool probability across real-time YES/NO gaming markets.
        </p>
      </section>

      {err && (
        <div className="mt-6 rounded-xl border border-violet-300/60 bg-violet-100/70 px-4 py-3 text-sm text-violet-700 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-violet-200">
          {err}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-[480px] animate-pulse rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/5" />
          ))}
        </div>
      ) : markets.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-10 text-center text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          No markets available yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {markets.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      )}
    </div>
  );
}
