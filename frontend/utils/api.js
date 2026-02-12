function getBackendBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;

  if (process.env.NODE_ENV !== "production") return "http://localhost:3001";
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured.");
}

export async function fetchMarkets() {
  const base = getBackendBaseUrl();
  const r = await fetch(`${base}/markets`);
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function fetchMarketHistory(id) {
  const base = getBackendBaseUrl();
  const r = await fetch(`${base}/markets/${id}/history`);
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}
