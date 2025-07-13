import React, { useState } from "react";

type FormData = {
  int_rate: number | "";
  term: number | "";
  dti: number | "";
  fico_range_high: number | "";
  acc_open_past_24mths: number | "";
  mo_sin_old_rev_tl_op: number | "";
  bc_open_to_buy: number | "";
  mort_acc: number | "";
  total_bc_limit: number | "";
  avg_cur_bal: number | "";
  open_rv_24m: number | "";
};

const fieldLabels: { [K in keyof FormData]: string } = {
  int_rate: "Interest Rate (%)",
  term: "Term (Months)",
  dti: "Debt-to-Income Ratio (%)",
  fico_range_high: "FICO Range High",
  acc_open_past_24mths: "Accounts Opened (24m)",
  mo_sin_old_rev_tl_op: "Months Since Oldest Revolving TL",
  bc_open_to_buy: "Bankcard Open to Buy ($)",
  mort_acc: "Open Mortgage Accounts",
  total_bc_limit: "Total Bankcard Limit ($)",
  avg_cur_bal: "Average Current Balance ($)",
  open_rv_24m: "Open Revolving Accounts (24m)"
};

const fieldMeta: {
  [key in keyof FormData]: {
    min: number;
    max?: number;
    placeholder: string;
    tooltip: string;
  }
} = {
  int_rate: {
    min: 0,
    max: 40,
    placeholder: "e.g., 13.99",
    tooltip: "Annual interest rate for the loan (percentage)."
  },
  term: {
    min: 12,
    max: 60,
    placeholder: "e.g., 36",
    tooltip: "Length of the loan in months (typically 36 or 60)."
  },
  dti: {
    min: 0,
    max: 50,
    placeholder: "e.g., 18.5",
    tooltip: "Debt-to-Income Ratio (percentage, total monthly debt payments divided by gross monthly income)."
  },
  fico_range_high: {
    min: 300,
    max: 850,
    placeholder: "e.g., 720",
    tooltip: "Highest value of the applicant's FICO credit score range (between 300 and 850)."
  },
  acc_open_past_24mths: {
    min: 0,
    max: 20,
    placeholder: "e.g., 2",
    tooltip: "Number of accounts opened by the applicant in the past 24 months."
  },
  mo_sin_old_rev_tl_op: {
    min: 0,
    max: 600,
    placeholder: "e.g., 60",
    tooltip: "Months since the oldest revolving trade line (credit card) was opened."
  },
  bc_open_to_buy: {
    min: 0,
    max: 100000,
    placeholder: "e.g., 4000",
    tooltip: "Available credit limit on bankcards ($)."
  },
  mort_acc: {
    min: 0,
    max: 20,
    placeholder: "e.g., 1",
    tooltip: "Number of open mortgage accounts."
  },
  total_bc_limit: {
    min: 0,
    max: 100000,
    placeholder: "e.g., 12000",
    tooltip: "Sum of all bankcard credit limits ($)."
  },
  avg_cur_bal: {
    min: 0,
    max: 100000,
    placeholder: "e.g., 8500",
    tooltip: "Average current balance across all accounts ($)."
  },
  open_rv_24m: {
    min: 0,
    max: 20,
    placeholder: "e.g., 1",
    tooltip: "Number of revolving accounts opened in the last 24 months."
  }
};

const initialForm: FormData = {
  int_rate: "",
  term: "",
  dti: "",
  fico_range_high: "",
  acc_open_past_24mths: "",
  mo_sin_old_rev_tl_op: "",
  bc_open_to_buy: "",
  mort_acc: "",
  total_bc_limit: "",
  avg_cur_bal: "",
  open_rv_24m: ""
};

const CreditScoringForm: React.FC = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const validateForm = (data: FormData) => {
    for (const key in fieldMeta) {
      const val = data[key as keyof FormData];
      const { min, max } = fieldMeta[key as keyof FormData];
      if (val === "" || val === undefined || val === null) {
        return `${fieldLabels[key as keyof FormData]} is required.`;
      }
      if (val < min) {
        return `${fieldLabels[key as keyof FormData]} cannot be less than ${min}.`;
      }
      if (max !== undefined && val > max) {
        return `${fieldLabels[key as keyof FormData]} cannot be greater than ${max}.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScore(null);
    setError(null);
    setLoading(true);

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("API error: " + response.status);
      }

      const result = await response.json();
      setScore(result.default_probability);
    } catch (err: any) {
      setError("Failed to score applicant. Please check the input or API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-2xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Credit Default Risk Prediction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(form).map(([key, value]) => (
          <div key={key} className="flex flex-col relative group">
            <label htmlFor={key} className="mb-1 font-medium text-gray-700 flex items-center gap-1">
              {fieldLabels[key as keyof FormData]}
              <span
                className="text-gray-400 cursor-pointer"
                tabIndex={0}
                aria-label="Field info"
              >
                &#9432;
                <span className="absolute z-20 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity left-full ml-2 w-56 pointer-events-none">
                  {fieldMeta[key as keyof FormData].tooltip}
                </span>
              </span>
            </label>
            <input
              required
              type="number"
              id={key}
              name={key}
              value={value}
              min={fieldMeta[key as keyof FormData].min}
              max={fieldMeta[key as keyof FormData].max}
              step="any"
              placeholder={fieldMeta[key as keyof FormData].placeholder}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        {error && (
          <div className="bg-red-100 text-red-700 rounded p-2 text-center">{error}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Scoring..." : "Predict Default Risk"}
        </button>
      </form>
      {score !== null && (
        <div className="mt-6 p-4 bg-gray-100 rounded-xl text-center shadow">
          <span className="font-semibold">Estimated Default Probability:</span>
          <span className="ml-2 text-xl font-bold text-blue-800">
            {(score * 100).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default CreditScoringForm;
