import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PredictionHistoryProps {
  history: number[]; // Array of probabilities (0-1)
}

export const PredictionHistory: React.FC<PredictionHistoryProps> = ({ history }) => {
  const data = history.map((val, idx) => ({
    id: idx + 1,
    probability: Math.round(val * 100),
  }));

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Session Risk History</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="id" tick={{ fontSize: 12 }} label={{ value: "Submission #", position: "insideBottom", offset: -8 }} />
          <YAxis domain={[0, 100]} label={{ value: "Risk (%)", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Line type="monotone" dataKey="probability" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
