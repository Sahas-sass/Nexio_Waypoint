# Nexio Logistics: System Architecture & Workflow Diagrams

**Competition:** Tech-Triathlon 2026 (Rootcode) — Datathon Phase  
**Team:** Nexio  
**Date:** October 9, 2026  

---

## 1. High-Level Data & Solution Pipeline

```mermaid
flowchart TD
    subgraph RawData ["Raw Datasets"]
        D_Train["deliveries_train.csv<br/>(92,307 records)"]
        R_Train["route_legs_train.csv<br/>(91,894 records)"]
        General["General Data<br/>(calendar, outlets, vehicles,<br/>traffic_speed, road_conditions,<br/>service_allowance, district_travel)"]
        T1_Test["task1_test_inputs.csv<br/>& route_legs_test.csv<br/>(5,014 records)"]
        T2A_Test["task2a_test_inputs.csv<br/>(60 combinations)"]
        T2B_Test["task2b_peak_day_scenarios.csv<br/>& task2b_peak_day_fleet.csv"]
    end

    subgraph Task1 ["Task 1: Handling & Lateness Engine"]
        T1_Join["Exact 1:1 Join on (route_id, seq)"]
        T1_Labels["Compute Ground Truth Labels:<br/>- service_start = max(arr, open)<br/>- service_time = leave - service_start<br/>- is_late = arr > close"]
        T1_Features["51-Feature Pipeline<br/>(Slack, Route Progression, Docks, Weather, Disruption)"]
        T1_LGBM_Svc["5-Fold LightGBM Regressor<br/>(Service Time RMSE: 6.37m, MAE: 3.99m)"]
        T1_LGBM_Late["5-Fold LightGBM Classifier<br/>(ROC-AUC: 0.9763, LogLoss: 0.1536)"]
        T1_Out["submission_task1.csv<br/>(5,014 rows)"]
    end

    subgraph Task2A ["Task 2A: Depot Demand Forecasting"]
        T2A_Agg["Aggregate Weekly Order Volume<br/>(117 Contiguous Weeks, 2024-2026)"]
        T2A_Models["Multi-Stage Time-Series Ensemble<br/>- 52/104-Week Lag Trend Scaler<br/>- Harmonic Cyclical Regressors<br/>- Festival Ramp Surges (Avurudu, Vesak)"]
        T2A_Split["Temperature Decoupling:<br/>- Chilled = 0 for Style & Tech<br/>- Chilled Ratio ~ 36.6% for Fresh"]
        T2A_Out["submission_task2a.csv<br/>(60 rows)"]
    end

    subgraph Task2B ["Task 2B: Peak-Day Fleet Allocation"]
        T2B_Filter["Workshop Filtering:<br/>Exclude 10 In-Workshop Vehicles<br/>(28 Available at Peliyagoda)"]
        T2B_MILP["Branch-and-Cut 0-1 MILP Solver<br/>- Brand & District Exclusivity<br/>- Reefer & Van-Only Matching<br/>- Weight & Volume Capacities<br/>- Pre-dawn (270m) & Daytime (480m) Budgets"]
        T2B_Check["Official Validation Script<br/>(check_allocation.py: 0 Errors)"]
        T2B_Out["submission_task2b.csv<br/>(85 decisions: 90.6% served)"]
    end

    D_Train --> T1_Join
    R_Train --> T1_Join
    General --> T1_Features
    T1_Join --> T1_Labels --> T1_Features
    T1_Features --> T1_LGBM_Svc & T1_LGBM_Late
    T1_Test --> T1_LGBM_Svc & T1_LGBM_Late
    T1_LGBM_Svc & T1_LGBM_Late --> T1_Out

    D_Train & T1_Test --> T2A_Agg
    General --> T2A_Models
    T2A_Agg --> T2A_Models --> T2A_Split --> T2A_Out

    T2B_Test & General --> T2B_Filter --> T2B_MILP --> T2B_Check --> T2B_Out
```

---

## 2. Task 1 Predictive Intelligence Architecture

```mermaid
flowchart LR
    subgraph Inputs ["Input Observables"]
        OrderMeta["Order Payload<br/>(units, weight, vol, density)"]
        RouteProg["Route Sequence<br/>(seq_in_route, seq_ratio, first_stop)"]
        WinMeta["Delivery Window<br/>(open, close, span, planned_slack)"]
        AssetMeta["Fleet Specs<br/>(weight_util, vol_util, temp, type)"]
        DockMeta["Bay & Parking<br/>(dock_type, parking_constraint, allowance)"]
        EnvMeta["Traffic & Weather<br/>(disruption_index, speed_index, monsoon)"]
    end

    subgraph FeatureFusion ["Feature Fusion Layer (51 Features)"]
        Features["Feature Matrix X"]
    end

    subgraph Models ["5-Fold Cross-Validation Models"]
        RegLGBM["LightGBM Regressor<br/>Objective: Huber / L2<br/>Depth: 6, Leaves: 31, LR: 0.03"]
        ClfLGBM["LightGBM Classifier<br/>Objective: Binary Cross-Entropy<br/>Depth: 6, Leaves: 31, LR: 0.03"]
    end

    subgraph Outputs ["Inference Outputs"]
        SvcOut["pred_service_min<br/>(Clipped: [2, 300] min)"]
        LateOut["pred_late_prob<br/>(Calibrated: [0.0001, 0.9999])"]
    end

    OrderMeta & RouteProg & WinMeta & AssetMeta & DockMeta & EnvMeta --> Features
    Features --> RegLGBM --> SvcOut
    Features --> ClfLGBM --> LateOut
```

---

## 3. Task 2B Peak-Day Allocation Solver Architecture

```mermaid
flowchart TD
    subgraph OrderDemands ["85 Customer Orders (Scenario S1)"]
        PrioTier1["Tier 1: Critical Starvation Prevention<br/>(Unserved >= 3 days or deferred yesterday)"]
        PrioTier2["Tier 2: Fresh Perishable Window<br/>(Pre-8:00 AM delivery commitments)"]
        PrioTier3["Tier 3: Specialized Dock Access<br/>(Colombo urban van-only outlets)"]
        PrioTier4["Tier 4: Regular Replenishment<br/>(Ambient bulk replenishment)"]
    end

    subgraph FleetAssets ["28 Operational Vehicles (Peliyagoda)"]
        R_Trucks["3 Reefer Trucks<br/>(VEH003, VEH006, VEH007)"]
        R_Van["1 Reefer Van<br/>(VEH036)"]
        A_Vans["2 Ambient Vans<br/>(VEH037, VEH038)"]
        A_Trucks["22 Ambient Trucks<br/>(VEH008 to VEH034)"]
    end

    subgraph MILPSolver ["Branch-and-Cut Combinatorial Optimizer"]
        BinPacking["Multi-Dimensional Knapsack & Vehicle Routing"]
        HardConst["Hard Constraints Enforcement:<br/>1. Trip District Homogeneity (1 district/trip)<br/>2. Brand Exclusivity (1 brand/trip)<br/>3. Maximum 2 Trips per Vehicle<br/>4. Daily Budget: Fresh <= 270m, Daytime <= 480m<br/>5. Reefer Mandatory for Chilled<br/>6. Van Mandatory for Van-Only"]
    end

    subgraph Validation ["Feasibility Verification"]
        Checker["check_allocation.py<br/>Result: PASSED (0 Errors)"]
        OutputCSV["submission_task2b.csv<br/>(77 Served / 8 Deferred)"]
    end

    OrderDemands --> MILPSolver
    FleetAssets --> MILPSolver
    BinPacking --- HardConst
    MILPSolver --> Checker --> OutputCSV
```
