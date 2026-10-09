import pandas as pd
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
t2b_scenarios = pd.read_csv(os.path.join(data_dir, "Test Data", "task2b_peak_day_scenarios.csv"))
t2b_fleet = pd.read_csv(os.path.join(data_dir, "Test Data", "task2b_peak_day_fleet.csv"))
veh = pd.read_csv(os.path.join(data_dir, "General Data", "vehicles.csv"))

print("t2b_scenarios columns:", t2b_scenarios.columns.tolist())
fleet_merged = t2b_fleet.merge(veh, on='vehicle_id')
print(fleet_merged.head(10)[['vehicle_id', 'status', 'type', 'temp', 'weight_cap_kg', 'volume_cap_m3', 'depot']])

avail = fleet_merged[fleet_merged['status'] == 'available']
print("\nAvailable vehicles breakdown:")
print(avail.groupby(['depot', 'type', 'temp']).size())
print(avail[['vehicle_id', 'type', 'temp', 'weight_cap_kg', 'volume_cap_m3']])
