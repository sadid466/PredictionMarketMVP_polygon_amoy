import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchMarkets } from "../../utils/api";

const glassCard =
  "rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-violet-500/50";
const primaryButton =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60";
const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-violet-500";

export default function AdminPanel() {
  const router = useRouter();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [resolving, setResolving] = useState(null);
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newExpiry, setNewExpiry] = useState("");

  const handleAuth = () => {
    const expectedKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
    if (!expectedKey) {
      setErr("Admin key not configured. Set NEXT_PUBLIC_ADMIN_KEY in .env.local");
      return;
    }
    if (adminKey === expectedKey) {
      setErr("");
      setAuthenticated(true);
      localStorage.setItem("is_admin", "true");
      window.dispatchEvent(new Event("admin-auth"));
    } else {
      setErr("Invalid admin key");
    }
  };

  useEffect(() => {
    const syncAdmin = () => {
      const allowed = localStorage.getItem("is_admin") === "true";
      setAuthenticated(allowed);
      if (!allowed) {
        setLoading(false);
      }
    };
    syncAdmin();
    window.addEventListener("storage", syncAdmin);
    window.addEventListener("admin-auth", syncAdmin);
    window.addEventListener("focus", syncAdmin);
    return () => {
      window.removeEventListener("storage", syncAdmin);
      window.removeEventListener("admin-auth", syncAdmin);
      window.removeEventListener("focus", syncAdmin);
    };
  }, []);

  useEffect(() => {
    if (!authenticated) {
      router.replace('/');
    }
  }, [authenticated, router]);

  useEffect(() => {
    if (!authenticated) return;
    fetchMarkets()
      .then(setMarkets)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [authenticated]);

  async function resolveMarket(marketId, outcome) {
    try {
      setResolving(marketId);
      setErr("");
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${backendUrl}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketId, outcomeYes: outcome === "YES" })
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await fetchMarkets();
      setMarkets(updated);
    } catch (e) {
      setErr(`Resolution failed: ${e.message}`);
    } finally {
      setResolving(null);
    }
  }

  async function createMarket(e) {
    e.preventDefault();
    try {
      setCreating(true);
      setErr("");
      if (!newName.trim() || !newQuestion.trim() || !newExpiry) {
        setErr("Please fill in name, question, and expiry.");
        return;
      }
      const expiryTs = Math.floor(new Date(newExpiry).getTime() / 1000);
      if (!expiryTs || Number.isNaN(expiryTs)) {
        setErr("Invalid expiry date/time.");
        return;
      }
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${backendUrl}/create-market`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          question: newQuestion.trim(),
          expiry: expiryTs
        })
      });
      if (!res.ok) throw new Error(await res.text());
      setNewName("");
      setNewQuestion("");
      setNewExpiry("");
      const updated = await fetchMarkets();
      setMarkets(updated);
    } catch (e) {
      setErr(`Create failed: ${e.message}`);
    } finally {
      setCreating(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-md transition-all duration-300 hover:border-violet-500/50 hover:bg-white/10"
        >
          Back to Markets
        </Link>

        <section className={glassCard}>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Admin Gateway</p>
          <h1 className="mt-3 text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 [text-shadow:none]">
            Admin Panel
          </h1>
          <p className="mt-3 text-slate-300">Enter the admin key to access market operations.</p>

          {err && <div className="mt-4 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">{err}</div>}

          <input
            className={`${inputClass} mt-4`}
            type="password"
            placeholder="Admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />

          <button className={`${primaryButton} mt-4 w-full`} onClick={handleAuth}>
            Authenticate
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-md transition-all duration-300 hover:border-violet-500/50 hover:bg-white/10"
      >
        Back to Markets
      </Link>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="pointer-events-none absolute -right-28 top-0 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Control Plane</p>
        <h1 className="mt-3 text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 [text-shadow:none]">
          Admin Panel
        </h1>
        <p className="mt-4 text-slate-300">Create markets and resolve outcomes after expiry.</p>
      </section>

      <section className={`${glassCard} mt-6`}>
        <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Create Market</h3>
        <form onSubmit={createMarket} className="mt-4 space-y-3">
          <input className={inputClass} type="text" placeholder="Market Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <textarea
            className={inputClass}
            placeholder="Market Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={3}
          />
          <input className={inputClass} type="datetime-local" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} />
          <button className={primaryButton} type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Market"}
          </button>
        </form>
      </section>

      {err && <div className="mt-5 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">{err}</div>}

      {loading ? (
        <div className={`${glassCard} mt-6 text-slate-300`}>Loading markets...</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Market</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Expiry</th>
                  <th className="px-4 py-3 text-left">YES Pool</th>
                  <th className="px-4 py-3 text-left">NO Pool</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {markets.map((m) => {
                  const expiry = new Date(Number(m.expiry) * 1000);
                  const hasExpired = new Date() > expiry;
                  const isResolved = m.resolved;
                  return (
                    <tr key={m.id} className="border-t border-white/10 transition-colors hover:bg-white/5">
                      <td className="px-4 py-3">#{m.id}</td>
                      <td className="min-w-[300px] px-4 py-3">
                        <div className="font-semibold text-white">{m.name}</div>
                        <div className="mt-1 text-xs text-slate-400">{m.question}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-slate-200">
                          {isResolved ? "Resolved" : hasExpired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                        {expiry.toLocaleDateString()} {expiry.toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-violet-300">${Number(m.yesTotal).toFixed(2)}</td>
                      <td className="px-4 py-3 text-cyan-300">${Number(m.noTotal).toFixed(2)}</td>
                      <td className="min-w-[220px] px-4 py-3">
                        {isResolved ? (
                          <span className={`font-medium ${m.outcomeYes ? "text-violet-300" : "text-cyan-300"}`}>
                            {m.outcomeYes ? "YES Wins" : "NO Wins"}
                          </span>
                        ) : hasExpired ? (
                          <div className="flex gap-2">
                            <button
                              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60"
                              disabled={resolving === m.id}
                              onClick={() => resolveMarket(m.id, "YES")}
                            >
                              {resolving === m.id ? "Resolving..." : "Resolve YES"}
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-xs font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-60"
                              disabled={resolving === m.id}
                              onClick={() => resolveMarket(m.id, "NO")}
                            >
                              {resolving === m.id ? "Resolving..." : "Resolve NO"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Market still active.</span>
                        )}
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
