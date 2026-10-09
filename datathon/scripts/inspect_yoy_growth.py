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

for (depot, brand), g in agg.groupby(['depot', 'brand']):
    print(f"\n=== {depot} - {brand} ===")
    v2024 = g[g['iso_year'] == 2024]['total_volume_m3'].mean()
    v2025 = g[g['iso_year'] == 2025]['total_volume_m3'].mean()
    v2026_early = g[(g['iso_year'] == 2026) & (g['iso_week'] <= 13)]['total_volume_m3'].mean()
    v2025_early = g[(g['iso_year'] == 2025) & (g['iso_week'] <= 13)]['total_volume_m3'].mean()
    v2024_early = g[(g['iso_year'] == 2024) & (g['iso_week'] <= 13)]['total_volume_m3'].mean()

    print(f"Annual Means: 2024={v2024:.2f}, 2025={v2025:.2f} (growth: {(v2025/v2024 - 1)*100:+.2f}%)")
    print(f"Weeks 1-13 Means: 2024={v2024_early:.2f}, 2025={v2025_early:.2f}, 2026={v2026_early:.2f}")
    print(f"Early growth 2024->2025: {(v2025_early/v2024_early - 1)*100:+.2f}%, 2025->2026: {(v2026_early/v2025_early - 1)*100:+.2f}%")
