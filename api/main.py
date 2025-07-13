from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import scorecardpy as sc
from fastapi.middleware.cors import CORSMiddleware


model = joblib.load('../model/credit_scorecard_model.joblib')
bins = joblib.load('../model/woe_bins.joblib')
selected_vars = [
    'int_rate_woe', 'term_woe', 'dti_woe', 'fico_range_high_woe',
    'acc_open_past_24mths_woe', 'mo_sin_old_rev_tl_op_woe',
    'bc_open_to_buy_woe', 'mort_acc_woe', 'total_bc_limit_woe',
    'avg_cur_bal_woe', 'open_rv_24m_woe'
]


app = FastAPI(
    title="Credit Risk Classifier API",
    description="Score loan applicants for risk of default using a trained scorecard model.",
    version="1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ApplicantData(BaseModel):
    int_rate: float
    term: int
    dti: float
    fico_range_high: int
    acc_open_past_24mths: int
    mo_sin_old_rev_tl_op: int
    bc_open_to_buy: float
    mort_acc: int
    total_bc_limit: float
    avg_cur_bal: float
    open_rv_24m: int
@app.post("/score")
def score_applicant(data: ApplicantData):
    input_df = pd.DataFrame([data.model_dump()])
    input_woe = sc.woebin_ply(input_df, bins)
    input_woe[selected_vars] = input_woe[selected_vars].fillna(0)
    # (Optional strict check)
    # if input_woe[selected_vars].isnull().values.any():
    #     raise ValueError("Input contains values outside of trained bin ranges.")
    score = model.predict_proba(input_woe[selected_vars])[:, 1][0]
    return {"default_probability": float(score)}
