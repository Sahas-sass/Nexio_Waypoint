

## Waypoint Logistics: System Architecture
## & Development Guide
This document outlines the decoupled, microservice-adjacent architecture for the Waypoint
Logistics platform. The system is split across four primary repositories/folders to separate
concerns, allow independent scaling, and enable specialized technologies for different tasks.
- High-Level Tech Stack
● Web Frontend: Next.js 14+ (App Router), Tailwind CSS v4, React
● Mobile Frontend: React Native (Expo)
● Core Engine (Backend): FastAPI (Python)
● Database & Auth (BaaS): Supabase (PostgreSQL, Auth, RLS)
## 2. Repository Structure & Feature Mapping
## 
web-portals/
(Next.js Application)
Purpose: The presentation layer for office, warehouse, and retail staff. Key
## Responsibilities:
● Role-Based Portals: Uses Next.js Route Groups to isolate UI and logic for different
roles:
## ○
## (dispatcher)/
: Command Center, Allocation (Drag & Drop), Tracking,
## Deferrals.
## ○
## (loader)/
: Trip Queues, Dock loading checklists.
## ○
## (store-manager)/
: Store inventory overview, receiving sign-offs.
## ● Routing Security: Next.js Middleware (
middleware.ts
) protects routes by
verifying the user's role against their Supabase session cookie.
● UI Components: Reusable Tailwind v4 components (status pills, KPI cards, sidebar)
stored in
src/components/
## .
## 
mobile-driver/
(Expo / React Native App)
Purpose: The field-operations application installed on driver devices (iOS/Android). Key
## Responsibilities:
● Turn-by-Turn Execution: Displays the assigned route and manifests to the driver.
● Background Telemetry: Continuously sends GPS coordinates back to the system to
power the Dispatcher's live tracking map.
● Proof of Delivery (POD): Utilizes native device APIs for barcode scanning, capturing
photos of damaged goods, and collecting digital signatures on the dock.

## 
api-backend/
(FastAPI Core Engine)
Purpose: The central logic brain and heavy-lifting engine of the platform. Next.js and Expo
both communicate with this unified REST API. Key Responsibilities:
● Route Optimization: Powers features like the "Auto Allocate" button. Runs the
complex mathematical constraints (volumetric weight calculations, delivery time
windows, fleet availability) to generate optimal plans.
● Live Data Streams: Manages WebSocket connections for real-time driver telemetry
(GPS tracking) and pushing immediate operational alerts to the web dashboard.
● Unified Business Logic: Ensures that whether an action is triggered from the
mobile app or the web portal, it goes through the exact same validation and business
rules.
## 
supabase/
(Data & Auth Infrastructure)
Purpose: The foundational storage and security layer. Key Responsibilities:
● Authentication: Manages user accounts, secure passwords, and JWT token
generation for the entire platform.
● PostgreSQL Database: The single source of truth holding tables for
profiles
## ,
orders
## ,
vehicles
## ,
trips
, and
stores
## .
● Row Level Security (RLS): SQL policies applied directly at the database level to
ensure data isolation (e.g., a driver can mathematically only query trips assigned to
their specific UUID; store managers can only see their specific store's inventory).
- Development Workflow (How it all connects)
- The Database (Supabase): The DB schema and RLS policies are the foundation.
Supabase handles the actual data storage and ensures nobody accesses data they
shouldn't.
## 2. The Engine (
api-backend
): The FastAPI backend connects securely to Supabase.
It reads the raw data, runs complex logic or optimization algorithms, and exposes
clean REST/WebSocket endpoints.
## 3. The Clients (
web-portals
## &
mobile-driver
): The Next.js and Expo applications
fetch data from the FastAPI endpoints to render the UI. For simple authentication
(login/logout), they talk directly to Supabase.
Rule of Thumb for Developers:
● Building a UI or Dashboard? -> Go to
web-portals
## .
● Building a mobile screen or camera scanner? -> Go to
mobile-driver
## .
● Writing an algorithm, generating a route, or processing a heavy background task? ->
Go to
api-backend
## .
● Adding a new database table or changing access rules? -> Go to
supabase
