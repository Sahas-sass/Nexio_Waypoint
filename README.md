# Waypoint – Delivery Planning System

Waypoint connects **ordering → planning → loading → delivery → receipt** for Waypoint Group's
Fresh, Style and Tech brands across four roles: Store Manager, Dispatcher, Loader and Driver.

- **Web portals** (`web-portals/`, Next.js): Dispatcher, Loader and Store Manager
- **Driver app** (`mobile-driver/`, Expo): offline-first proof of delivery
- **Telemetry service** (`api-backend/`, Node + Socket.io): live driver tracking
- **Supabase**: PostgreSQL with row level security, Auth and Storage

See [`docs/architecture.md`](docs/architecture.md), [`docs/data-model.md`](docs/data-model.md) and
[`docs/ai-disclosure.md`](docs/ai-disclosure.md).

## Deployed system

| | |
|---|---|
| Web portals | _TBD – add the deployed URL_ |
| Driver app | _TBD – web build URL or Expo link_ |

## Seeded accounts

All demo accounts use the password set in `DEMO_PASSWORD` when the seed was run
(the judging deployment's password is given on the submission form).

| Role | Email | Starts at |
|---|---|---|
| Dispatcher | `dispatch@waypoint.com` | `/command-center` |
| Loader | `load@waypoint.com` | `/trip-queue` |
| Driver | `driver@waypoint.com` | Driver app – TRIP 1042, 4 stops |
| Store Manager | `store@waypoint.com` | `/overview` – Fresh Store #22 |

Extra drivers for the other trips: `driver2@`, `driver3@`, `driver4@waypoint.com`.

## Judge walkthrough

The seed creates a delivery day relative to the date you run it, so this works on a fresh install.

1. **Store Manager – place an order.** Sign in as `store@waypoint.com` → **Orders** → **Place order**.
   Pick tomorrow (before 16:00) and enter temperature, weight, volume and item count.
   A date that is past the 16:00 cutoff is rejected.
2. **Dispatcher – review the queue.** Sign in as `dispatch@waypoint.com` → **Command Center** to see incoming volume and fleet capacity.
3. **Dispatcher – allocate.** **Allocation** assigns orders to vehicles while respecting weight, volume, chilled-only vehicles, van-only outlets and delivery windows.
   Orders that do not fit are flagged for deferral.
4. **Dispatcher – defer.** **Deferrals**: choose orders to move to the next run with a reason. The store manager sees the deferral under **Alerts**.
5. **Loader – load the trip.** Sign in as `load@waypoint.com` → **Trip Queue** → TRIP 1042. Scan or check pallets in reverse stop order.
   Flag a missing or damaged pallet, then seal and dispatch the vehicle.
6. **Driver – run the route.** Open the driver app and sign in as `driver@waypoint.com`.
   The itinerary shows TRIP 1042 with its stops, windows and access conditions.
7. **Driver – deliver offline.** Open stop 2 (Fresh Store #22) → **Start delivery** → turn on airplane mode.
   Capture the photo and signature, then complete the proof of delivery. The offline banner shows the pending sync queue.
8. **Driver – reconnect.** Turn connectivity back on. The queue syncs: the stop is completed and the dispatcher's tracking map updates.
9. **Store Manager – confirm receipt.** As `store@waypoint.com` → **Receiving**: the delivered order shows the driver's proof of delivery.
   Confirm the items received. Report a shortage to raise an exception for dispatch.
   (ORD-2999, delivered yesterday, is also waiting for confirmation.)
10. **Store Manager – history.** **History** lists confirmed receipts and reported issues.

## Running locally

### Prerequisites
- Node.js 22+, npm
- A Supabase project (URL, anon key, service role key, database password)

### 1. Configure
```bash
cp .env.example .env                       # root: used by scripts and docker compose
cp .env.example web-portals/.env.local     # NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
cp .env.example api-backend/.env           # SUPABASE_URL / SUPABASE_SERVICE_KEY / PORT
cp .env.example mobile-driver/.env         # EXPO_PUBLIC_SUPABASE_URL / ANON_KEY
```

### 2. Database: migrations, demo accounts, demo day
```bash
npm install
npm run migrate                                  # applies migrations/*.sql
DEMO_PASSWORD='choose-one' node scripts/seed-auth.js
node scripts/run-seed.js seeds/006_demo_day.sql
```

### 3. Run
```bash
docker compose up        # db setup + api-backend :5000 + web-portals :3000
# or individually:
cd api-backend && npm install && node server.js
cd web-portals && npm install && npm run dev
cd mobile-driver && npm install && npx expo start   # scan with Expo Go, or press w for web
```

## Tests

```bash
cd web-portals && npm test          # Vitest unit tests
cd mobile-driver && npm test        # Jest (jest-expo) unit tests
cd api-backend && npm test          # telemetry service tests
npm run test:db                     # RLS + RPC integration tests (rolled back)
```

## Departures from the Designathon submission

- **Order entry** captures weight, volume, item count, temperature and priority rather than a per-brand product catalogue. The shared datasets have no product list, and the planning engine only needs these quantities.
- **Driver login** uses Supabase email and password instead of an SMS one-time code, so every request carries a verifiable session.
- **The driver app is an Expo app** and also runs in the browser (`npx expo start --web`) for phone-sized judging.

## Known limitations

- The shared CSV datasets (`outlets.csv`, `vehicles.csv`, `calendar.csv`) are not imported yet. The seed uses a representative subset of outlets and vehicles in Colombo.
