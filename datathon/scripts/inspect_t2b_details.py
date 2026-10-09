import pandas as pd
import numpy as np
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
t2b_scn = pd.read_csv(os.path.join(data_dir, "Test Data", "task2b_peak_day_scenarios.csv"))
al = pd.read_csv(os.path.join(data_dir, "General Data", "service_allowance.csv"))
dtravel = pd.read_csv(os.path.join(data_dir, "General Data", "district_travel.csv")).set_index("district").to_dict("index")
allowance = {(r.brand, r.dock_type): r.service_allowance_min for r in al.itertuples()}

def calc_trip_time(district, brand, dock_list):
    d = dtravel[district]
    n = len(dock_list)
    if n == 0:
        return 0.0
    return d["depot_to_district_freeflow_min"] + (n - 1) * d["inter_stop_freeflow_min"] + sum(allowance[(brand, dk)] for dk in dock_list)

print("District travel reference from Peliyagoda:")
for dst, d in dtravel.items():
    if d['depot'] == 'Peliyagoda':
        print(f"District: {dst:10s} | depot_to_district: {d['depot_to_district_freeflow_min']} min | inter_stop: {d['inter_stop_freeflow_min']} min")

print("\n--- Details of van_only orders ---")
van_orders = t2b_scn[t2b_scn['parking_constraint'] == 'van_only']
print(van_orders[['order_ref', 'temp_requirement', 'order_weight_kg', 'order_volume_m3', 'dock_type']])
print("Total chilled van_only weight:", van_orders[van_orders['temp_requirement'] == 'chilled']['order_weight_kg'].sum(), "volume:", van_orders[van_orders['temp_requirement'] == 'chilled']['order_volume_m3'].sum())
print("Total ambient van_only weight:", van_orders[van_orders['temp_requirement'] == 'ambient']['order_weight_kg'].sum(), "volume:", van_orders[van_orders['temp_requirement'] == 'ambient']['order_volume_m3'].sum())

print("\n--- Chilled orders by district ---")
for dst, g in t2b_scn[t2b_scn['temp_requirement'] == 'chilled'].groupby('district'):
    tt = calc_trip_time(dst, 'Fresh', list(g['dock_type']))
    print(f"District {dst:10s}: {len(g)} orders, wt={g['order_weight_kg'].sum():.1f} kg, vol={g['order_volume_m3'].sum():.2f} m3, TripTime={tt:.1f} min")

print("\n--- Ambient Fresh orders by district ---")
for dst, g in t2b_scn[(t2b_scn['temp_requirement'] == 'ambient') & (t2b_scn['brand'] == 'Fresh')].groupby('district'):
    tt = calc_trip_time(dst, 'Fresh', list(g['dock_type']))
    print(f"District {dst:10s}: {len(g)} orders, wt={g['order_weight_kg'].sum():.1f} kg, vol={g['order_volume_m3'].sum():.2f} m3, TripTime={tt:.1f} min")

print("\n--- Style & Tech orders by district ---")
for (br, dst), g in t2b_scn[t2b_scn['brand'].isin(['Style', 'Tech'])].groupby(['brand', 'district']):
    tt = calc_trip_time(dst, br, list(g['dock_type']))
    print(f"Brand {br:6s} | District {dst:10s}: {len(g)} orders, wt={g['order_weight_kg'].sum():.1f} kg, vol={g['order_volume_m3'].sum():.2f} m3, TripTime={tt:.1f} min")
