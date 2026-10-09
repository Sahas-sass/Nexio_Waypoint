import pandas as pd
import numpy as np
import os

DATA_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
scn = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2b_peak_day_scenarios.csv"))
dtravel = pd.read_csv(os.path.join(DATA_DIR, "General Data", "district_travel.csv")).set_index("district").to_dict("index")
al = pd.read_csv(os.path.join(DATA_DIR, "General Data", "service_allowance.csv"))
allowance = {(r.brand, r.dock_type): r.service_allowance_min for r in al.itertuples()}

def calc_trip_time(district, brand, dock_list):
    d = dtravel[district]
    n = len(dock_list)
    if n == 0:
        return 0.0
    return d["depot_to_district_freeflow_min"] + (n - 1) * d["inter_stop_freeflow_min"] + sum(allowance[(brand, dk)] for dk in dock_list)

print("Checking chilled orders by district and dock type:")
chilled = scn[scn['temp_requirement'] == 'chilled']
for dst, g in chilled.groupby('district'):
    print(f"\nDistrict {dst} ({len(g)} orders):")
    for _, r in g.iterrows():
        print(f"  {r['order_ref']} | outlet: {r['outlet_id']} | park: {r['parking_constraint']} | dock: {r['dock_type']} | wt: {r['order_weight_kg']} | vol: {r['order_volume_m3']} | def_yest: {r['deferred_yesterday']} | days: {r['days_since_last_served']}")
