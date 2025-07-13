import joblib
import pandas as pd
import scorecardpy as sc

df = pd.read_csv('../data/processed/df_cleaned.csv')

selected_vars_raw = [
    'int_rate', 'term', 'dti', 'fico_range_high',
    'acc_open_past_24mths', 'mo_sin_old_rev_tl_op',
    'bc_open_to_buy', 'mort_acc', 'total_bc_limit',
    'avg_cur_bal', 'open_rv_24m', 'default'
]
df = df[selected_vars_raw]

bins = sc.woebin(df, y='default', print_info=True)

joblib.dump(bins, '../model/woe_bins.joblib')
print("Bins exported to ../model/woe_bins.joblib")