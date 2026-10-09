# Nexio Logistics: Data Preprocessing & Feature Engineering Methodology

**Competition:** Tech-Triathlon 2026 (Rootcode) — Datathon Phase  
**Team:** Nexio  
**Date:** October 9, 2026  

---

## 1. Overview & Data Pipeline Architecture

The objective of the Datathon Phase is to provide predictive intelligence and operational optimization across three core challenges:
1. **Task 1:** Predict Service Time (minutes) and Lateness Probability ($[0, 1]$) for retail delivery routes.
2. **Task 2A:** Depot-level demand forecasting across brands (Fresh, Style, Tech) and temperature classes (Total and Chilled volume $\text{m}^3$) for Weeks 14–23 of 2026.
3. **Task 2B:** Combinatorial fleet allocation under vehicle workshop constraints, physical routing rules, capacity caps, and strict daily time budgets.

---

## 2. Task 1: Label Construction & Feature Engineering

### 2.1 Ground Truth Label Construction
Neither service time nor delivery lateness is provided as an explicit label in the historical logs. Based on the operational logistics specification (Section 4, Page 15), ground truth labels were mathematically derived from the exact physical timestamps in `deliveries_train.csv` joined with `route_legs_train.csv` on `(route_id, seq_in_route) == (route_id, seq)`:

1. **Timestamp Conversion:**
   All clock times ($\text{HH:MM}$) are mapped to integer minutes elapsed from midnight ($00:00 = 0, 23:59 = 1439$):
   $$\text{min}(t) = \text{hours} \times 60 + \text{minutes}$$

2. **Service Start Time:**
   Vehicles arriving at an outlet prior to the scheduled delivery window cannot commence unloading until the delivery bay opens. If a vehicle arrives during or after the window opening, unloading commences immediately upon arrival:
   $$\text{service\_start\_min} = \max(\text{actual\_arrival\_min}, \text{window\_open\_min})$$

3. **Target 1 — Predicted Service Time ($\text{pred\_service\_min}$):**
   Service duration is the total dwell time from unloading commencement to departure:
   $$\text{service\_time\_min} = \text{leave\_outlet\_min} - \text{service\_start\_min}$$
   *Empirical distribution:* Mean $= 19.00\text{ min}$, Standard Deviation $= 14.91\text{ min}$, Minimum $= 2.0\text{ min}$.

4. **Target 2 — Predicted Lateness Probability ($\text{pred\_late\_prob}$):**
   A delivery leg is classified as late if and only if the vehicle arrives strictly after the outlet's delivery window closing time:
   $$\text{is\_late} = \begin{cases} 1 & \text{if } \text{actual\_arrival\_min} > \text{window\_close\_min} \\ 0 & \text{otherwise} \end{cases}$$
   *Empirical distribution:* Class balance is $19.58\%$ late ($n = 17,991$) and $80.42\%$ on-time ($n = 73,903$).

### 2.2 Feature Engineering Pipeline
At test inference time, future observables (such as actual travel durations, actual arrival times, and departure times) are unavailable. A total of 51 predictive features were constructed using exclusively available order, leg, outlet, fleet, calendar, and environmental signals:

- **Temporal & Window Dynamics:**
  - `planned_arr_min`, `planned_dep_min`, `win_open_min`, `win_close_min`.
  - `win_width_min = win_close_min - win_open_min`: Total window flexibility.
  - `planned_slack_min = win_close_min - planned_arr_min`: Critical safety margin against upstream delays.
  - `planned_arr_after_open = planned_arr_min - win_open_min`: Early arrival buffer.
  - `planned_arr_hour`: Hour slot for diurnal congestion matching.

- **Payload Characteristics:**
  - `density_kg_m3 = order_weight_kg / order_volume_m3`: Packing density.
  - `weight_per_unit`, `volume_per_unit`: Item size proxies.
  - `is_chilled`: Temperature requirement indicator ($1$ for chilled, $0$ for ambient).

- **Route Dynamics & Progression:**
  - `seq_in_route`: Stop sequence index.
  - `seq_ratio = seq_in_route / route_total_stops`: Relative progression along route (capturing cumulative delay compounding).
  - `is_first_stop`: Binary indicator for initial leg from depot.
  - `route_total_plan_travel`, `route_total_distance`: Macro route scale.

- **Fleet Utilization & Asset Constraints:**
  - `weight_util = order_weight_kg / weight_cap_kg`.
  - `vol_util = order_volume_m3 / volume_cap_m3`.
  - `vehicle_type` ($\text{van}$ vs $\text{truck}$), `vehicle_temp` ($\text{ambient}$ vs $\text{reefer}$).

- **Infrastructure & Benchmark Allowances:**
  - `dock_type` ($\text{rear\_dock}, \text{street}, \text{front\_bay}$).
  - `parking_constraint` ($\text{normal}, \text{van\_only}, \text{mall\_dock}$).
  - `service_allowance_min`: Official planned handling standard looked up from `service_allowance.csv`.
  - `depot_to_district_freeflow_min`, `inter_stop_freeflow_min`, `free_flow_kmh`.

- **Environmental & Calendar Context:**
  - `disruption_index`: Daily road condition disruption index by district from `road_conditions.csv`.
  - `speed_index`: District hourly traffic speed index under active monsoon status from `traffic_speed.csv`.
  - `is_weekend`, `is_payday`, `festival_ramp`, `is_holiday`, `iso_week`, `monsoon`, `dow`.

- **Out-of-Fold Target Encoding:**
  - Historical average service dwell time per outlet (`outlet_avg_service`).
  - Historical lateness vulnerability rate per outlet (`outlet_late_rate`).

---

## 3. Task 2A: Time-Series Demand Forecasting

### 3.1 Aggregation & Historical Depth
Historical order volume was compiled by merging `deliveries_train.csv` (111 weeks, Jan 2024 to mid-Feb 2026) with `task1_test_inputs.csv` (6 weeks, mid-Feb 2026 to late March 2026) mapped to ISO calendar weeks via `calendar.csv`. This yields 117 contiguous historical weeks (Weeks 1/2024 to 13/2026) across all 6 depot-brand series:
- `Kandy — Fresh`, `Kandy — Style`, `Kandy — Tech`
- `Peliyagoda — Fresh`, `Peliyagoda — Style`, `Peliyagoda — Tech`

### 3.2 Target Specifications & Constraints
- **Target 1:** `pred_total_volume_m3` (Total cubic meters demanded per week).
- **Target 2:** `pred_chilled_volume_m3` (Chilled cubic meters demanded per week).
- **Mandatory Constraint:** Neither `Style` nor `Tech` possesses chilled products. Therefore, $\text{pred\_chilled\_volume\_m3} \equiv 0.0$ for all Style and Tech rows.

### 3.3 Feature Modeling & Forecasting Engine
To capture Sri Lankan retail seasonality (notably Sinhala & Tamil New Year / Avurudu in Week 15/16 and Vesak in Week 18), an ensemble methodology was employed:
1. **Year-over-Year (YoY) Lag Tracking:** 52-week and 104-week historical volume baselines scaled by trend growth (Fresh demonstrates $+5.8\%$ annual growth).
2. **Cyclical Calendar Representations:** Harmonic sine and cosine weekly encodings:
   $$\sin\left(\frac{2\pi \cdot \text{week}}{52}\right), \quad \cos\left(\frac{2\pi \cdot \text{week}}{52}\right)$$
3. **Festival Surge Encodings:** `avg_festival_ramp`, `n_holidays`, `is_new_year`, `is_vesak`, `is_poson`.
4. **Stable Temperature Splitting:** For Fresh, chilled demand follows a highly stable empirical ratio of total volume ($36.35\% \pm 0.92\%$ for Kandy, $36.83\% \pm 0.88\%$ for Peliyagoda).

---

## 4. Task 2B: Combinatorial Optimization Formulation

The peak-day allocation problem is formulated as a 0-1 Mixed-Integer Linear Program (MILP):
$$\max \sum_{i=1}^{N} \sum_{v=1}^{V} \sum_{t=1}^{2} \text{Priority}_i \cdot x_{i, v, t}$$
Subject to:
1. **Single Assignment:** $\sum_{v} \sum_{t} x_{i, v, t} \le 1 \quad \forall i$.
2. **Operational Fleet:** $v \in \text{Available Vehicles}$ (excluding 10 workshop vehicles).
3. **Trip Exclusivity:** At most one brand and one district per trip slot $(v, t)$.
4. **Physical Compatibility:**
   - $x_{i, v, t} = 0$ if $\text{is\_chilled}_i = 1$ and $\text{temp}_v \ne \text{reefer}$.
   - $x_{i, v, t} = 0$ if $\text{is\_van\_only}_i = 1$ and $\text{type}_v \ne \text{van}$.
5. **Vehicle Capacity:**
   $$\sum_{i} x_{i, v, t} \cdot \text{weight}_i \le \text{weight\_cap}_v, \quad \sum_{i} x_{i, v, t} \cdot \text{volume}_i \le \text{volume\_cap}_v$$
6. **Trip Duration Budgeting:**
   $$\text{Duration}_{v, t} = d_{\text{depot\_to\_dist}} + (n - 1) \cdot d_{\text{inter\_stop}} + \sum_{i} \text{allowance}_i$$
   $$\sum_{t=1}^{2} \text{Duration}_{v, t}^{\text{Fresh}} \le 270\text{ min}, \quad \sum_{t=1}^{2} \text{Duration}_{v, t}^{\text{Style/Tech}} \le 480\text{ min}$$
