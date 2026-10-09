import pandas as pd
import numpy as np
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"

deliv_train = pd.read_csv(os.path.join(data_dir, "Training Data", "deliveries_train.csv"))
legs_train = pd.read_csv(os.path.join(data_dir, "Training Data", "route_legs_train.csv"))

merged = pd.merge(deliv_train, legs_train, left_on=['route_id', 'seq_in_route'], right_on=['route_id', 'seq'], how='inner', suffixes=('', '_leg'))

def to_mins(time_str):
    parts = time_str.str.split(':', expand=True).astype(int)
    return parts[0] * 60 + parts[1]

arr_min = to_mins(merged['arrival_time'])
leave_min = to_mins(merged['leave_outlet_time'])
win_open_min = to_mins(merged['window_open_time'])
win_close_min = to_mins(merged['window_close_time'])

# Check midnight wrap: does leave_min < arr_min?
wrap_around = leave_min < arr_min
print(f"Number of rows where leave_min < arr_min: {wrap_around.sum()}")

service_start_min = np.maximum(arr_min, win_open_min)
service_time_min = leave_min - service_start_min
# If wrap around exists:
service_time_min_wrapped = np.where(leave_min < service_start_min, leave_min + 1440 - service_start_min, leave_min - service_start_min)

print("Service time summary (straight):")
print(service_time_min.describe())

print("Service time summary (with midnight wrap handling):")
print(pd.Series(service_time_min_wrapped).describe())

print("Negative service times count:", (service_time_min_wrapped < 0).sum())

is_late = (arr_min > win_close_min).astype(int)
print(f"is_late value counts:\n{is_late.value_counts(normalize=True)}")

# Planned travel duration vs actual travel duration:
print("\nTravel duration comparison:")
print("Planned travel duration min describe:\n", merged['planned_travel_duration_min'].describe())
print("Actual travel duration min describe:\n", merged['actual_travel_duration_min'].describe())

# Check planned arrival time vs actual arrival time
planned_arr_min = to_mins(merged['planned_arrival_time'])
arr_diff = arr_min - planned_arr_min
print("arr_min - planned_arr_min describe:\n", arr_diff.describe())
