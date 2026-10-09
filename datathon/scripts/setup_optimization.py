import os
import pandas as pd
import numpy as np
import pulp

DATA_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
OUTPUT_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\output"

# Load datasets
scn = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2b_peak_day_scenarios.csv"))
fleet = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2b_peak_day_fleet.csv"))
veh = pd.read_csv(os.path.join(DATA_DIR, "General Data", "vehicles.csv")).set_index("vehicle_id")
dtravel = pd.read_csv(os.path.join(DATA_DIR, "General Data", "district_travel.csv")).set_index("district").to_dict("index")
al = pd.read_csv(os.path.join(DATA_DIR, "General Data", "service_allowance.csv"))
allowance = {(r.brand, r.dock_type): r.service_allowance_min for r in al.itertuples()}

avail_fleet = fleet[fleet['status'] == 'available'].copy()
avail_veh = veh.loc[avail_fleet['vehicle_id']].copy()

print(f"Total available vehicles: {len(avail_veh)}")
print("Available vehicles breakdown:\n", avail_veh.groupby(['type', 'temp']).size())

# Calculate priority weight for each order
# S1-083: deferred yesterday, 5 days since last served!
# Orders deferred yesterday or days_since_last_served > 1 get high priority
def get_order_priority(row):
    prio = 10.0
    if row['deferred_yesterday'] == 1:
        prio += 50.0
    prio += row['days_since_last_served'] * 15.0
    # Pre-8am window close gets urgency
    if row['brand'] == 'Fresh':
        prio += 20.0
    # Penalty for deferral
    return prio

scn['priority'] = scn.apply(get_order_priority, axis=1)
print(f"Top 10 priority orders:\n", scn.sort_values('priority', ascending=False)[['order_ref', 'brand', 'district', 'temp_requirement', 'deferred_yesterday', 'days_since_last_served', 'priority']].head(10))
