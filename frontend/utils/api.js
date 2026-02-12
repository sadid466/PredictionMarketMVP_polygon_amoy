export async function fetchMarkets() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const r = await fetch(`${base}/markets`);
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function fetchMarketHistory(id) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const r = await fetch(`${base}/markets/${id}/history`);
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}
