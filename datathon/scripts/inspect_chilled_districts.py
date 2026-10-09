import pandas as pd
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
t2b_scn = pd.read_csv(os.path.join(data_dir, "Test Data", "task2b_peak_day_scenarios.csv"))

print("=== COLOMBO CHILLED ORDERS ===")
col_chilled = t2b_scn[(t2b_scn['district'] == 'Colombo') & (t2b_scn['temp_requirement'] == 'chilled')]
print(col_chilled[['order_ref', 'outlet_id', 'parking_constraint', 'order_weight_kg', 'order_volume_m3', 'deferred_yesterday', 'days_since_last_served']])
print("Normal colombo chilled total:", col_chilled[col_chilled['parking_constraint'] != 'van_only'][['order_weight_kg', 'order_volume_m3']].sum())

print("\n=== GAMPAHA CHILLED ORDERS ===")
gam_chilled = t2b_scn[(t2b_scn['district'] == 'Gampaha') & (t2b_scn['temp_requirement'] == 'chilled')]
print(gam_chilled[['order_ref', 'outlet_id', 'order_weight_kg', 'order_volume_m3', 'deferred_yesterday', 'days_since_last_served']])

print("\n=== KALUTARA CHILLED ORDERS ===")
kal_chilled = t2b_scn[(t2b_scn['district'] == 'Kalutara') & (t2b_scn['temp_requirement'] == 'chilled')]
print(kal_chilled[['order_ref', 'outlet_id', 'order_weight_kg', 'order_volume_m3', 'deferred_yesterday', 'days_since_last_served']])

print("\n=== GALLE CHILLED ORDERS ===")
gal_chilled = t2b_scn[(t2b_scn['district'] == 'Galle') & (t2b_scn['temp_requirement'] == 'chilled')]
print(gal_chilled[['order_ref', 'outlet_id', 'order_weight_kg', 'order_volume_m3', 'deferred_yesterday', 'days_since_last_served']])

print("\n=== KURUNEGALA CHILLED ORDERS ===")
kur_chilled = t2b_scn[(t2b_scn['district'] == 'Kurunegala') & (t2b_scn['temp_requirement'] == 'chilled')]
print(kur_chilled[['order_ref', 'outlet_id', 'order_weight_kg', 'order_volume_m3', 'deferred_yesterday', 'days_since_last_served']])

print("\n=== MATARA CHILLED ORDERS ===")
mat_chilled = t2b_scn[(t2b_scn['district'] == 'Matara') & (t2b_scn['temp_requirement'] == 'chilled')]
print(mat_chilled[['order_ref', 'outlet_id', 'order_weight_kg', 'order_volume_m3', 'deferred_yesterday', 'days_since_last_served']])

print("\n=== PUTTALAM CHILLED ORDERS ===")
put_chilled = t2b_scn[(t2b_scn['district'] == 'Puttalam') & (t2b_scn['temp_requirement'] == 'chilled')]
print(put_chilled[['order_ref', 'outlet_id', 'order_weight_kg', 'order_volume_m3', 'deferred_yesterday', 'days_since_last_served']])
