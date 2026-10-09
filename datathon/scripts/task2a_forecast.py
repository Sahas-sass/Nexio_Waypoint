import os
import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.linear_model import Ridge
import joblib

DATA_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
MODELS_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\models"
OUTPUT_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\output"

def build_aggregated_weekly_data():
    deliv_train = pd.read_csv(os.path.join(DATA_DIR, "Training Data", "deliveries_train.csv"))
    deliv_test = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task1_test_inputs.csv"))
    cal = pd.read_csv(os.path.join(DATA_DIR, "General Data", "calendar.csv"))

    all_deliv = pd.concat([deliv_train, deliv_test], ignore_index=True)
    all_deliv = all_deliv.merge(cal[['date', 'iso_year', 'iso_week']], left_on='order_date', right_on='date', how='left')

    agg = all_deliv.groupby(['depot', 'brand', 'iso_year', 'iso_week']).agg(
        total_volume_m3=('order_volume_m3', 'sum'),
        chilled_volume_m3=('order_volume_m3', lambda s: all_deliv.loc[s.index[all_deliv.loc[s.index, 'temp_requirement'] == 'chilled'], 'order_volume_m3'].sum()),
        order_count=('delivery_id', 'count')
    ).reset_index()

    # Aggregate weekly calendar features
    cal_week = cal.groupby(['iso_year', 'iso_week']).agg(
        n_days=('date', 'count'),
        n_holidays=('is_holiday', 'sum'),
        avg_festival_ramp=('festival_ramp', 'mean'),
        max_festival_ramp=('festival_ramp', 'max'),
        is_new_year=('festival', lambda s: int('new_year' in s.values)),
        is_vesak=('festival', lambda s: int('vesak' in s.values)),
        is_poson=('festival', lambda s: int('poson' in s.values)),
        avg_monsoon=('monsoon', 'mean')
    ).reset_index()

    agg = agg.merge(cal_week, on=['iso_year', 'iso_week'], how='left')
    agg = agg.sort_values(['depot', 'brand', 'iso_year', 'iso_week']).reset_index(drop=True)
    return agg, cal_week

def generate_forecasts():
    print("Building Task 2A time-series dataset...")
    agg, cal_week = build_aggregated_weekly_data()
    t2a_test = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2a_test_inputs.csv"))

    # We will forecast for each (depot, brand) series separately
    all_forecasts = []

    series_list = t2a_test[['depot', 'brand']].drop_duplicates().values.tolist()

    saved_models_total = {}
    saved_models_chilled = {}

    for depot, brand in series_list:
        print(f"\nForecasting series: Depot={depot}, Brand={brand}")
        s_data = agg[(agg['depot'] == depot) & (agg['brand'] == brand)].copy().reset_index(drop=True)
        s_test = t2a_test[(t2a_test['depot'] == depot) & (t2a_test['brand'] == brand)].copy().reset_index(drop=True)
        s_test = s_test.merge(cal_week, on=['iso_year', 'iso_week'], how='left')

        # Recent baseline from 2026 weeks 1-13
        recent_2026 = s_data[(s_data['iso_year'] == 2026) & (s_data['iso_week'] <= 13)]
        mean_2026 = recent_2026['total_volume_m3'].mean()
        mean_2025_early = s_data[(s_data['iso_year'] == 2025) & (s_data['iso_week'] <= 13)]['total_volume_m3'].mean()
        yoy_growth = mean_2026 / (mean_2025_early + 1e-5)
        print(f"  YoY Growth (2026 vs 2025): {yoy_growth:.4f}")

        # Map historical same-week volume from 2025 (lag 52) and 2024 (lag 104)
        vol_dict_2025 = s_data[s_data['iso_year'] == 2025].set_index('iso_week')['total_volume_m3'].to_dict()
        vol_dict_2024 = s_data[s_data['iso_year'] == 2024].set_index('iso_week')['total_volume_m3'].to_dict()

        chilled_dict_2025 = s_data[s_data['iso_year'] == 2025].set_index('iso_week')['chilled_volume_m3'].to_dict()
        chilled_dict_2024 = s_data[s_data['iso_year'] == 2024].set_index('iso_week')['chilled_volume_m3'].to_dict()

        # Build feature dataset for historical training
        # For each week, features: iso_week, sin_week, cos_week, n_holidays, avg_festival_ramp, is_new_year, is_vesak, is_poson
        # lag_52_vol (volume same week last year), lag_104_vol
        train_rows = []
        for idx, row in s_data.iterrows():
            yr, wk = row['iso_year'], row['iso_week']
            # lag 52 is previous year same week
            l52 = s_data[(s_data['iso_year'] == yr - 1) & (s_data['iso_week'] == wk)]
            l104 = s_data[(s_data['iso_year'] == yr - 2) & (s_data['iso_week'] == wk)]
            val_l52 = l52['total_volume_m3'].values[0] if len(l52) > 0 else row['total_volume_m3']
            val_l104 = l104['total_volume_m3'].values[0] if len(l104) > 0 else val_l52
            
            c_l52 = l52['chilled_volume_m3'].values[0] if len(l52) > 0 else row['chilled_volume_m3']
            c_l104 = l104['chilled_volume_m3'].values[0] if len(l104) > 0 else c_l52

            train_rows.append({
                'iso_year': yr,
                'iso_week': wk,
                'sin_week': np.sin(2 * np.pi * wk / 52.0),
                'cos_week': np.cos(2 * np.pi * wk / 52.0),
                'n_holidays': row['n_holidays'],
                'avg_festival_ramp': row['avg_festival_ramp'],
                'is_new_year': row['is_new_year'],
                'is_vesak': row['is_vesak'],
                'is_poson': row['is_poson'],
                'lag_52_total': val_l52,
                'lag_104_total': val_l104,
                'lag_52_chilled': c_l52,
                'lag_104_chilled': c_l104,
                'total_volume_m3': row['total_volume_m3'],
                'chilled_volume_m3': row['chilled_volume_m3']
            })
        
        train_features_df = pd.DataFrame(train_rows)
        # Use year >= 2025 for training lag-based models to ensure valid lag_52
        train_subset = train_features_df[train_features_df['iso_year'] >= 2025]

        feature_cols_total = ['sin_week', 'cos_week', 'n_holidays', 'avg_festival_ramp', 'is_new_year', 'is_vesak', 'is_poson', 'lag_52_total', 'lag_104_total']
        
        # Fit Ridge / Elastic / LightGBM for total volume
        model_total = Ridge(alpha=1.0)
        model_total.fit(train_subset[feature_cols_total], train_subset['total_volume_m3'])

        # LightGBM regressor for total volume
        lgb_total = lgb.LGBMRegressor(n_estimators=100, learning_rate=0.05, num_leaves=15, random_state=42, verbose=-1)
        lgb_total.fit(train_subset[feature_cols_total], train_subset['total_volume_m3'])

        # Test features for 2026 weeks 14-23
        test_rows = []
        for idx, row in s_test.iterrows():
            wk = row['iso_week']
            l52_tot = vol_dict_2025.get(wk, mean_2026 / yoy_growth)
            l104_tot = vol_dict_2024.get(wk, l52_tot)
            l52_chi = chilled_dict_2025.get(wk, 0.0)
            l104_chi = chilled_dict_2024.get(wk, l52_chi)

            test_rows.append({
                'row_id': row['row_id'],
                'depot': depot,
                'brand': brand,
                'iso_year': 2026,
                'iso_week': wk,
                'sin_week': np.sin(2 * np.pi * wk / 52.0),
                'cos_week': np.cos(2 * np.pi * wk / 52.0),
                'n_holidays': row['n_holidays'],
                'avg_festival_ramp': row['avg_festival_ramp'],
                'is_new_year': row['is_new_year'],
                'is_vesak': row['is_vesak'],
                'is_poson': row['is_poson'],
                'lag_52_total': l52_tot,
                'lag_104_total': l104_tot,
                'lag_52_chilled': l52_chi,
                'lag_104_chilled': l104_chi,
            })
        test_features_df = pd.DataFrame(test_rows)

        # Baseline projection: 2025 volume scaled by YoY growth
        baseline_proj = test_features_df['lag_52_total'] * yoy_growth
        ridge_pred = model_total.predict(test_features_df[feature_cols_total])
        lgb_pred = lgb_total.predict(test_features_df[feature_cols_total])

        # Robust ensemble (50% YoY scaled seasonal baseline + 25% Ridge + 25% LightGBM)
        final_total = 0.50 * baseline_proj + 0.25 * ridge_pred + 0.25 * lgb_pred

        # Chilled prediction
        if brand in ['Style', 'Tech']:
            final_chilled = np.zeros(len(s_test))
        else:
            # For Fresh, use the known stable ratio ~ 0.3635 (Kandy) / 0.3683 (Peliyagoda)
            chilled_ratio = s_data['chilled_volume_m3'].sum() / s_data['total_volume_m3'].sum()
            # Also train a chilled model
            feature_cols_chilled = ['sin_week', 'cos_week', 'n_holidays', 'avg_festival_ramp', 'is_new_year', 'is_vesak', 'is_poson', 'lag_52_chilled', 'lag_104_chilled']
            model_chilled = Ridge(alpha=1.0)
            model_chilled.fit(train_subset[feature_cols_chilled], train_subset['chilled_volume_m3'])
            ridge_chilled = model_chilled.predict(test_features_df[feature_cols_chilled])
            baseline_chilled = test_features_df['lag_52_chilled'] * yoy_growth
            chilled_from_ratio = final_total * chilled_ratio
            final_chilled = 0.4 * baseline_chilled + 0.3 * ridge_chilled + 0.3 * chilled_from_ratio

        s_test['pred_total_volume_m3'] = np.round(final_total, 3)
        s_test['pred_chilled_volume_m3'] = np.round(final_chilled, 3)

        # Print sample predictions
        for _, r in s_test.iterrows():
            print(f"  Week {r['iso_week']}: Total = {r['pred_total_volume_m3']:.2f} m3, Chilled = {r['pred_chilled_volume_m3']:.2f} m3")

        all_forecasts.append(s_test[['row_id', 'pred_total_volume_m3', 'pred_chilled_volume_m3']])
        saved_models_total[f"{depot}_{brand}"] = model_total
        saved_models_chilled[f"{depot}_{brand}"] = model_chilled if brand == 'Fresh' else None

    # Combine all
    forecast_df = pd.concat(all_forecasts, ignore_index=True)

    # Strictly reorder to match task2a_test_inputs.csv
    template_path = os.path.join(DATA_DIR, "Submission Templates", "submission_task2a.csv")
    template = pd.read_csv(template_path)
    final_sub = template[['row_id']].merge(forecast_df, on='row_id', how='left')

    # Enforce non-negativity and exact constraints
    final_sub['pred_total_volume_m3'] = np.maximum(final_sub['pred_total_volume_m3'], 0.0)
    final_sub['pred_chilled_volume_m3'] = np.maximum(final_sub['pred_chilled_volume_m3'], 0.0)

    # Verify template match
    assert len(final_sub) == len(template), f"Length mismatch: {len(final_sub)} vs {len(template)}"
    assert (final_sub['row_id'] == template['row_id']).all(), "row_id order mismatch!"
    assert not final_sub['pred_total_volume_m3'].isna().any(), "NaN found in pred_total_volume_m3"
    assert not final_sub['pred_chilled_volume_m3'].isna().any(), "NaN found in pred_chilled_volume_m3"

    sub_output_path = os.path.join(OUTPUT_DIR, "submission_task2a.csv")
    final_sub.to_csv(sub_output_path, index=False)
    print(f"\nSuccessfully saved Task 2A submission to {sub_output_path} ({len(final_sub)} rows).")

    # Save models
    joblib.dump(saved_models_total, os.path.join(MODELS_DIR, "task2a_total.joblib"))
    joblib.dump(saved_models_chilled, os.path.join(MODELS_DIR, "task2a_chilled.joblib"))
    print("Saved Task 2A models to models/ directory.")

if __name__ == "__main__":
    generate_forecasts()
