import Link from "next/link";
import MarketCardChart from "./MarketCardChart";

function formatDate(ts) {
  return new Date(Number(ts) * 1000).toLocaleDateString();
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default function MarketCard({ market }) {
  const yes = Number(market.yesTotal || 0);
  const no = Number(market.noTotal || 0);
  const total = yes + no;
  const yesPct = total > 0 ? Math.round((yes / total) * 100) : 50;
  const noPct = 100 - yesPct;
  const expiry = new Date(Number(market.expiry) * 1000);
  const status = market.resolved ? "Resolved" : new Date() > expiry ? "Expired" : "Active";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:shadow-violet-500/20 dark:hover:border-violet-500/50 dark:hover:bg-white/10">
      <div className="pointer-events-none absolute -right-16 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-violet-300/25 via-indigo-300/15 to-cyan-300/0 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100 dark:from-violet-500/20 dark:via-indigo-500/10 dark:to-cyan-500/0" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold leading-tight text-slate-900 dark:text-white">
            {market.name}
          </h3>
          <span className="rounded-full border border-violet-300/70 bg-violet-100/70 px-3 py-1 text-xs font-medium text-violet-600 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-violet-400">
            #{market.id}
          </span>
        </div>

        <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-slate-500 dark:text-gray-400">{market.question}</p>

        <div className="mt-2">
          <MarketCardChart yesTotal={market.yesTotal} noTotal={market.noTotal} />
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500/90 dark:text-slate-300/90">
              <span>YES {yesPct}%</span>
              <span>${formatAmount(yes)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600" style={{ width: `${yesPct}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500/90 dark:text-slate-300/90">
              <span>NO {noPct}%</span>
              <span>${formatAmount(no)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${noPct}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
          <span>Expires: {formatDate(market.expiry)}</span>
          <span
            className={
              "rounded-md px-2 py-1 font-medium " +
              (status === "Resolved"
                ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300"
                : status === "Expired"
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                  : "bg-slate-200/80 text-slate-700 dark:bg-white/10 dark:text-slate-200")
            }
          >
            {status}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="flex-1" />
          <Link
            href={`/market/${market.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:from-violet-500 hover:to-indigo-500 dark:shadow-violet-500/20"
          >
            Open Market
          </Link>
        </div>
      </div>
    </article>
  );
}