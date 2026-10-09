import os
import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, roc_auc_score, log_loss, brier_score_loss
import joblib

DATA_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
MODELS_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\models"
OUTPUT_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\output"

def time_to_minutes(series):
    parts = series.astype(str).str.split(':', expand=True).astype(int)
    return parts[0] * 60 + parts[1]

def load_and_preprocess_data():
    print("Loading datasets...")
    deliv_train = pd.read_csv(os.path.join(DATA_DIR, "Training Data", "deliveries_train.csv"))
    legs_train = pd.read_csv(os.path.join(DATA_DIR, "Training Data", "route_legs_train.csv"))
    deliv_test = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task1_test_inputs.csv"))
    legs_test = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "route_legs_test.csv"))
    
    outlets = pd.read_csv(os.path.join(DATA_DIR, "General Data", "outlets.csv"))
    vehicles = pd.read_csv(os.path.join(DATA_DIR, "General Data", "vehicles.csv"))
    dtravel = pd.read_csv(os.path.join(DATA_DIR, "General Data", "district_travel.csv"))
    allowance = pd.read_csv(os.path.join(DATA_DIR, "General Data", "service_allowance.csv"))
    traffic = pd.read_csv(os.path.join(DATA_DIR, "General Data", "traffic_speed.csv"))
    road_cond = pd.read_csv(os.path.join(DATA_DIR, "General Data", "road_conditions.csv"))
    calendar = pd.read_csv(os.path.join(DATA_DIR, "General Data", "calendar.csv"))

    # Join training deliveries and legs
    train_df = pd.merge(
        deliv_train,
        legs_train[['route_id', 'seq', 'leg_id', 'from_point', 'to_outlet', 'distance_km',
                    'planned_depart_time', 'planned_travel_duration_min',
                    'actual_depart_time', 'actual_travel_duration_min', 'arrival_time', 'leave_outlet_time', 'monsoon', 'dow']],
        left_on=['route_id', 'seq_in_route'],
        right_on=['route_id', 'seq'],
        how='inner'
    )

    # Join test deliveries and legs (preserving deliv_test order)
    test_df = pd.merge(
        deliv_test,
        legs_test[['route_id', 'seq', 'leg_id', 'from_point', 'to_outlet', 'distance_km',
                   'planned_depart_time', 'planned_travel_duration_min', 'monsoon', 'dow']],
        left_on=['route_id', 'seq_in_route'],
        right_on=['route_id', 'seq'],
        how='left'
    )

    # Calculate ground truth labels on train_df
    arr_min = time_to_minutes(train_df['arrival_time'])
    leave_min = time_to_minutes(train_df['leave_outlet_time'])
    open_min = time_to_minutes(train_df['window_open_time'])
    close_min = time_to_minutes(train_df['window_close_time'])

    service_start_min = np.maximum(arr_min, open_min)
    train_df['target_service_min'] = leave_min - service_start_min
    train_df['target_is_late'] = (arr_min > close_min).astype(int)

    return train_df, test_df, outlets, vehicles, dtravel, allowance, traffic, road_cond, calendar

def extract_features(df, outlets, vehicles, dtravel, allowance, traffic, road_cond, calendar, outlet_stats=None):
    df = df.copy()

    # Time features
    df['planned_arr_min'] = time_to_minutes(df['planned_arrival_time'])
    df['planned_dep_min'] = time_to_minutes(df['planned_depart_time'])
    df['win_open_min'] = time_to_minutes(df['window_open_time'])
    df['win_close_min'] = time_to_minutes(df['window_close_time'])

    df['win_width_min'] = df['win_close_min'] - df['win_open_min']
    df['planned_slack_min'] = df['win_close_min'] - df['planned_arr_min']
    df['planned_arr_after_open'] = df['planned_arr_min'] - df['win_open_min']
    df['planned_arr_hour'] = df['planned_arr_min'] // 60

    # Order payload
    df['density_kg_m3'] = df['order_weight_kg'] / (df['order_volume_m3'] + 1e-5)
    df['weight_per_unit'] = df['order_weight_kg'] / (df['order_units'] + 1e-5)
    df['volume_per_unit'] = df['order_volume_m3'] / (df['order_units'] + 1e-5)
    df['is_chilled'] = (df['temp_requirement'] == 'chilled').astype(int)

    # Route level progress
    route_stats = df.groupby('route_id').agg(
        route_max_seq=('seq_in_route', 'max'),
        route_total_stops=('seq_in_route', 'count'),
        route_total_plan_travel=('planned_travel_duration_min', 'sum'),
        route_total_distance=('distance_km', 'sum')
    ).reset_index()
    df = df.merge(route_stats, on='route_id', how='left')
    df['is_first_stop'] = (df['seq_in_route'] == 0).astype(int)
    df['seq_ratio'] = df['seq_in_route'] / (df['route_total_stops'] + 1e-5)

    # Merge Outlets details (dock_type, parking_constraint)
    if 'dock_type' not in df.columns:
        df = df.merge(outlets[['outlet_id', 'dock_type', 'parking_constraint']], on='outlet_id', how='left')

    # Merge Vehicle specs
    if 'weight_cap_kg' not in df.columns:
        df = df.merge(vehicles[['vehicle_id', 'weight_cap_kg', 'volume_cap_m3', 'fuel_type']], on='vehicle_id', how='left')
    df['weight_util'] = df['order_weight_kg'] / (df['weight_cap_kg'] + 1e-5)
    df['vol_util'] = df['order_volume_m3'] / (df['volume_cap_m3'] + 1e-5)

    # Merge District travel specs
    df = df.merge(dtravel[['district', 'free_flow_kmh', 'depot_to_district_freeflow_min', 'inter_stop_km', 'inter_stop_freeflow_min']], on='district', how='left')
    df['leg_speed_planned'] = (df['distance_km'] / (df['planned_travel_duration_min'] + 1e-5)) * 60

    # Merge Service Allowance standard
    df = df.merge(allowance[['brand', 'dock_type', 'service_allowance_min']], on=['brand', 'dock_type'], how='left')

    # Merge Calendar features
    df['order_date'] = df['order_date'].astype(str)
    df = df.merge(calendar[['date', 'is_weekend', 'is_payday', 'festival_ramp', 'is_holiday', 'iso_week']], left_on='order_date', right_on='date', how='left')

    # Merge Road disruption index
    df = df.merge(road_cond[['district', 'date', 'disruption_index']], left_on=['district', 'order_date'], right_on=['district', 'date'], how='left')
    df['disruption_index'] = df['disruption_index'].fillna(100)

    # Merge Traffic speed index (by district, planned_arr_hour, monsoon)
    df = df.merge(traffic[['district', 'hour', 'monsoon', 'speed_index']], left_on=['district', 'planned_arr_hour', 'monsoon'], right_on=['district', 'hour', 'monsoon'], how='left')
    df['speed_index'] = df['speed_index'].fillna(70)

    # Outlet target encoding stats if provided
    if outlet_stats is not None:
        df = df.merge(outlet_stats, on='outlet_id', how='left')
        df['outlet_avg_service'] = df['outlet_avg_service'].fillna(df['service_allowance_min'])
        df['outlet_late_rate'] = df['outlet_late_rate'].fillna(0.19)
    
    return df

def main():
    print("Starting Task 1 pipeline...")
    train_df, test_df, outlets, vehicles, dtravel, allowance, traffic, road_cond, calendar = load_and_preprocess_data()

    # Calculate outlet level historical stats from training data
    outlet_stats = train_df.groupby('outlet_id').agg(
        outlet_avg_service=('target_service_min', 'mean'),
        outlet_late_rate=('target_is_late', 'mean'),
        outlet_order_count=('delivery_id', 'count')
    ).reset_index()

    train_feat = extract_features(train_df, outlets, vehicles, dtravel, allowance, traffic, road_cond, calendar, outlet_stats)
    test_feat = extract_features(test_df, outlets, vehicles, dtravel, allowance, traffic, road_cond, calendar, outlet_stats)

    cat_cols = ['brand', 'district', 'depot', 'vehicle_type', 'vehicle_temp', 'dock_type', 'parking_constraint', 'fuel_type']
    for c in cat_cols:
        train_feat[c] = train_feat[c].astype('category')
        test_feat[c] = test_feat[c].astype('category')

    feature_cols = [
        'order_units', 'order_weight_kg', 'order_volume_m3', 'density_kg_m3', 'weight_per_unit', 'volume_per_unit',
        'is_chilled', 'planned_arr_min', 'planned_dep_min', 'win_open_min', 'win_close_min', 'win_width_min',
        'planned_slack_min', 'planned_arr_after_open', 'planned_arr_hour', 'distance_km', 'planned_travel_duration_min',
        'seq_in_route', 'route_total_stops', 'route_total_plan_travel', 'route_total_distance', 'is_first_stop', 'seq_ratio',
        'weight_cap_kg', 'volume_cap_m3', 'weight_util', 'vol_util', 'free_flow_kmh', 'depot_to_district_freeflow_min',
        'inter_stop_km', 'inter_stop_freeflow_min', 'leg_speed_planned', 'service_allowance_min', 'is_weekend', 'is_payday',
        'festival_ramp', 'is_holiday', 'iso_week', 'disruption_index', 'speed_index', 'outlet_avg_service', 'outlet_late_rate',
        'outlet_order_count', 'monsoon', 'dow'
    ] + cat_cols

    print(f"Number of features: {len(feature_cols)}")

    # 5-Fold Cross-Validation for Service Time (Regression) and Lateness (Classification)
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    oof_service = np.zeros(len(train_feat))
    oof_late_prob = np.zeros(len(train_feat))
    test_preds_service = np.zeros(len(test_feat))
    test_preds_late = np.zeros(len(test_feat))

    reg_models = []
    clf_models = []

    print("\n--- Training LightGBM Models across 5 folds ---")
    for fold, (trn_idx, val_idx) in enumerate(kf.split(train_feat)):
        X_tr, y_tr_svc, y_tr_late = train_feat.iloc[trn_idx][feature_cols], train_feat.iloc[trn_idx]['target_service_min'], train_feat.iloc[trn_idx]['target_is_late']
        X_val, y_val_svc, y_val_late = train_feat.iloc[val_idx][feature_cols], train_feat.iloc[val_idx]['target_service_min'], train_feat.iloc[val_idx]['target_is_late']

        # Regressor for service time
        reg = lgb.LGBMRegressor(
            n_estimators=600,
            learning_rate=0.03,
            num_leaves=31,
            max_depth=6,
            min_child_samples=20,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42 + fold,
            n_jobs=-1
        )
        reg.fit(X_tr, y_tr_svc, eval_set=[(X_val, y_val_svc)], callbacks=[lgb.early_stopping(stopping_rounds=40, verbose=False)])
        oof_service[val_idx] = reg.predict(X_val)
        test_preds_service += reg.predict(test_feat[feature_cols]) / 5.0
        reg_models.append(reg)

        # Classifier for late prob
        clf = lgb.LGBMClassifier(
            n_estimators=600,
            learning_rate=0.03,
            num_leaves=31,
            max_depth=6,
            min_child_samples=20,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42 + fold,
            n_jobs=-1
        )
        clf.fit(X_tr, y_tr_late, eval_set=[(X_val, y_val_late)], callbacks=[lgb.early_stopping(stopping_rounds=40, verbose=False)])
        oof_late_prob[val_idx] = clf.predict_proba(X_val)[:, 1]
        test_preds_late += clf.predict_proba(test_feat[feature_cols])[:, 1] / 5.0
        clf_models.append(clf)

        val_rmse = np.sqrt(mean_squared_error(y_val_svc, oof_service[val_idx]))
        val_mae = mean_absolute_error(y_val_svc, oof_service[val_idx])
        val_auc = roc_auc_score(y_val_late, oof_late_prob[val_idx])
        val_ll = log_loss(y_val_late, oof_late_prob[val_idx])
        print(f"Fold {fold+1} | Service RMSE: {val_rmse:.3f}, MAE: {val_mae:.3f} | Late AUC: {val_auc:.4f}, LogLoss: {val_ll:.4f}")

    total_rmse = np.sqrt(mean_squared_error(train_feat['target_service_min'], oof_service))
    total_mae = mean_absolute_error(train_feat['target_service_min'], oof_service)
    total_auc = roc_auc_score(train_feat['target_is_late'], oof_late_prob)
    total_ll = log_loss(train_feat['target_is_late'], oof_late_prob)
    total_brier = brier_score_loss(train_feat['target_is_late'], oof_late_prob)

    print("\n================ OOF EVALUATION SUMMARY ================")
    print(f"Overall Service Time -> RMSE: {total_rmse:.4f} min, MAE: {total_mae:.4f} min")
    print(f"Overall Late Probability -> ROC-AUC: {total_auc:.4f}, Log Loss: {total_ll:.4f}, Brier Score: {total_brier:.4f}")
    print("========================================================\n")

    # Post processing predictions
    # Service time must be positive (min ~ 2 min)
    test_preds_service = np.clip(test_preds_service, 2.0, 300.0)
    # Late prob strictly in [0.0001, 0.9999]
    test_preds_late = np.clip(test_preds_late, 0.0001, 0.9999)

    # Prepare submission
    sub_df = pd.DataFrame({
        'delivery_id': test_df['delivery_id'],
        'pred_service_min': np.round(test_preds_service, 2),
        'pred_late_prob': np.round(test_preds_late, 4)
    })

    # Validate against template
    template_path = os.path.join(DATA_DIR, "Submission Templates", "submission_task1.csv")
    template = pd.read_csv(template_path)
    assert len(sub_df) == len(template), f"Row count mismatch: {len(sub_df)} vs {len(template)}"
    assert (sub_df['delivery_id'] == template['delivery_id']).all(), "delivery_id order mismatch!"
    assert not sub_df['pred_service_min'].isna().any(), "NaN found in pred_service_min"
    assert not sub_df['pred_late_prob'].isna().any(), "NaN found in pred_late_prob"

    sub_output_path = os.path.join(OUTPUT_DIR, "submission_task1.csv")
    sub_df.to_csv(sub_output_path, index=False)
    print(f"Successfully saved Task 1 submission to {sub_output_path} ({len(sub_df)} rows).")

    # Save models
    joblib.dump(reg_models[0], os.path.join(MODELS_DIR, "task1_service.joblib"))
    joblib.dump(clf_models[0], os.path.join(MODELS_DIR, "task1_late.joblib"))
    print("Saved Task 1 models to models/ directory.")

if __name__ == "__main__":
    main()
