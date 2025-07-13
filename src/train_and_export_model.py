import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression
import scorecardpy as sc

df = pd.read_csv('../data/processed/df_woe.csv')

selected_vars = [
    'int_rate_woe', 'term_woe', 'dti_woe', 'fico_range_high_woe',
    'acc_open_past_24mths_woe', 'mo_sin_old_rev_tl_op_woe',
    'bc_open_to_buy_woe', 'mort_acc_woe', 'total_bc_limit_woe',
    'avg_cur_bal_woe', 'open_rv_24m_woe'
]
X = df[selected_vars]
y = df['default']

clf_final = LogisticRegression(solver='lbfgs', max_iter=1000, class_weight='balanced', random_state=42)
clf_final.fit(X, y)

joblib.dump(clf_final, '../model/credit_scorecard_model.joblib')

print("Model saved to ../model/credit_scorecard_model.joblib")