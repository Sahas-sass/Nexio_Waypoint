import pandas as pd
import os

data_dir = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
gen_dir = os.path.join(data_dir, "General Data")

for fname in os.listdir(gen_dir):
    fpath = os.path.join(gen_dir, fname)
    if fname.endswith(".csv"):
        df = pd.read_csv(fpath)
        print(f"=== {fname} ({df.shape[0]} rows, {df.shape[1]} cols) ===")
        print(df.columns.tolist())
        print(df.head(2))
        print()
