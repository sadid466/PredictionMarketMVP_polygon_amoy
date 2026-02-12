import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "YES", value: 50, color: "#8b5cf6" },
  { name: "NO", value: 50, color: "#22d3ee" }
];

export default function MarketChart({ yesPool, noPool }) {
  const chartData = (yesPool || noPool)
    ? [
        { name: "YES", value: Number(yesPool), color: "#8b5cf6" },
        { name: "NO", value: Number(noPool), color: "#22d3ee" }
      ]
    : data;

  return (
    <div style={{ width: "100%", height: 110, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="miniYesGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="70%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="miniNoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="70%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="miniGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <Pie data={chartData} innerRadius={34} outerRadius={48} paddingAngle={4} dataKey="value" isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "url(#miniYesGrad)" : "url(#miniNoGrad)"}
                filter="url(#miniGlow)"
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => `${Number(value).toLocaleString()} USDC`}
            contentStyle={{
              background: "rgba(10,10,12,0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#f5f5f5",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
            }}
            labelStyle={{ color: "#f5f5f5" }}
            itemStyle={{ color: "#f5f5f5" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}