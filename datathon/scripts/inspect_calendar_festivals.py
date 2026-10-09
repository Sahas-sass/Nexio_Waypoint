import pandas as pd
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
cal = pd.read_csv(os.path.join(data_dir, "General Data", "calendar.csv"))

cal_week = cal.groupby(['iso_year', 'iso_week']).agg(
    n_days=('date', 'count'),
    n_holidays=('is_holiday', 'sum'),
    festival_count=('festival', lambda s: (s.notna() & (s != '') & (s != 'none')).sum()),
    festivals=('festival', lambda s: ', '.join([x for x in s.dropna().unique() if x not in ['', 'none']])),
    avg_festival_ramp=('festival_ramp', 'mean'),
    avg_monsoon=('monsoon', 'mean')
).reset_index()

print("Weeks 13 to 24 for 2024, 2025, 2026:")
for yr in [2024, 2025, 2026]:
    sub = cal_week[(cal_week['iso_year'] == yr) & (cal_week['iso_week'].between(13, 24))]
    print(f"\n--- Year {yr} ---")
    print(sub[['iso_week', 'n_holidays', 'festivals', 'avg_festival_ramp']])
