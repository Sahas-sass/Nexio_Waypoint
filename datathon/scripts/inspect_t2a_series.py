import pandas as pd
import numpy as np
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"

deliv_train = pd.read_csv(os.path.join(data_dir, "Training Data", "deliveries_train.csv"))
deliv_test = pd.read_csv(os.path.join(data_dir, "Test Data", "task1_test_inputs.csv"))
cal = pd.read_csv(os.path.join(data_dir, "General Data", "calendar.csv"))

# Combine deliveries
all_deliv = pd.concat([deliv_train, deliv_test], ignore_index=True)
print(f"Total historical orders: {len(all_deliv)}")

# Merge with calendar to get iso_year and iso_week
all_deliv = all_deliv.merge(cal[['date', 'iso_year', 'iso_week']], left_on='order_date', right_on='date', how='left')

# Group by depot, brand, iso_year, iso_week
agg = all_deliv.groupby(['depot', 'brand', 'iso_year', 'iso_week']).agg(
    total_volume_m3=('order_volume_m3', 'sum'),
    chilled_volume_m3=('order_volume_m3', lambda s: all_deliv.loc[s.index[all_deliv.loc[s.index, 'temp_requirement'] == 'chilled'], 'order_volume_m3'].sum()),
    order_count=('delivery_id', 'count')
).reset_index()

# Sort by depot, brand, iso_year, iso_week
agg = agg.sort_values(['depot', 'brand', 'iso_year', 'iso_week']).reset_index(drop=True)
print("Aggregated time series shape:", agg.shape)
print("Distinct series (depot, brand):", agg[['depot', 'brand']].drop_duplicates())

for (depot, brand), g in agg.groupby(['depot', 'brand']):
    print(f"\nSeries: {depot} | {brand}")
    print(f"Number of historical weeks: {len(g)}")
    print(f"Total volume m3 range: min={g['total_volume_m3'].min():.2f}, mean={g['total_volume_m3'].mean():.2f}, max={g['total_volume_m3'].max():.2f}")
    print(f"Chilled volume m3 range: min={g['chilled_volume_m3'].min():.2f}, mean={g['chilled_volume_m3'].mean():.2f}, max={g['chilled_volume_m3'].max():.2f}")
    print(f"Last 5 weeks (2026 weeks 9-13):\n", g.tail(5)[['iso_year', 'iso_week', 'total_volume_m3', 'chilled_volume_m3']])
