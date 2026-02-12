import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function PoolChart({ yesTotal, noTotal, height = 400, showDetails = false }) {
  const yes = Number(yesTotal || 0);
  const no = Number(noTotal || 0);
  const total = yes + no;

  const yesPct = total > 0 ? ((yes / total) * 100).toFixed(1) : "50.0";
  const noPct = total > 0 ? ((no / total) * 100).toFixed(1) : "50.0";

  const data = [
    { name: "YES", value: total > 0 ? yes : 50 },
    { name: "NO", value: total > 0 ? no : 50 }
  ];

  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 16,
        padding: 18,
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 70% 15%, var(--glass-overlay-violet), transparent 45%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 10
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.05rem",
              letterSpacing: "0.3px",
              color: "var(--chart-title)"
            }}
          >
            Pool Distribution
          </h3>
          <span style={{ fontSize: "0.8rem", color: "var(--chart-muted)" }}>
            YES {yesPct}% | NO {noPct}%
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient id="poolYesGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="70%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
                <linearGradient id="poolNoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a5f3fc" />
                  <stop offset="70%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>

              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={74}
                outerRadius={112}
                paddingAngle={4}
                isAnimationActive={false}
              >
                <Cell fill="url(#poolYesGrad)" />
                <Cell fill="url(#poolNoGrad)" />
              </Pie>

              <Tooltip
                formatter={(value) => `${Number(value).toLocaleString()} USDC`}
                contentStyle={{
                  background: "var(--chart-tooltip-bg)",
                  border: "1px solid var(--chart-tooltip-border)",
                  borderRadius: 10,
                  color: "var(--chart-tooltip-text)"
                }}
                labelStyle={{ color: "var(--chart-tooltip-text)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: "0.8rem", color: "#7c3aed" }}>YES {yesPct}%</span>
          <span style={{ fontSize: "0.8rem", color: "#06b6d4" }}>NO {noPct}%</span>
        </div>

        {showDetails && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--stat-bg)", border: "1px solid var(--stat-border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--stat-title)" }}>Total Pool</div>
              <div style={{ fontWeight: 700, color: "var(--stat-value)" }}>${total.toLocaleString()}</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--stat-bg)", border: "1px solid var(--stat-border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--stat-title)" }}>YES Share</div>
              <div style={{ fontWeight: 700, color: "var(--stat-value)" }}>{yesPct}%</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--stat-bg)", border: "1px solid var(--stat-border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--stat-title)" }}>NO Share</div>
              <div style={{ fontWeight: 700, color: "var(--stat-value)" }}>{noPct}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
