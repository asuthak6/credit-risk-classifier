import React from "react";
import { PieChart, Pie, Cell } from "recharts";

interface RiskGaugeProps {
  probability: number; // 0 to 1
}

const COLORS = ["#22c55e", "#facc15", "#f97316", "#ef4444"]; // green, yellow, orange, red

const getColor = (prob: number) => {
  if (prob < 0.2) return COLORS[0];
  if (prob < 0.5) return COLORS[1];
  if (prob < 0.7) return COLORS[2];
  return COLORS[3];
};

export const RiskGauge: React.FC<RiskGaugeProps> = ({ probability }) => {
  const percent = Math.round(probability * 100);
  const data = [
    { name: "Risk", value: percent },
    { name: "Rest", value: 100 - percent },
  ];

  return (
    <div className="flex flex-col items-center">
      <PieChart width={200} height={200}>
        <Pie
          data={data}
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
        >
          <Cell key="risk" fill={getColor(probability)} />
          <Cell key="rest" fill="#e5e7eb" />
        </Pie>
      </PieChart>
      <span className="text-2xl font-semibold mt-[-90px]">
        {percent}%
      </span>
      <span className="text-lg text-gray-500">Default Risk</span>
    </div>
  );
};
