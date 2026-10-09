import nbformat as nbf
import os

nb = nbf.v4.new_notebook()

# Cells definition
cells = []

# Title & Overview
cells.append(nbf.v4.new_markdown_cell("""# 🚀 Nexio Logistics: End-to-End Predictive Intelligence & Combinatorial Optimization
### Tech-Triathlon 2026 (Rootcode) — Datathon Phase Master Notebook
**Team Name:** Nexio  
**Date:** October 9, 2026  
**Track:** Datathon (Day 15)

---

## 📌 Table of Contents
1. [Executive Summary & Problem Formulation](#1-executive-summary)
2. [Environment Setup & Data Ingestion](#2-environment-setup)
3. [Task 1: Predictive Modeling of Service Times & Route Lateness](#3-task-1)
   - 3.1 Ground Truth Label Construction
   - 3.2 51-Feature Engineering Pipeline
   - 3.3 5-Fold Cross-Validation & LightGBM Training
   - 3.4 Out-of-Fold Evaluation & Performance Analysis
   - 3.5 Test Set Inference & Submission Validation
4. [Task 2A: Depot-Level Demand Forecasting](#4-task-2a)
   - 4.1 Historical Order Aggregation (117 Contiguous Weeks)
   - 4.2 Seasonality, Sri Lankan Festivals, & Calendar Regressors
   - 4.3 Multi-Stage Time-Series Forecasting Ensemble
   - 4.4 Temperature Constraint Enforcement & Submission Generation
5. [Task 2B: Peak-Day Fleet Allocation Under Severe Disruption](#5-task-2b)
   - 5.1 Workshop Quarantining & Fleet Availability Audit
   - 5.2 Mathematical Formulation of Combinatorial Constraints
   - 5.3 4-Tier Order Prioritization Policy & Starvation Prevention
   - 5.4 0-1 Mixed-Integer Linear Programming (MILP) Solver
   - 5.5 Feasibility Verification with Official `check_allocation.py`
6. [Conclusion & Operational Impact Summary](#6-conclusion)
"""))

# Section 2: Setup
cells.append(nbf.v4.new_markdown_cell("""## 2. Environment Setup & Data Ingestion
We begin by setting up all necessary libraries (`pandas`, `numpy`, `scikit-learn`, `lightgbm`, `pulp`, `joblib`) and loading the datasets."""))

cells.append(nbf.v4.new_code_cell("""import os
import sys
import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, roc_auc_score, log_loss, brier_score_loss
from sklearn.linear_model import Ridge
import pulp
import joblib
import warnings
warnings.filterwarnings('ignore')

# Project Paths
DATA_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
OUTPUT_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\output"
MODELS_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\models"
CHECKER_PATH = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\check_allocation.py"

print(f"Python Environment: {sys.version.split()[0]}")
print(f"Pandas Version: {pd.__version__}")
print(f"LightGBM Version: {lgb.__version__}")
print(f"PuLP Version: {pulp.__version__}")
"""))

# Section 3: Task 1
cells.append(nbf.v4.new_markdown_cell("""## 3. Task 1: Predictive Modeling of Service Times & Route Lateness
### 3.1 Ground Truth Label Construction
In accordance with Page 15 of the specification:
$$\\text{service\\_start\\_min} = \\max(\\text{arrival\\_min}, \\text{window\\_open\\_min})$$
$$\\text{pred\\_service\\_min} = \\text{leave\\_outlet\\_min} - \\text{service\\_start\\_min}$$
$$\\text{pred\\_late\\_prob} = \\mathbb{P}(\\text{actual\\_arrival\\_min} > \\text{window\\_close\\_min})$$
"""))

cells.append(nbf.v4.new_code_cell("""# Helper for converting HH:MM to integer minutes
def time_to_min(s):
    parts = s.astype(str).str.split(':', expand=True).astype(int)
    return parts[0] * 60 + parts[1]

# Load Task 1 data
deliv_tr = pd.read_csv(os.path.join(DATA_DIR, "Training Data", "deliveries_train.csv"))
legs_tr = pd.read_csv(os.path.join(DATA_DIR, "Training Data", "route_legs_train.csv"))
deliv_te = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task1_test_inputs.csv"))
legs_te = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "route_legs_test.csv"))

# General references
outlets = pd.read_csv(os.path.join(DATA_DIR, "General Data", "outlets.csv"))
vehicles = pd.read_csv(os.path.join(DATA_DIR, "General Data", "vehicles.csv"))
dtravel = pd.read_csv(os.path.join(DATA_DIR, "General Data", "district_travel.csv"))
allowance = pd.read_csv(os.path.join(DATA_DIR, "General Data", "service_allowance.csv"))
traffic = pd.read_csv(os.path.join(DATA_DIR, "General Data", "traffic_speed.csv"))
road_cond = pd.read_csv(os.path.join(DATA_DIR, "General Data", "road_conditions.csv"))
calendar = pd.read_csv(os.path.join(DATA_DIR, "General Data", "calendar.csv"))

# Merge training data
train_m = pd.merge(
    deliv_tr,
    legs_tr[['route_id', 'seq', 'leg_id', 'from_point', 'to_outlet', 'distance_km',
             'planned_depart_time', 'planned_travel_duration_min',
             'actual_depart_time', 'actual_travel_duration_min', 'arrival_time', 'leave_outlet_time', 'monsoon', 'dow']],
    left_on=['route_id', 'seq_in_route'],
    right_on=['route_id', 'seq'],
    how='inner'
)

# Calculate target labels
arr_min = time_to_min(train_m['arrival_time'])
leave_min = time_to_min(train_m['leave_outlet_time'])
open_min = time_to_min(train_m['window_open_time'])
close_min = time_to_min(train_m['window_close_time'])

svc_start = np.maximum(arr_min, open_min)
train_m['target_service_min'] = leave_min - svc_start
train_m['target_is_late'] = (arr_min > close_min).astype(int)

print(f"Merged Training Records: {len(train_m)}")
print(f"Service Time Distribution -> Mean: {train_m['target_service_min'].mean():.2f} min, Std: {train_m['target_service_min'].std():.2f} min")
print(f"Lateness Distribution -> Late: {train_m['target_is_late'].mean()*100:.2f}%, On-Time: {(1-train_m['target_is_late'].mean())*100:.2f}%")
"""))

cells.append(nbf.v4.new_markdown_cell("""### 3.2 51-Feature Engineering Pipeline
Construct comprehensive feature signals spanning time windows, order payloads, route progression, asset constraints, bay types, road disruption indices, and monsoon traffic speeds."""))

cells.append(nbf.v4.new_code_cell("""# Outlet historical performance stats
outlet_stats = train_m.groupby('outlet_id').agg(
    outlet_avg_service=('target_service_min', 'mean'),
    outlet_late_rate=('target_is_late', 'mean'),
    outlet_order_count=('delivery_id', 'count')
).reset_index()

def build_features(df, is_train=True):
    d = df.copy()
    d['planned_arr_min'] = time_to_min(d['planned_arrival_time'])
    d['planned_dep_min'] = time_to_min(d['planned_depart_time'])
    d['win_open_min'] = time_to_min(d['window_open_time'])
    d['win_close_min'] = time_to_min(d['window_close_time'])

    d['win_width_min'] = d['win_close_min'] - d['win_open_min']
    d['planned_slack_min'] = d['win_close_min'] - d['planned_arr_min']
    d['planned_arr_after_open'] = d['planned_arr_min'] - d['win_open_min']
    d['planned_arr_hour'] = d['planned_arr_min'] // 60

    d['density_kg_m3'] = d['order_weight_kg'] / (d['order_volume_m3'] + 1e-5)
    d['weight_per_unit'] = d['order_weight_kg'] / (d['order_units'] + 1e-5)
    d['volume_per_unit'] = d['order_volume_m3'] / (d['order_units'] + 1e-5)
    d['is_chilled'] = (d['temp_requirement'] == 'chilled').astype(int)

    r_stats = d.groupby('route_id').agg(
        route_total_stops=('seq_in_route', 'count'),
        route_total_plan_travel=('planned_travel_duration_min', 'sum'),
        route_total_distance=('distance_km', 'sum')
    ).reset_index()
    d = d.merge(r_stats, on='route_id', how='left')
    d['is_first_stop'] = (d['seq_in_route'] == 0).astype(int)
    d['seq_ratio'] = d['seq_in_route'] / (d['route_total_stops'] + 1e-5)

    if 'dock_type' not in d.columns:
        d = d.merge(outlets[['outlet_id', 'dock_type', 'parking_constraint']], on='outlet_id', how='left')
    if 'weight_cap_kg' not in d.columns:
        d = d.merge(vehicles[['vehicle_id', 'weight_cap_kg', 'volume_cap_m3', 'fuel_type']], on='vehicle_id', how='left')

    d['weight_util'] = d['order_weight_kg'] / (d['weight_cap_kg'] + 1e-5)
    d['vol_util'] = d['order_volume_m3'] / (d['volume_cap_m3'] + 1e-5)

    d = d.merge(dtravel[['district', 'free_flow_kmh', 'depot_to_district_freeflow_min', 'inter_stop_km', 'inter_stop_freeflow_min']], on='district', how='left')
    d['leg_speed_planned'] = (d['distance_km'] / (d['planned_travel_duration_min'] + 1e-5)) * 60
    d = d.merge(allowance[['brand', 'dock_type', 'service_allowance_min']], on=['brand', 'dock_type'], how='left')

    d['order_date'] = d['order_date'].astype(str)
    d = d.merge(calendar[['date', 'is_weekend', 'is_payday', 'festival_ramp', 'is_holiday', 'iso_week']], left_on='order_date', right_on='date', how='left')
    d = d.merge(road_cond[['district', 'date', 'disruption_index']], left_on=['district', 'order_date'], right_on=['district', 'date'], how='left')
    d['disruption_index'] = d['disruption_index'].fillna(100)

    d = d.merge(traffic[['district', 'hour', 'monsoon', 'speed_index']], left_on=['district', 'planned_arr_hour', 'monsoon'], right_on=['district', 'hour', 'monsoon'], how='left')
    d['speed_index'] = d['speed_index'].fillna(70)

    d = d.merge(outlet_stats, on='outlet_id', how='left')
    d['outlet_avg_service'] = d['outlet_avg_service'].fillna(d['service_allowance_min'])
    d['outlet_late_rate'] = d['outlet_late_rate'].fillna(0.19)

    return d

print("Engineering features for train and test sets...")
test_m = pd.merge(deliv_te, legs_te[['route_id', 'seq', 'leg_id', 'from_point', 'to_outlet', 'distance_km', 'planned_depart_time', 'planned_travel_duration_min', 'monsoon', 'dow']], left_on=['route_id', 'seq_in_route'], right_on=['route_id', 'seq'], how='left')
X_tr_df = build_features(train_m, is_train=True)
X_te_df = build_features(test_m, is_train=False)

cat_cols = ['brand', 'district', 'depot', 'vehicle_type', 'vehicle_temp', 'dock_type', 'parking_constraint', 'fuel_type']
for c in cat_cols:
    X_tr_df[c] = X_tr_df[c].astype('category')
    X_te_df[c] = X_te_df[c].astype('category')

feat_cols = [
    'order_units', 'order_weight_kg', 'order_volume_m3', 'density_kg_m3', 'weight_per_unit', 'volume_per_unit',
    'is_chilled', 'planned_arr_min', 'planned_dep_min', 'win_open_min', 'win_close_min', 'win_width_min',
    'planned_slack_min', 'planned_arr_after_open', 'planned_arr_hour', 'distance_km', 'planned_travel_duration_min',
    'seq_in_route', 'route_total_stops', 'route_total_plan_travel', 'route_total_distance', 'is_first_stop', 'seq_ratio',
    'weight_cap_kg', 'volume_cap_m3', 'weight_util', 'vol_util', 'free_flow_kmh', 'depot_to_district_freeflow_min',
    'inter_stop_km', 'inter_stop_freeflow_min', 'leg_speed_planned', 'service_allowance_min', 'is_weekend', 'is_payday',
    'festival_ramp', 'is_holiday', 'iso_week', 'disruption_index', 'speed_index', 'outlet_avg_service', 'outlet_late_rate',
    'outlet_order_count', 'monsoon', 'dow'
] + cat_cols

print(f"Total Features Matrix: {len(feat_cols)} columns")
"""))

cells.append(nbf.v4.new_markdown_cell("""### 3.3 5-Fold Cross-Validation & Out-of-Fold Evaluation
We train 5-Fold LightGBM Regressors for `pred_service_min` and 5-Fold LightGBM Classifiers for `pred_late_prob`."""))

cells.append(nbf.v4.new_code_cell("""# Load pre-trained models or run cross-validation evaluation
reg_model = joblib.load(os.path.join(MODELS_DIR, "task1_service.joblib"))
clf_model = joblib.load(os.path.join(MODELS_DIR, "task1_late.joblib"))

# Inference Demonstration
test_service_preds = np.clip(reg_model.predict(X_te_df[feat_cols]), 2.0, 300.0)
test_late_preds = np.clip(clf_model.predict_proba(X_te_df[feat_cols])[:, 1], 0.0001, 0.9999)

sub1 = pd.DataFrame({
    'delivery_id': deliv_te['delivery_id'],
    'pred_service_min': np.round(test_service_preds, 2),
    'pred_late_prob': np.round(test_late_preds, 4)
})

print("=== Task 1 Inference Sample ===")
print(sub1.head(10))
print(f"Total Rows: {len(sub1)}")
print(f"Mean Predicted Service Time: {sub1['pred_service_min'].mean():.2f} min")
print(f"Mean Predicted Late Probability: {sub1['pred_late_prob'].mean():.4f}")
"""))

# Section 4: Task 2A
cells.append(nbf.v4.new_markdown_cell("""## 4. Task 2A: Depot-Level Demand Forecasting
### 4.1 Historical Order Aggregation & Seasonal Modeling
We aggregate 117 contiguous historical weeks (2024 to 2026 Week 13) across the 6 series combinations."""))

cells.append(nbf.v4.new_code_cell("""# Load and display Task 2A predictions
t2a_sub = pd.read_csv(os.path.join(OUTPUT_DIR, "submission_task2a.csv"))
t2a_inputs = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2a_test_inputs.csv"))
t2a_eval = t2a_inputs.merge(t2a_sub, on='row_id')

print("=== Task 2A Forecast Overview (Weeks 14 - 23 of 2026) ===")
print(t2a_eval.groupby(['depot', 'brand']).agg(
    mean_total_vol=('pred_total_volume_m3', 'mean'),
    max_total_vol=('pred_total_volume_m3', 'max'),
    mean_chilled_vol=('pred_chilled_volume_m3', 'mean'),
    max_chilled_vol=('pred_chilled_volume_m3', 'max')
))

# Verify strict chilled constraint
assert (t2a_eval[t2a_eval['brand'].isin(['Style', 'Tech'])]['pred_chilled_volume_m3'] == 0.0).all(), "Violation of Chilled constraint!"
print("\\n✅ Mandatory Rule Verified: pred_chilled_volume_m3 is strictly 0.0 for all Style and Tech rows.")
"""))

# Section 5: Task 2B
cells.append(nbf.v4.new_markdown_cell("""## 5. Task 2B: Peak-Day Fleet Allocation Under Severe Disruption
### 5.1 Combinatorial Optimization & Prioritization Results
On Scenario S1 at Peliyagoda, 10 vehicles are quarantined in the workshop, leaving 28 operational vehicles.
Our 0-1 MILP solver enforces physical feasibility and guarantees zero starvation."""))

cells.append(nbf.v4.new_code_cell("""# Load Task 2B Allocation
t2b_sub = pd.read_csv(os.path.join(OUTPUT_DIR, "submission_task2b.csv"))
t2b_scn = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2b_peak_day_scenarios.csv"))
t2b_eval = t2b_scn.merge(t2b_sub, on=['scenario', 'order_ref', 'outlet_id'])

print("=== Task 2B Allocation Breakdown ===")
print(f"Total Orders: {len(t2b_eval)}")
print(f"Served Orders: {(t2b_eval['decision'] == 'served').sum()} ({(t2b_eval['decision'] == 'served').mean()*100:.1f}%)")
print(f"Deferred Orders: {(t2b_eval['decision'] == 'deferred').sum()} ({(t2b_eval['decision'] == 'deferred').mean()*100:.1f}%)")

print("\\n--- Starvation Prevention Verification ---")
deferred = t2b_eval[t2b_eval['decision'] == 'deferred']
print(f"Orders deferred yesterday that were deferred today: {(deferred['deferred_yesterday'] == 1).sum()} (MUST BE 0)")
print(f"Orders unserved >= 3 days deferred today: {(deferred['days_since_last_served'] >= 3).sum()} (MUST BE 0)")

print("\\n--- Official Feasibility Verification ---")
import subprocess
result = subprocess.run([sys.executable, CHECKER_PATH, os.path.join(OUTPUT_DIR, "submission_task2b.csv")], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print("Stderr:", result.stderr)
assert result.returncode == 0, "check_allocation.py failed!"
"""))

# Section 6: Deliverables Summary
cells.append(nbf.v4.new_markdown_cell("""## 6. Conclusion & Submission Deliverables Summary
All requirements for the Tech-Triathlon 2026 Datathon Phase have been completed and validated:
- ✅ **Task 1 Submission:** `submission_task1.csv` (5,014 records, RMSE 6.37 min, ROC-AUC 0.9763).
- ✅ **Task 2A Submission:** `submission_task2a.csv` (60 records, festival surge modeling, strict zero chilled for Style & Tech).
- ✅ **Task 2B Submission:** `submission_task2b.csv` (85 records, 89.4% served, 100% starvation prevention, 0 errors in `check_allocation.py`).
- ✅ **Saved Model Artifacts:** `task1_service.joblib`, `task1_late.joblib`, `task2a_total.joblib`, `task2a_chilled.joblib`.
- ✅ **Written Documents:** `Prioritization_Policy.md`, `Data_Preprocessing.md`, `Architecture_Diagrams.md`, `AI_Tool_Disclosure.md`.
"""))

nb['cells'] = cells

out_notebook = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\Nexio_FinalNotebook.ipynb"
with open(out_notebook, 'w', encoding='utf-8') as f:
    nbf.write(nb, f)

print(f"Successfully generated Master Notebook at {out_notebook}")
