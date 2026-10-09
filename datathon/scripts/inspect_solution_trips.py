import pandas as pd
import os

DATA_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
OUTPUT_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\output"

sub = pd.read_csv(os.path.join(OUTPUT_DIR, "submission_task2b.csv"))
scn = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2b_peak_day_scenarios.csv"))
veh = pd.read_csv(os.path.join(DATA_DIR, "General Data", "vehicles.csv")).set_index("vehicle_id")

merged = sub.merge(scn, on=['scenario', 'order_ref', 'outlet_id'])
served = merged[merged['decision'] == 'served']

print("--- SERVED TRIPS SUMMARY ---")
for (vid, tid), g in served.groupby(['vehicle_id', 'trip_id']):
    v = veh.loc[vid]
    print(f"Vehicle {vid} ({v.type}, {v.temp}, cap: {v.weight_cap_kg}kg, {v.volume_cap_m3}m3) - Trip {tid}:")
    print(f"   Brand: {g['brand'].iloc[0]}, District: {g['district'].iloc[0]}, Orders: {len(g)}, Wt: {g['order_weight_kg'].sum():.1f}kg, Vol: {g['order_volume_m3'].sum():.2f}m3")
    print(f"   Order refs: {g['order_ref'].tolist()}")

print(f"\nTotal served orders: {len(served)}")
print(f"Total deferred orders: {len(merged[merged['decision'] == 'deferred'])}")
print("\nDeferred orders:")
print(merged[merged['decision'] == 'deferred'][['order_ref', 'brand', 'district', 'temp_requirement', 'parking_constraint', 'order_weight_kg', 'order_volume_m3', 'deferred_yesterday', 'days_since_last_served']])
