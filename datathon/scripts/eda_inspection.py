import pandas as pd
import numpy as np
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"

deliv_train = pd.read_csv(os.path.join(data_dir, "Training Data", "deliveries_train.csv"))
legs_train = pd.read_csv(os.path.join(data_dir, "Training Data", "route_legs_train.csv"))

print(f"deliv_train shape: {deliv_train.shape}")
print(f"legs_train shape: {legs_train.shape}")
print("deliv_train dispatch_status counts:\n", deliv_train['dispatch_status'].value_counts())

# Test join on training data
# Deliveries has route_id, seq_in_route
# Route legs has route_id, seq
merged_train = pd.merge(deliv_train, legs_train, left_on=['route_id', 'seq_in_route'], right_on=['route_id', 'seq'], how='inner')
print(f"merged_train shape: {merged_train.shape}")

# Check unmerged deliveries
unmerged = deliv_train[~deliv_train.set_index(['route_id', 'seq_in_route']).index.isin(legs_train.set_index(['route_id', 'seq']).index)]
print(f"Unmerged deliveries count: {len(unmerged)}")
print("Unmerged dispatch_status:\n", unmerged['dispatch_status'].value_counts())

# Check duplicate keys in deliv_train:
dups_deliv = deliv_train.duplicated(subset=['route_id', 'seq_in_route'], keep=False)
print(f"Duplicated (route_id, seq_in_route) in deliv_train: {dups_deliv.sum()}")

# Check duplicate keys in legs_train:
dups_legs = legs_train.duplicated(subset=['route_id', 'seq'], keep=False)
print(f"Duplicated (route_id, seq) in legs_train: {dups_legs.sum()}")

# Inspect a few sample rows of duplicates if any
if dups_deliv.sum() > 0:
    print(deliv_train[dups_deliv].head(6)[['delivery_id', 'route_id', 'seq_in_route', 'outlet_id', 'temp_requirement', 'dispatch_status']])

# Let's inspect test sets as well
deliv_test = pd.read_csv(os.path.join(data_dir, "Test Data", "task1_test_inputs.csv"))
legs_test = pd.read_csv(os.path.join(data_dir, "Test Data", "route_legs_test.csv"))
print(f"\ntask1_test_inputs shape: {deliv_test.shape}")
print(f"route_legs_test shape: {legs_test.shape}")
merged_test = pd.merge(deliv_test, legs_test, left_on=['route_id', 'seq_in_route'], right_on=['route_id', 'seq'], how='inner')
print(f"merged_test shape: {merged_test.shape}")
dups_deliv_test = deliv_test.duplicated(subset=['route_id', 'seq_in_route'], keep=False)
print(f"Duplicated (route_id, seq_in_route) in test: {dups_deliv_test.sum()}")
