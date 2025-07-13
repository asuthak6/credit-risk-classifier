import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface InputImpactBarProps {
  inputs: { [key: string]: number };
  means?: { [key: string]: number }; // Optional comparison to mean
}

export const InputImpactBar: React.FC<InputImpactBarProps> = ({ inputs, means }) => {
  // Convert to array for chart
  const data = Object.keys(inputs).map((key) => ({
    name: key,
    Applicant: inputs[key],
    Mean: means ? means[key] : undefined,
  }));

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Applicant Inputs</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 24 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Applicant" fill="#3b82f6" />
          {means && <Bar dataKey="Mean" fill="#a3a3a3" />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
