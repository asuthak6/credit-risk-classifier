import React, { useState } from "react";
import { RiskGauge } from "../components/RiskGauge";
import { InputImpactBar } from "../components/InputImpactBar";
import { PredictionHistory } from "../components/PredictionHistory";

const DEFAULT_MEANS = {
  int_rate: 11,
  term: 36,
  dti: 19,
  fico_range_high: 700,
  acc_open_past_24mths: 5,
  mo_sin_old_rev_tl_op: 40,
  bc_open_to_buy: 3000,
  mort_acc: 2,
  total_bc_limit: 9000,
  avg_cur_bal: 7000,
  open_rv_24m: 1,
};

const FIELD_META = [
  { name: "int_rate", label: "Interest Rate (%)", min: 0, max: 40, step: 0.01, placeholder: "e.g., 13.99" },
  { name: "term", label: "Loan Term (months)", min: 12, max: 60, step: 12, placeholder: "e.g., 36" },
  { name: "dti", label: "Debt-to-Income Ratio", min: 0, max: 50, step: 0.01, placeholder: "e.g., 18.5" },
  { name: "fico_range_high", label: "FICO Score (High)", min: 300, max: 850, step: 1, placeholder: "e.g., 720" },
  { name: "acc_open_past_24mths", label: "Accounts Open Past 24 Months", min: 0, max: 20, step: 1, placeholder: "e.g., 2" },
  { name: "mo_sin_old_rev_tl_op", label: "Months Since Oldest Revolving TL", min: 0, max: 240, step: 1, placeholder: "e.g., 60" },
  { name: "bc_open_to_buy", label: "Bankcard Open to Buy ($)", min: 0, max: 100000, step: 1, placeholder: "e.g., 4000" },
  { name: "mort_acc", label: "Mortgage Accounts", min: 0, max: 20, step: 1, placeholder: "e.g., 1" },
  { name: "total_bc_limit", label: "Total Bankcard Limit ($)", min: 0, max: 100000, step: 1, placeholder: "e.g., 12000" },
  { name: "avg_cur_bal", label: "Average Current Balance ($)", min: 0, max: 200000, step: 1, placeholder: "e.g., 8500" },
  { name: "open_rv_24m", label: "Open Revolving Accounts (24M)", min: 0, max: 20, step: 1, placeholder: "e.g., 1" },
];

export default function Dashboard() {
  const [inputs, setInputs] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [prediction, setPrediction] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const validate = () => {
    const errs: any = {};
    FIELD_META.forEach(({ name, min, max }) => {
      const val = parseFloat(inputs[name]);
      if (isNaN(val)) errs[name] = "Required";
      else if (val < min || val > max) errs[name] = `Must be ${min}–${max}`;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data: any = {};
    FIELD_META.forEach(({ name }) => data[name] = parseFloat(inputs[name]));
    try {
      const resp = await fetch("http://localhost:8000/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await resp.json();
      setPrediction(json.default_probability);
      setHistory((prev) => [...prev, json.default_probability]);
    } catch (err) {
      alert("API error: " + err);
    }
  };

  const exportCSV = () => {
    const rows = [["Prediction History"], ...history.map((v, i) => [i + 1, v])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prediction_history.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-4 py-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Credit Risk Dashboard</h1>
          <div className="h-0.5 bg-gray-700 mt-4 mb-2 rounded" />
          <p className="text-gray-400">Score applicants and visualize their default risk.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col justify-between"
            autoComplete="off"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-100">Applicant Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {FIELD_META.map(({ name, label, min, max, step, placeholder }) => (
                <div key={name} className="flex flex-col mb-2">
                  <label className="mb-1 text-gray-200 font-medium" htmlFor={name}>{label}</label>
                  <input
                    name={name}
                    id={name}
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    placeholder={placeholder}
                    value={inputs[name] || ""}
                    onChange={handleChange}
                    className={`bg-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors[name] ? "border border-red-500" : "border border-gray-700"}`}
                    required
                  />
                  {errors[name] && <span className="text-red-400 text-xs">{errors[name]}</span>}
                </div>
              ))}
            </div>
            <button type="submit" className="mt-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white transition">
              Predict Credit Risk
            </button>
          </form>

          {/* Output & Chart */}
          <section className="flex flex-col gap-6">
            <div className="bg-gray-800 rounded-2xl p-8 shadow-lg flex-1 flex flex-col justify-between mb-2">
              <h2 className="text-xl font-semibold mb-2">Risk Prediction</h2>
              <div className="text-4xl font-bold text-blue-400 my-3 min-h-[3.5rem]">
                {prediction !== null ? (prediction * 100).toFixed(2) + "%" : <span className="text-gray-500 text-xl">Enter data to see prediction</span>}
              </div>
              <div className="text-sm text-gray-400 mb-2">Probability of Default</div>
              <button onClick={exportCSV} disabled={history.length === 0} className="mt-2 py-1 px-4 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-60 w-fit self-end">
                Export Predictions CSV
              </button>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex-1">
              {/* Insert your chart here, e.g. <RiskChart data={history} /> */}
              <RiskGauge probability={prediction ?? 0} />
              <InputImpactBar inputs={inputs} means={DEFAULT_MEANS} />
            </div>
          </section>
        </div>

        <div className="mt-10">
          <PredictionHistory history={history} />
        </div>
      </div>
    </div>
  );
}
