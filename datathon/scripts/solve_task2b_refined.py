import os
import sys
import pandas as pd
import numpy as np
import pulp

DATA_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\data\Tech-Triathlon 2026 - Datasets\data"
OUTPUT_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\output"

def solve_task2b():
    print("--- Loading Task 2B Data ---")
    scn = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2b_peak_day_scenarios.csv"))
    fleet = pd.read_csv(os.path.join(DATA_DIR, "Test Data", "task2b_peak_day_fleet.csv"))
    veh = pd.read_csv(os.path.join(DATA_DIR, "General Data", "vehicles.csv")).set_index("vehicle_id")
    dtravel = pd.read_csv(os.path.join(DATA_DIR, "General Data", "district_travel.csv")).set_index("district").to_dict("index")
    al = pd.read_csv(os.path.join(DATA_DIR, "General Data", "service_allowance.csv"))
    allowance = {(r.brand, r.dock_type): r.service_allowance_min for r in al.itertuples()}

    avail_fleet = fleet[fleet['status'] == 'available']['vehicle_id'].tolist()
    print(f"Available vehicles: {len(avail_fleet)}")

    # Priority function:
    # 1. Base order: 1000
    # 2. Urgent orders deferred yesterday or unserved for multiple days:
    #    Give massive priority so S1-083 (5 days, deferred yest) is guaranteed served!
    def calc_priority(r):
        prio = 1000.0
        # Extreme penalty if days_since_last_served >= 3 or deferred_yesterday == 1
        prio += r['deferred_yesterday'] * 2000.0
        prio += (r['days_since_last_served'] ** 2) * 500.0
        if r['parking_constraint'] == 'van_only':
            prio += 500.0
        if r['brand'] == 'Fresh':
            prio += 300.0
        prio += r['order_volume_m3'] * 2.0
        return prio

    scn['prio_score'] = scn.apply(calc_priority, axis=1)

    brands = sorted(scn['brand'].unique())
    districts = sorted(scn['district'].unique())

    prob = pulp.LpProblem("Task2B_Allocation_Refined", pulp.LpMaximize)

    trips = [1, 2]
    orders = scn.index.tolist()

    x = {}
    B = {}
    D = {}
    u = {}

    for v in avail_fleet:
        v_type = veh.loc[v, 'type']
        v_temp = veh.loc[v, 'temp']
        for t in trips:
            u[v, t] = pulp.LpVariable(f"u_{v}_{t}", cat=pulp.LpBinary)
            for b in brands:
                B[v, t, b] = pulp.LpVariable(f"B_{v}_{t}_{b}", cat=pulp.LpBinary)
            for d in districts:
                D[v, t, d] = pulp.LpVariable(f"D_{v}_{t}_{d}", cat=pulp.LpBinary)

            prob += pulp.lpSum([B[v, t, b] for b in brands]) == u[v, t]
            prob += pulp.lpSum([D[v, t, d] for d in districts]) == u[v, t]

            for i in orders:
                o = scn.loc[i]
                can_carry = True
                if o['temp_requirement'] == 'chilled' and v_temp != 'reefer':
                    can_carry = False
                if o['parking_constraint'] == 'van_only' and v_type != 'van':
                    can_carry = False

                if can_carry:
                    x[i, v, t] = pulp.LpVariable(f"x_{i}_{v}_{t}", cat=pulp.LpBinary)
                    prob += x[i, v, t] <= B[v, t, o['brand']]
                    prob += x[i, v, t] <= D[v, t, o['district']]

    for i in orders:
        prob += pulp.lpSum([x[i, v, t] for v in avail_fleet for t in trips if (i, v, t) in x]) <= 1

    for v in avail_fleet:
        v_wt_cap = veh.loc[v, 'weight_cap_kg']
        v_vol_cap = veh.loc[v, 'volume_cap_m3']
        
        fresh_durations = []
        daytime_durations = []

        for t in trips:
            prob += pulp.lpSum([x[i, v, t] * scn.loc[i, 'order_weight_kg'] for i in orders if (i, v, t) in x]) <= v_wt_cap
            prob += pulp.lpSum([x[i, v, t] * scn.loc[i, 'order_volume_m3'] for i in orders if (i, v, t) in x]) <= v_vol_cap

            trip_orders = [x[i, v, t] for i in orders if (i, v, t) in x]
            prob += pulp.lpSum(trip_orders) >= u[v, t]
            prob += pulp.lpSum(trip_orders) <= 30 * u[v, t]

            dur_expr = pulp.lpSum([
                D[v, t, d] * (dtravel[d]['depot_to_district_freeflow_min'] - dtravel[d]['inter_stop_freeflow_min'])
                for d in districts
            ]) + pulp.lpSum([
                x[i, v, t] * (dtravel[scn.loc[i, 'district']]['inter_stop_freeflow_min'] + allowance[(scn.loc[i, 'brand'], scn.loc[i, 'dock_type'])])
                for i in orders if (i, v, t) in x
            ])

            dur_fresh = pulp.LpVariable(f"dur_fresh_{v}_{t}", lowBound=0, upBound=270)
            dur_daytime = pulp.LpVariable(f"dur_daytime_{v}_{t}", lowBound=0, upBound=480)

            M = 1000
            prob += dur_fresh >= dur_expr - M * (1 - B[v, t, 'Fresh'])
            prob += dur_daytime >= dur_expr - M * B[v, t, 'Fresh']

            fresh_durations.append(dur_fresh)
            daytime_durations.append(dur_daytime)

        prob += pulp.lpSum(fresh_durations) <= 270
        prob += pulp.lpSum(daytime_durations) <= 480

    prob += pulp.lpSum([
        scn.loc[i, 'prio_score'] * x[i, v, t]
        for v in avail_fleet for t in trips for i in orders if (i, v, t) in x
    ])

    print("Solving Refined MILP with CBC solver...")
    solver = pulp.PULP_CBC_CMD(timeLimit=180, msg=True, gapRel=0.01)
    status = prob.solve(solver)
    print(f"Solver Status: {pulp.LpStatus[status]}")

    results = []
    served_count = 0
    deferred_count = 0

    for i in orders:
        row = scn.loc[i]
        assigned = False
        for v in avail_fleet:
            for t in trips:
                if (i, v, t) in x and pulp.value(x[i, v, t]) is not None and pulp.value(x[i, v, t]) > 0.5:
                    results.append({
                        'scenario': row['scenario'],
                        'order_ref': row['order_ref'],
                        'outlet_id': row['outlet_id'],
                        'decision': 'served',
                        'vehicle_id': v,
                        'trip_id': int(t)
                    })
                    assigned = True
                    served_count += 1
                    break
            if assigned:
                break
        
        if not assigned:
            results.append({
                'scenario': row['scenario'],
                'order_ref': row['order_ref'],
                'outlet_id': row['outlet_id'],
                'decision': 'deferred',
                'vehicle_id': np.nan,
                'trip_id': np.nan
            })
            deferred_count += 1

    sub_df = pd.DataFrame(results)
    print(f"\n--- OPTIMIZATION RESULTS ---")
    print(f"Total Orders: {len(sub_df)}")
    print(f"Served Orders: {served_count} ({served_count/len(sub_df)*100:.1f}%)")
    print(f"Deferred Orders: {deferred_count} ({deferred_count/len(sub_df)*100:.1f}%)")

    deferred_orders = scn.loc[[i for i, r in enumerate(results) if r['decision'] == 'deferred']]
    print("\nDeferred Orders breakdown:")
    print(deferred_orders[['order_ref', 'brand', 'district', 'temp_requirement', 'parking_constraint', 'order_weight_kg', 'order_volume_m3', 'deferred_yesterday', 'days_since_last_served']])

    # Save to output/submission_task2b.csv
    out_path = os.path.join(OUTPUT_DIR, "submission_task2b.csv")
    sub_df.to_csv(out_path, index=False)
    print(f"\nSaved Task 2B submission to {out_path}")

    # Check with official script
    checker_path = os.path.join(os.path.dirname(DATA_DIR), "check_allocation.py")
    cmd = f'python "{checker_path}" "{out_path}"'
    print(f"\nRunning checker: {cmd}")
    ret = os.system(cmd)
    if ret == 0:
        print(">>> SUCCESS: Task 2B allocation passed all checks with 0 errors! <<<")
    else:
        print(">>> WARNING: Checker reported errors. Please review. <<<")

if __name__ == "__main__":
    solve_task2b()
