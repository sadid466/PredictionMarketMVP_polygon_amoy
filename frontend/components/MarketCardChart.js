import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";

function buildSeries(yesPct, points = 36) {
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const wave = Math.sin(t * Math.PI * 1.2) * 0.95;
    const val = yesPct * 0.42 + yesPct * 0.58 * wave;
    return {
      x: Math.round(t * 100),
      value: Number(Math.max(1, val).toFixed(2))
    };
  });
}

export default function MarketCardChart({ yesTotal, noTotal }) {
  const yes = Number(yesTotal || 0);
  const no = Number(noTotal || 0);
  const total = yes + no;
  const yesPct = total > 0 ? (yes / total) * 100 : 50;
  const noPct = 100 - yesPct;
  const data = buildSeries(yesPct);

  return (
    <div
      style={{
        width: "100%",
        height: 194,
        borderRadius: 14,
        padding: "10px 12px",
        background:
          "radial-gradient(circle at 72% 14%, rgba(139,92,246,0.18), transparent 44%), linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(2,6,23,0.96) 100%)",
        border: "1px solid rgba(148,163,184,0.2)",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
          fontSize: "0.78rem",
          color: "#94a3b8"
        }}
      >
        <span>Implied YES probability</span>
        <span>
          <span style={{ color: "#22d3ee", fontWeight: 600 }}>YES {yesPct.toFixed(1)}%</span>
          <span style={{ color: "#64748b" }}> | </span>
          <span style={{ color: "#a855f7", fontWeight: 600 }}>NO {noPct.toFixed(1)}%</span>
        </span>
      </div>

      <div style={{ height: 124 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="cardYesAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.62} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="3 4" horizontal vertical={false} />
            <XAxis dataKey="x" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
            />
            <ReferenceLine y={yesPct} stroke="#22d3ee" strokeDasharray="4 4" strokeOpacity={0.72} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#cardYesAreaFill)"
              dot={false}
              activeDot={{ r: 4, fill: "#22d3ee", stroke: "#0f172a", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "YES probability"]}
              contentStyle={{
                background: "rgba(2,6,23,0.96)",
                border: "1px solid rgba(148,163,184,0.46)",
                borderRadius: 10,
                color: "#e2e8f0"
              }}
              labelStyle={{ color: "#e2e8f0" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}