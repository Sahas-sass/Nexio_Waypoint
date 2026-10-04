# Data model

All tables live in the Supabase `public` schema and have row level security enabled.
Schema changes are versioned in [`migrations/`](../migrations); demo data in [`seeds/`](../seeds).

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : "id"
  STORES ||--o{ PROFILES : "store_id (store managers)"
  STORE_MANAGERS ||--o{ STORES : "manager_id"
  STORES ||--o{ ORDERS : "store_id"
  VEHICLES ||--o{ TRIPS : "vehicle_id"
  PROFILES ||--o{ TRIPS : "driver_id / loader_id"
  TRIPS ||--o{ TRIP_STOPS : "trip_id"
  ORDERS ||--o{ TRIP_STOPS : "order_id"
  STORES ||--o{ TRIP_STOPS : "store_id"
  TRIP_STOPS ||--o| PROOF_OF_DELIVERY : "stop_id"
  ORDERS ||--o| STORE_RECEIPTS : "order_id"
  TRIPS ||--o{ PALLETS : "trip_id"
  TRIP_STOPS ||--o{ PALLETS : "stop_id"
  TRIPS ||--o{ LOADING_LOGS : "trip_id"
  ORDERS ||--o{ EXCEPTIONS : "order_id"
  ORDERS ||--o{ DEFERRAL_LOGS : "order_id"
  TRIPS ||--o{ ROUTE_EXCEPTIONS : "trip_id"

  PROFILES {
    uuid id PK
    user_role role "dispatcher | loader | driver | store_manager"
    text full_name
    uuid store_id FK
    text employee_id
    text phone
  }
  STORES {
    uuid id PK
    text name
    text brand
    text address
    text access_conditions
    time delivery_window_start
    time delivery_window_end
    float latitude
    float longitude
    bool is_van_only
  }
  VEHICLES {
    uuid id PK
    text registration_number
    text vehicle_type
    numeric max_weight_kg
    numeric max_volume_m3
    bool is_refrigerated
  }
  ORDERS {
    uuid id PK
    text order_number
    uuid store_id FK
    temp_type temp_requirement "ambient | chilled"
    numeric total_weight_kg
    numeric total_volume_m3
    int item_count
    order_status status "pending | planning | assigned | deferred | delivered"
    date target_delivery_date
    text priority
    text deferral_reason
  }
  TRIPS {
    uuid id PK
    text trip_number
    uuid vehicle_id FK
    uuid driver_id FK
    date trip_date
    trip_status status "planning | loading | en_route | completed"
    numeric current_lat
    numeric current_lng
  }
  TRIP_STOPS {
    uuid id PK
    uuid trip_id FK
    uuid order_id FK
    uuid store_id FK
    int stop_sequence
    timestamptz estimated_arrival
    text status "PENDING | IN_PROGRESS | COMPLETED | FAILED"
  }
  PROOF_OF_DELIVERY {
    uuid id PK
    uuid stop_id FK "unique"
    text outcome "delivered | partial | failed"
    int items_expected
    int items_delivered
    text photo_url "storage path"
    text signature_url "storage path"
    bool captured_offline
  }
  STORE_RECEIPTS {
    uuid id PK
    uuid order_id FK "unique"
    text status "received | partial | rejected"
    int items_received
    text issue_type
  }
```

## Workflow functions (RPC)

| Function | Caller | What it does |
|---|---|---|
| `place_order(...)` | Store manager | Creates an order for the caller's store. Enforces the 16:00 next-day cutoff and positive quantities. |
| `driver_start_stop(stop_id)` | Driver | Marks a stop on the caller's own trip as in progress. |
| `submit_proof_of_delivery(...)` | Driver | Records the POD (idempotent per stop), completes the stop, marks the order delivered and closes the trip when no stops remain. |
| `driver_update_location(trip_id, lat, lng)` | Driver | Stores the latest position for live tracking. |
| `confirm_order_receipt(...)` | Store manager | Confirms what arrived. A partial or rejected receipt raises an exception for dispatch. |

## Offline storage on the driver's phone

The Expo app keeps an SQLite copy of the driver's current trip and a `sync_queue` table.
Each queued record (stop started, proof of delivery, location) is replayed against the RPCs above when the device is online again.
