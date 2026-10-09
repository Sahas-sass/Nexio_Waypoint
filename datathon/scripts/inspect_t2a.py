import pandas as pd
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"

deliv_train = pd.read_csv(os.path.join(data_dir, "Training Data", "deliveries_train.csv"))
deliv_test = pd.read_csv(os.path.join(data_dir, "Test Data", "task1_test_inputs.csv"))
cal = pd.read_csv(os.path.join(data_dir, "General Data", "calendar.csv"))

print(f"deliv_train min date: {deliv_train['order_date'].min()}, max date: {deliv_train['order_date'].max()}")
print(f"deliv_test min date: {deliv_test['order_date'].min()}, max date: {deliv_test['order_date'].max()}")

# Merge order_date with calendar to get iso_year and iso_week
train_with_cal = deliv_train.merge(cal[['date', 'iso_year', 'iso_week']], left_on='order_date', right_on='date')
test_with_cal = deliv_test.merge(cal[['date', 'iso_year', 'iso_week']], left_on='order_date', right_on='date')

print("Train ISO years & weeks range:")
print(f"Train iso_year min: {train_with_cal['iso_year'].min()}, max: {train_with_cal['iso_year'].max()}")
print("Train weeks for 2026:")
print(sorted(train_with_cal[train_with_cal['iso_year'] == 2026]['iso_week'].unique()))

print("Test weeks for 2026 (Task 1 test set):")
print(sorted(test_with_cal[test_with_cal['iso_year'] == 2026]['iso_week'].unique()))

# What about task 2a test inputs?
t2a_test = pd.read_csv(os.path.join(data_dir, "Test Data", "task2a_test_inputs.csv"))
print("Task 2A test inputs weeks for 2026:")
print(sorted(t2a_test['iso_week'].unique()))
print("Task 2A shape:", t2a_test.shape)
