import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ProbabilityChart({ yesProb, height = 340 }) {
  const yes = Number((yesProb * 100).toFixed(1));
  const no = Number((100 - yes).toFixed(1));

  const data = [
    { name: "YES", probability: yes, fill: "#8b5cf6" },
    { name: "NO", probability: no, fill: "#22d3ee" }
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
          background: "radial-gradient(circle at 80% 10%, var(--glass-overlay-cyan), transparent 45%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "1.1rem",
            letterSpacing: "0.3px",
            color: "var(--chart-title)"
          }}
        >
          Implied Probability
        </h3>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 24, left: 4, bottom: 20 }}>
            <defs>
              <linearGradient id="probYesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="probNoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="var(--chart-grid)" />
            <XAxis dataKey="name" stroke="var(--chart-axis)" tick={{ fill: "var(--chart-muted)" }} />
            <YAxis
              stroke="var(--chart-axis)"
              tick={{ fill: "var(--chart-muted)" }}
              label={{ value: "Probability (%)", angle: -90, position: "insideLeft", fill: "var(--chart-muted)" }}
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(1)}%`}
              contentStyle={{
                background: "var(--chart-tooltip-bg)",
                border: "1px solid var(--chart-tooltip-border)",
                borderRadius: 10,
                color: "var(--chart-tooltip-text)"
              }}
              labelStyle={{ color: "var(--chart-tooltip-text)" }}
              itemStyle={{ color: "var(--chart-tooltip-text)" }}
            />
            <Bar dataKey="probability" radius={[10, 10, 6, 6]} isAnimationActive={false}>
              <Cell fill="url(#probYesGrad)" />
              <Cell fill="url(#probNoGrad)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
