import pandas as pd
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
t2b_scenarios = pd.read_csv(os.path.join(data_dir, "Test Data", "task2b_peak_day_scenarios.csv"))
t2b_fleet = pd.read_csv(os.path.join(data_dir, "Test Data", "task2b_peak_day_fleet.csv"))

print(f"Scenarios shape: {t2b_scenarios.shape}")
print(t2b_scenarios.head(5))
print("Scenarios unique:", t2b_scenarios['scenario'].unique())
print("Brands in scenarios:", t2b_scenarios['brand'].value_counts())
print("Districts in scenarios:", t2b_scenarios['district'].value_counts())
print("Temp req in scenarios:", t2b_scenarios['temp_requirement'].value_counts())
print("Parking constraint in scenarios:", t2b_scenarios['parking_constraint'].value_counts())

print(f"\nFleet shape: {t2b_fleet.shape}")
print(t2b_fleet.head(5))
print("Fleet status counts:\n", t2b_fleet['status'].value_counts())
print("Fleet vehicle types & temps for available:\n", t2b_fleet[t2b_fleet['status'] == 'available'].groupby(['type', 'temp']).size())
