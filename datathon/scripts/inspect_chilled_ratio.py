import pandas as pd
import numpy as np
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
deliv_train = pd.read_csv(os.path.join(data_dir, "Training Data", "deliveries_train.csv"))
deliv_test = pd.read_csv(os.path.join(data_dir, "Test Data", "task1_test_inputs.csv"))
cal = pd.read_csv(os.path.join(data_dir, "General Data", "calendar.csv"))

all_deliv = pd.concat([deliv_train, deliv_test], ignore_index=True)
all_deliv = all_deliv.merge(cal[['date', 'iso_year', 'iso_week']], left_on='order_date', right_on='date', how='left')

agg = all_deliv.groupby(['depot', 'brand', 'iso_year', 'iso_week']).agg(
    total_volume_m3=('order_volume_m3', 'sum'),
    chilled_volume_m3=('order_volume_m3', lambda s: all_deliv.loc[s.index[all_deliv.loc[s.index, 'temp_requirement'] == 'chilled'], 'order_volume_m3'].sum())
).reset_index()

fresh = agg[agg['brand'] == 'Fresh'].copy()
fresh['chilled_ratio'] = fresh['chilled_volume_m3'] / fresh['total_volume_m3']

for depot, g in fresh.groupby('depot'):
    print(f"\nFresh at {depot}:")
    print(f"Chilled ratio mean: {g['chilled_ratio'].mean():.4f}, std: {g['chilled_ratio'].std():.4f}, min: {g['chilled_ratio'].min():.4f}, max: {g['chilled_ratio'].max():.4f}")
