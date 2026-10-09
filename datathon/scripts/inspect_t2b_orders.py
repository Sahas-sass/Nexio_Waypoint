import pandas as pd
import numpy as np
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
t2b_scn = pd.read_csv(os.path.join(data_dir, "Test Data", "task2b_peak_day_scenarios.csv"))
al = pd.read_csv(os.path.join(data_dir, "General Data", "service_allowance.csv"))
dtravel = pd.read_csv(os.path.join(data_dir, "General Data", "district_travel.csv")).set_index("district").to_dict("index")
allowance = {(r.brand, r.dock_type): r.service_allowance_min for r in al.itertuples()}

print(f"Total orders: {len(t2b_scn)}")
print("\nGrouped by brand and district:")
grp = t2b_scn.groupby(['brand', 'district']).agg(
    n_orders=('order_ref', 'count'),
    chilled_count=('temp_requirement', lambda s: (s == 'chilled').sum()),
    ambient_count=('temp_requirement', lambda s: (s == 'ambient').sum()),
    van_only_count=('parking_constraint', lambda s: (s == 'van_only').sum()),
    mall_dock_count=('parking_constraint', lambda s: (s == 'mall_dock').sum()),
    tot_weight=('order_weight_kg', 'sum'),
    tot_vol=('order_volume_m3', 'sum')
).reset_index()
print(grp.to_string())

print("\nOrders that are BOTH chilled and van_only:")
chilled_van = t2b_scn[(t2b_scn['temp_requirement'] == 'chilled') & (t2b_scn['parking_constraint'] == 'van_only')]
print(chilled_van[['order_ref', 'brand', 'district', 'outlet_id', 'order_weight_kg', 'order_volume_m3', 'temp_requirement', 'parking_constraint']])

print("\nOrders that are van_only (all):")
van_only = t2b_scn[t2b_scn['parking_constraint'] == 'van_only']
print(van_only[['order_ref', 'brand', 'district', 'outlet_id', 'order_weight_kg', 'order_volume_m3', 'temp_requirement', 'parking_constraint']])

print("\nDeferred yesterday or days since last served:")
prio = t2b_scn[(t2b_scn['deferred_yesterday'] > 0) | (t2b_scn['days_since_last_served'] > 1)]
print(f"High-priority orders count: {len(prio)}")
print(prio[['order_ref', 'brand', 'district', 'temp_requirement', 'deferred_yesterday', 'days_since_last_served']])
