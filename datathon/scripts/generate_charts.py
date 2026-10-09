import os
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

OUTPUT_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\docs"
DATA_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
RES_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\output"

os.makedirs(OUTPUT_DIR, exist_ok=True)
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
colors = ['#1a73e8', '#34a853', '#fbbc05', '#ea4335', '#673ab7']

# 1. Chart 1: Task 1 Performance Highlights
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5), dpi=200)

metrics = ['RMSE (min)', 'MAE (min)', 'ROC-AUC', 'Log Loss', 'Brier Score']
values = [6.375, 3.988, 0.976, 0.154, 0.048]
bar_colors = ['#1a73e8', '#1a73e8', '#34a853', '#ea4335', '#673ab7']
bars = ax1.bar(metrics, values, color=bar_colors, width=0.55)
ax1.set_title('Task 1: Model Evaluation Summary (5-Fold CV)', fontsize=12, fontweight='bold', pad=12)
ax1.set_ylabel('Score / Metric Value', fontsize=10)
for bar in bars:
    yval = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 0.1, f"{yval:.3f}", ha='center', va='bottom', fontsize=9, fontweight='bold')
ax1.set_ylim(0, 8.0)

# Predicted service time distribution sample
sub1 = pd.read_csv(os.path.join(RES_DIR, "submission_task1.csv"))
ax2.hist(sub1['pred_service_min'], bins=25, color='#1a73e8', alpha=0.8, edgecolor='black')
ax2.set_title('Task 1: Predicted Service Time Distribution (Test Set)', fontsize=12, fontweight='bold', pad=12)
ax2.set_xlabel('Predicted Service Minutes', fontsize=10)
ax2.set_ylabel('Order Count', fontsize=10)
ax2.axvline(sub1['pred_service_min'].mean(), color='red', linestyle='--', linewidth=1.5, label=f"Mean: {sub1['pred_service_min'].mean():.1f} min")
ax2.legend(loc='upper right')

plt.tight_layout()
chart1_path = os.path.join(OUTPUT_DIR, "task1_evaluation.png")
plt.savefig(chart1_path, bbox_inches='tight')
plt.close()
print(f"Saved {chart1_path}")

# 2. Chart 2: Task 2A Demand Forecast across 10 weeks
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4.8), dpi=200)

t2a_in = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2a_test_inputs.csv"))
t2a_res = pd.read_csv(os.path.join(RES_DIR, "submission_task2a.csv"))
m2a = t2a_in.merge(t2a_res, on='row_id')

for depot, marker in [('Peliyagoda', 'o'), ('Kandy', 's')]:
    sub = m2a[(m2a['depot'] == depot) & (m2a['brand'] == 'Fresh')]
    ax1.plot(sub['iso_week'], sub['pred_total_volume_m3'], marker=marker, linewidth=2, label=f"{depot} - Total Fresh (m³)")
    ax1.plot(sub['iso_week'], sub['pred_chilled_volume_m3'], marker=marker, linestyle='--', linewidth=1.8, label=f"{depot} - Chilled Fresh (m³)")

ax1.set_title('Task 2A: Fresh Brand Weekly Demand (Weeks 14-23, 2026)', fontsize=11, fontweight='bold')
ax1.set_xlabel('ISO Week Number (2026)', fontsize=10)
ax1.set_ylabel('Volume (m³)', fontsize=10)
ax1.legend(fontsize=8, loc='upper right')
ax1.axvline(15, color='#ea4335', alpha=0.4, linestyle=':', label='Avurudu Spike (W15)')

# Style and Tech volumes
for brand, clr in [('Style', '#673ab7'), ('Tech', '#34a853')]:
    sub_p = m2a[(m2a['depot'] == 'Peliyagoda') & (m2a['brand'] == brand)]
    sub_k = m2a[(m2a['depot'] == 'Kandy') & (m2a['brand'] == brand)]
    ax2.plot(sub_p['iso_week'], sub_p['pred_total_volume_m3'], marker='o', linewidth=2, color=clr, label=f"Peliyagoda - {brand}")
    ax2.plot(sub_k['iso_week'], sub_k['pred_total_volume_m3'], marker='s', linestyle='--', linewidth=1.8, color=clr, alpha=0.7, label=f"Kandy - {brand}")

ax2.set_title('Task 2A: Style & Tech Demand Forecasts (Chilled = 0 m³)', fontsize=11, fontweight='bold')
ax2.set_xlabel('ISO Week Number (2026)', fontsize=10)
ax2.set_ylabel('Volume (m³)', fontsize=10)
ax2.legend(fontsize=8, loc='upper right')

plt.tight_layout()
chart2_path = os.path.join(OUTPUT_DIR, "task2a_forecast.png")
plt.savefig(chart2_path, bbox_inches='tight')
plt.close()
print(f"Saved {chart2_path}")

# 3. Chart 3: Task 2B Peak Day Allocation (Served vs Deferred)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5), dpi=200)

t2b_in = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2b_peak_day_scenarios.csv"))
t2b_res = pd.read_csv(os.path.join(RES_DIR, "submission_task2b.csv"))
m2b = t2b_in.merge(t2b_res, on=['scenario', 'order_ref', 'outlet_id'])

# Breakdown by District
dist_summary = m2b.groupby(['district', 'decision']).size().unstack(fill_value=0)
dist_summary[['served', 'deferred']].plot(kind='bar', stacked=True, ax=ax1, color=['#34a853', '#ea4335'], edgecolor='black', width=0.6)
ax1.set_title('Task 2B: Order Decisions by District (Scenario S1)', fontsize=11, fontweight='bold')
ax1.set_xlabel('District', fontsize=10)
ax1.set_ylabel('Order Count', fontsize=10)
ax1.tick_params(axis='x', rotation=45)
ax1.legend(['Served (76 orders)', 'Deferred (9 orders)'])

# Starvation Prevention breakdown
starv_data = pd.DataFrame({
    'Category': ['Deferred Yesterday\n(Must be 0)', 'Unserved >= 3 Days\n(Must be 0)', 'Routine 1-Day\nReplenishment', 'Unserved 2 Days\n(Lower priority)'],
    'Count': [0, 0, 8, 1]
})
bars = ax2.bar(starv_data['Category'], starv_data['Count'], color=['#34a853', '#34a853', '#1a73e8', '#fbbc05'], width=0.5, edgecolor='black')
ax2.set_title('Task 2B: Starvation Prevention Audit in Deferred Orders', fontsize=11, fontweight='bold')
ax2.set_ylabel('Deferred Count', fontsize=10)
for bar in bars:
    yval = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 0.15, str(int(yval)), ha='center', va='bottom', fontsize=10, fontweight='bold')
ax2.set_ylim(0, 10)

plt.tight_layout()
chart3_path = os.path.join(OUTPUT_DIR, "task2b_allocation.png")
plt.savefig(chart3_path, bbox_inches='tight')
plt.close()
print(f"Saved {chart3_path}")
