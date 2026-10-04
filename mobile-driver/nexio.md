# WAYPOINT
INTELLIGENT DELIVERY PLANNING SYSTEM
TECH-TRIATHLON 2026 — DESIGNATHON
TEAM NEXIO
STORE MANAGER
DISPATCHER
THE PROBLEM
One fleet. Three brands. Fragmented operations.
Waypoint Group operates 120 outlets across three
brands through a shared fleet of 60 vehicles. Each
brand has different delivery requirements, while
dispatchers must work within vehicle capacity,
temperature, outlet access, delivery windows and fuel
constraints.
When demand exceeds available capacity, dispatchers
must decide which orders to defer and explain the
consequences
Current workflow,
Phone / Message
Spreadsheet
Phone Calls
LOADER
DRIVER
STORE MANAGER
LIMITED SHARED VISIBILITY
Printed Run Sheet
Handwritten Records
WHAT IS BREAKING?
01 — Fragmented Planning
Orders arrive through phone
calls or messages and are
entered again into
spreadsheets. Planning
depends heavily on one
dispatcher's knowledge.
03- Unclear Deferral
Decisions
When capacity is insufficient,
deferral decisions are made
under pressure without a
clear record, creating a risk
of repeatedly skipping the
same outlet.
02 — Limited Delivery
Visibility
Once vehicles leave the
depot, dispatchers have no
shared view of progress and
often learn about problems
only after the driver reaches
the outlet.
04 — Weak Operational
Feedback
Printed run sheets and verbal
instructions provide no
reliable way to capture proof
of delivery or identify loading
shortfalls before departure.
05 — Unpredictable
Capacity & Delays
Waypoint needs better
visibility into future demand,
refrigerated capacity, service
time and lateness, while
drivers also face unreliable
connectivity in the field
Waypoint needs better visibility into future demand,
refrigerated capacity, service time and lateness,
while drivers also face unreliable connectivity in the
field
OUR RESPONSE
ORDER
PLAN
ALLOCATE
DELIVER
RECEIVE
PLAN AHEAD
We designed one connected system around the real
working conditions of four users—giving each role the
information and actions they need while keeping
operational decisions connected across the workflow.
USER PERSONAS
Four roles. Four working environments. One
connected delivery system.
The Waypoint delivery workflow is shared across four
operational roles. Each user works in a different
environment, with different responsibilities, constraints,
and information needs. Our design gives each role a
focused interface while keeping their actions connected
across the entire delivery journey.
The Planner
```
Environment: Peliyagoda planning office
```
```
Device: Large desktop screen
```
```
Connectivity: Stable
```
Primary responsibility
Close orders after the 4 PM cutoff
Plan daily deliveries
Allocate orders to available vehicles
Manage capacity shortfalls and deferrals
Monitor delivery progress and exceptions
01 — DISPATCHER
Key challenges
Balancing weight and volume capacity
Matching chilled orders with reefer vehicles
Respecting outlet access and delivery windows
Working within weekly fuel quotas
Explaining why orders were deferred
Tracking problems after vehicles leave the depot
Design need
A clear command center for planning, allocation,
exceptions, and capacity decisions.
The Dock Operator
```
Environment: Peliyagoda / Kandy depot dock
```
```
Device: Shared tablet / terminal
```
```
Connectivity: On-site
```
Primary responsibility
View assigned trips
Follow the required loading sequence
Check items before departure
Identify missing or damaged goods
Confirm loading completion
02 — LOADER
Key challenges
Printed lists can become outdated
Loading mistakes need to be identified before
departure
Multiple trips and stops need clear sequencing
Problems must be communicated back to the
dispatcher
Design need
A simple, task-focused loading interface that makes
discrepancies visible before the vehicle leaves.
The Delivery Operator
```
Environment: On the road
```
```
Device: Personal mobile phone
```
```
Connectivity: Unreliable / may drop
```
Primary responsibility
Follow the daily route
Navigate through assigned stops
Record delivery outcomes
Capture proof of delivery
Report issues and sync information
03 — DRIVER
Key challenges
Working while travelling between outlets
Interacting with the system only when safely
stopped
Poor or intermittent connectivity
Keeping delivery information available offline
Ensuring completed deliveries reach the system
Design need
A mobile-first delivery workflow that remains usable
when connectivity is unavailable.
The Receiving Point
```
Environment: Outlet counter
```
```
Device: Desktop / mobile
```
```
Connectivity: Normal outlet connection
```
Primary responsibility
Place orders before the cutoff
View delivery information
Receive goods
Confirm receipt
Handle delivery exceptions
04 — STORE MANAGER
Key challenges
Orders previously handled through phone
calls/messages
Different brands have different ordering
requirements
Need visibility of ETA and delivery status
Need clear communication when an order is
deferred
Need reliable receipt confirmation
Design need
A straightforward ordering and receiving experience
with clear delivery status and exception
communication.
SYSTEM OVERVIEW
ONE CONNECTED DELIVERY SYSTEM
Waypoint connects ordering, planning, allocation,
loading, delivery, and receipt into one continuous
workflow. Each role gets a focused interface suited to its
working environment, while information moves between
roles throughout the delivery lifecycle
STORE MANAGER
DRIVER
DISPATCHER
LOADER
STORE MANAGER
ORDER & RECEIVE
DELIVER & RECORD
PLAN & ALLOCATE
LOAD & VERIFY
CONFIRM RECEIPT
Create and confirm orders
View delivery status
Receive goods
Confirm receipt
Handle delivery exceptions
Follow itinerary
View stop instructions
Record delivery outcome
Capture PoD
Work offline when required
Sync completed activity
Close orders after cutoff
Review demand
Allocate orders to vehicles
Check operational
constraints
Manage deferrals
Monitor active deliveries
View assigned trip
Follow loading sequence
Check goods
Report discrepancies
Finalize loading
Verify delivered goods
Confirm receipt
Report issues
END-TO-END FLOW
FROM ORDER TO RECEIPT
Every delivery begins with an outlet order and moves
through planning, allocation, loading, delivery, and
receipt confirmation. Waypoint keeps each handoff
connected so that information captured at one stage
becomes useful at the next.
Store Manager
What happens
The Store Manager creates an order before the daily
order cutoff.
System receives
Outlet
Brand
Requested items
Delivery requirements
Output → Confirmed order queue
01 — PLACE ORDER
Dispatcher
What happens
After the 4 PM cutoff, the Dispatcher reviews the
confirmed order queue and begins daily planning.
System provides
Total demand
Orders requiring allocation
Delivery requirements
Output → Planning queue
Dispatcher
What happens
Orders are matched with available vehicles while
considering operational constraints.
Constraints
Weight · Volume · Temperature · Delivery windows ·
Outlet access · Fuel quota
When demand exceeds capacity, orders can be
deferred with a recorded reason.
Output → Published delivery plan
02 — CLOSE ORDERS
03 — PLAN & ALLOCATE
Loader
What happens
The Loader receives the assigned trip and follows the
planned loading sequence.
Checks
Correct goods
Correct sequence
Missing items
Damaged items
Output → Load confirmed / discrepancy reported
Driver
What happens
The Driver follows the assigned itinerary and records the
outcome at each stop.
Actions
View stop details
Complete delivery
Capture PoD
Report delivery issues
If connectivity drops
Offline → Save locally → Continue → Sync when
connected
Output → Delivery record
04 — LOAD
05 — DELIVER
Store Manager
What happens
The Store Manager verifies the received goods and
confirms the delivery.
Actions
Review delivered items
Confirm receipt
Report issues
Output → Completed delivery record
Dispatcher
What happens
Completed delivery information becomes part of the
operational picture used to understand future demand
and capacity.
System can surface
Delivery outcomes
Capacity patterns
Service issues
Future planning information
Output → Better-informed future planning
06 — CONFIRM RECEIPT
07 — PLAN FUTURE CAPACITY
```
Dispatcher: Screen Flow &
```
Rationales
Screen Flow Logic
The user journey begins at the Login interface, which
authenticates and routes the user based on their
specific role. For the Dispatcher, successful
authentication opens the Command Center to assess
the overall fleet capacity against the day's total order
volume. They then transition into the Allocation &
Planning workspace to map specific orders to vehicles.
If total demand exceeds the fleet's physical or temporal
limits, they are forced into the Deferral Manager to
postpone lower-priority deliveries. Finally, once vehicles
are dispatched, their primary interface becomes Live
Tracking to monitor execution and field exceptions.
Login & Role Routing: Screen Rationale
The Login screen acts as the secure gateway and
primary routing engine for the entire Waypoint system,
instantly adapting the interface based on the
authenticated user's operational role. Because the
platform serves four distinct user environments—
ranging from the Dispatcher's multi-monitor desktop to
the Driver's mobile view—this screen must seamlessly
direct the required seeded credentials to their
respective specialized workflows. By centralizing
authentication, the system ensures strict data
```
governance; a Store Manager only sees their specific
```
brand's order history, while the Dispatcher instantly
gains global network visibility, reducing friction and
unauthorized access during shift handovers.
Command Center: Screen Rationale
The Command Center serves as the Dispatcher’s
central nervous system, prioritizing immediate
situational awareness by aggregating total incoming
order volume and available fleet capacity into high-
level metrics. Rather than forcing the user to parse raw
data, this dashboard visualizes critical thresholds—such
as remaining refrigerated capacity and available dry-
box volume—allowing the dispatcher to instantly gauge
whether the day's load requires standard routing or
aggressive deferral management. This screen reduces
cognitive load at the start of a shift by surfacing urgent
system alerts, such as grounded vehicles or driver
shortages, before the dispatcher begins detailed route
mapping.
Allocation & Planning: Screen Rationale
This screen transforms a complex, multi-variable puzzle
into a visual drag-and-drop workspace where the
system actively enforces Waypoint's strict operating
constraints. By displaying unassigned orders alongside
specific vehicle cards with dual progress bars for weight
and volume, the dispatcher can maximize vehicle
utilization without exceeding physical limits. The
interface inherently prevents critical errors by locking
chilled goods out of ambient vehicles and visually
flagging time-sensitive orders, ensuring Waypoint Fresh
supermarkets receive their goods before the mandatory
8 AM cutoff.
Deferral Manager: Screen Rationale
When order demand outstrips fleet capacity, the
Deferral Manager provides a structured, objective
environment for the dispatcher to make difficult
prioritization decisions without relying on fragmented
spreadsheets or guesswork. This interface isolates the
unallocated orders and forces the dispatcher to attach
a specific reason code to every deferral, creating a clear
audit trail that eliminates the historical problem of
unrecorded decisions. By automating a notification to
the Store Manager the moment a deferral is confirmed,
this screen directly resolves Waypoint's communication
bottlenecks and protects the relationship between the
central depot and the retail outlets.
Live Tracking: Screen Rationale
Once the fleet departs, the Live Tracking screen shifts
the dispatcher from a planner to an active monitor,
providing a real-time geographic and chronological
view of the entire distribution network. By tracking
vehicle progress against predicted service times, the
system proactively highlights delays before they result
in missed delivery windows, allowing the dispatcher to
intercept issues rather than discovering them post-
failure. The interface is specifically designed to handle
field degradation gracefully, clearly flagging when a
driver drops offline and estimating their location based
on their last known ping, ensuring the dispatcher retains
control even when mobile coverage is compromised.
```
Loader: Screen Flow & Rationales
```
Screen Flow Logic
The Loader authenticates via the Login screen on a
shared warehouse tablet or terminal. They immediately
view pending vehicle departures in the Trip Queue,
prioritizing tasks by dock door and scheduled time.
Selecting a specific trip opens the Load Sequence,
which dictates a strict reverse-stop loading order to
ensure the driver's route is physically viable. If items are
missing or damaged during packing, the Loader flags
them using the Discrepancy Form before finalizing the
manifest, which automatically updates the Dispatcher
and Driver.
```
Login (Shared Terminal): Screen Rationale
```
The Loader Login screen prioritizes speed and secure
session management for a fast-paced, shared-device
warehouse environment. Because multiple loaders may
use the same tablet or terminal throughout a shift, the
interface requires rapid authentication—such as a quick
PIN entry or employee badge scan—rather than
complex passwords. This immediately routes the
specific worker to the active dock schedule, minimizing
downtime while ensuring that every loaded item and
reported discrepancy is tied to a verifiable digital audit
trail.
Trip Queue: Screen Rationale
The Trip Queue serves as the
Loader’s immediate action
board, organizing pending
vehicle departures by dock
door and scheduled dispatch
time to eliminate loading dock
bottlenecks. By replacing
chaotic verbal instructions and
scattered paperwork with a
clear, digital hierarchy, the
loader knows exactly which
vehicle requires immediate
attention. The interface
prominently highlights critical
time constraints—such as the
mandatory 8 AM Waypoint
Fresh store deliveries—ensuring
the warehouse floor prioritizes
runs that are most vulnerable
to strict delivery window
violations.
Load Sequence: Screen Rationale
This screen directly addresses
the operational necessity of
reverse-stop loading, guiding
the loader to pack the vehicle
so that the final delivery on the
route is loaded first, keeping
the first delivery nearest to the
doors. By providing a digitized,
interactive checklist, it
eliminates the inefficiencies
and communication gaps
associated with traditional
printed run sheets. The
interface logically groups
items and highlights specific
handling requirements,
ensuring the physical load
matches the dispatcher's
allocation while making the
driver's subsequent unloading
process at the store level fast
and error-free.
Discrepancy Form: Screen Rationale
The Discrepancy Form is a
critical feedback mechanism
designed to catch inventory
shortfalls, missing items, or
damaged goods before a
vehicle leaves the depot. By
providing a fast, modal-based
input to flag these issues, the
system resolves the historical
problem where dispatchers
only learn about a loading
failure after the driver reaches
the retail outlet. This
immediate digital record
automatically alerts the
Dispatcher and adjusts the
Driver's expected itinerary,
ensuring all downstream roles
are operating with accurate,
real-time inventory data.
```
Driver: Screen Flow & Rationales
```
Screen Flow Logic
The Driver begins their shift by authenticating on their
personal mobile device to access their chronologically
ordered Daily Itinerary. They navigate to their Active
Stop, reviewing specific access constraints and delivery
windows before unloading. Upon completion, they
capture a digital signature and photo via the Proof of
```
Delivery (PoD) screen. If mobile coverage drops, the
```
application seamlessly transitions into a dedicated
Offline Mode, locally caching PoD data and
automatically reconciling records with the central
dispatcher once the connection is restored.
```
Login: Screen Rationale
```
Designed for a driver's personal mobile device, the login
screen prioritizes fast, secure access via a specific Driver
ID and a quick 4-digit PIN. This low-friction authentication
is essential for a field environment where drivers may
need to rapidly unlock the app while sitting in a truck cab
or wearing gloves, ensuring strict data governance
without slowing down their morning departure.
Daily Itinerary: Screen Rationale
This screen translates the
dispatcher's complex
allocation into a clear, linear
task list for the driver on the
road. By prominently
displaying strict delivery
```
windows (e.g., "Before 8:00
```
```
AM" for Fresh stores)
```
alongside temperature tags
```
(e.g., "Chilled" vs. "Ambient"),
```
the interface keeps the
driver focused on their
immediate time and
handling constraints. The
top-level route progress bar
provides immediate visual
feedback on their shift's
progression.
Active Stop Detail: Screen Rationale
When approaching a retail
outlet, a driver needs hyper-
contextual logistical
information, not just a map
pin. This screen explicitly
surfaces crucial physical
access conditions—such as
"Rear Dock" entries, "Van
Access Only" height
restrictions, and reserved
loading bay times—before
the driver physically arrives.
By aggregating navigation,
store manager contact
details, and the physical
```
delivery summary (item
```
count, total weight, and
```
volume) into large,
```
tappable mobile cards, the
UI minimizes the time
wasted searching for
correct loading zones.
```
Proof of Delivery (PoD): Screen Rationale
```
The PoD interface digitizes
the final handover,
completely eliminating the
risk of lost, illegible, or
damaged paper run sheets.
It enforces a structured
completion workflow
requiring physical item
verification, a digital Store
Manager signature on the
glass, and a photographic
capture of the delivered
goods. This irrefutable data
capture instantly updates
the central database when
online, protecting the driver
from subsequent inventory
disputes and giving the
dispatcher real-time
confirmation of success
```
Proof of Delivery (PoD): Screen RationaleOffline Mode & Sync (Degradation Screen) : Screen
```
Rationale
Because Waypoint's drivers
frequently operate in areas
with intermittent mobile
coverage, this critical
degradation screen
ensures field operations
never halt due to a
dropped signal. The UI
prominently reassures the
driver with an amber
"You're Offline" banner and
clearly lists the queue of
```
pending data syncs (e.g.,
```
saved signatures and
```
photos) to prove their work
```
is securely cached locally.
Once the signal returns,
the automated
"Connection Restored"
sequence pushes the
cached data to the central
dispatcher in the
background, ensuring zero
data loss without requiring
manual intervention from
the driver.
```
Offline Mode & Sync (Degradation Screen) : Screen
```
Rationale
Store Manager: Screen Flow &
Rationales
Screen Flow Logic
The Store Manager logs in via the desktop portal to
access their localized Store Overview, which highlights
the immediate next delivery and the daily order cutoff
countdown. Throughout the day, they monitor the
Receiving tab to track the live timeline of incoming
vehicles and prepare their dock staff. If the Dispatcher
makes routing changes, the Alerts & Exceptions tab
provides immediate, actionable notifications regarding
deferred orders. Finally, the History tab serves as an
audit trail for past deliveries, overall on-time metrics,
and reported issues.
```
Login: Screen Rationale
```
The Login screen acts as a strict secure partition,
ensuring the store manager only accesses data
```
relevant to their specific retail outlet (e.g., Fresh Store
```
```
#22) rather than the entire Waypoint network. By
```
providing a clean, standard email and password
authentication alongside a visual reminder of the
connected logistics network, the interface immediately
sets a professional, enterprise-grade tone while
protecting sensitive brand-specific inventory data.
Store Overview: Screen Rationale
This primary dashboard serves as the manager’s daily
command center, instantly answering the two most
critical operational questions: "When is the next truck
arriving?" and "How long until I must submit tomorrow's
order?". By prominently featuring a live tracker for the
```
immediate next delivery (e.g., TRK-024) alongside a
```
progress bar counting down to the strict daily order
cutoff, the UI minimizes administrative anxiety and
allows the manager to focus on retail floor operations
while maintaining a 100% "Store readiness" checklist.
```
Receiving: Screen Rationale
```
To efficiently manage a retail loading dock, a manager
must know exactly when to pull staff off the floor. The
Receiving interface translates the dispatcher's network
data into a localized, chronological timeline of expected
```
arrivals (e.g., distinguishing between a Heavy Freight
```
```
Truck and a Delivery Van). By providing live ETAs and a
```
```
specific "Prepare for arrival" checklist (such as ensuring
```
```
chilled storage is ready), this screen prevents dock
```
bottlenecks and ensures temperature-sensitive goods
are unloaded immediately upon arrival.
Alerts & Exceptions: Screen Rationale
This interface directly resolves Waypoint’s historical
failure to clearly communicate capacity-driven
deferrals to the retail level. When an order is pushed to a
later run, this screen immediately surfaces a priority
update breaking down exactly "What happened," "Why
```
did it happen," and "What happens next" (e.g., setting a
```
```
new expected time for the next day). This structured
```
transparency replaces frustration with actionable
intelligence, allowing the store manager to adjust their
local sales strategy or source emergency stock without
making blind phone calls to the depot.
```
History: Screen Rationale
```
The Order & Delivery History screen shifts the focus from
live operations to long-term performance tracking and
auditing. By aggregating metrics like total items
```
received, on-time delivery percentages (e.g., 94%), and
```
a searchable ledger of every past order's status
```
(Planning, Deferred, or Received), the manager is
```
empowered to review fulfillment accuracy over time.
This digital record completely eliminates the reliance on
lost or damaged paper receipts, ensuring any reported
issues are permanently logged and easily exported for
central management review.
Degradation Scenario:
Intermittent Field Connectivity
Scenario Name
```
Why This Matters to the Business (Business
```
```
Rationale)
```
Driver Offline Mode & Automated Data Reconciliation
Waypoint Group’s delivery routes frequently pass
through areas with unreliable mobile coverage, such as
remote hill country roads or deep underground mall
loading bays. A core business problem identified in the
brief is that field connectivity is unreliable, and the
system must support continuous work without a
connection while reconciling records later. If the mobile
application forced drivers to stop working when they
lost signal, it would create massive delivery delays and
force a fallback to unrecorded paper notes. By
designing a robust Offline Mode, Waypoint ensures
continuous physical operations, protects irrefutable
```
Proof of Delivery (PoD) data, and prevents costly
```
downstream inventory disputes.
How the System Gracefully Degrades and Recovers
Immediate Detection & Reassurance: The moment
the device loses connection, the UI shifts to an
amber "Offline Mode" state. Crucially, it displays a
"Pending Sync" queue. This visual feedback reassures
the driver that their delivery data is safely cached on
the device, preventing panic and duplicate data
entry.
Unhindered Field Operations: The driver can
seamlessly continue their workflow—viewing stop
details, unloading goods, and capturing the Store
Manager's digital signature and delivery photos. The
application temporarily stores these heavy data
payloads locally.
Zero-Friction Reconciliation: When the driver drives
back into a coverage zone, they do not need to
manually hit a "sync" button. The system
automatically detects the connection, background-
syncs the local cache with the central Dispatcher
database, and displays a green "All records
synchronized" success state. This fulfills the strict
requirement to seamlessly reconcile records when
connectivity returns.
Design Decisions
Overarching Philosophy: From Fragmented to
Connected
1. Exception-First Information Architecture
2. Visualizing Physical Constraints
Waypoint’s current state relies on disconnected
spreadsheets, phone calls, and handwritten notes,
leading to blind spots across the supply chain. Team
Nexio’s primary design objective was to build a single
source of truth where an action taken by one role
instantly updates the operational reality for everyone
else.
Instead of forcing users to hunt for problems, the UI
pushes exceptions to the surface. Dispatchers are
```
immediately alerted to capacity shortfalls; Loaders are
```
```
prompted to flag discrepancies before departure; and
```
Store Managers receive dedicated "Exception Alerts" the
moment a deferral occurs. By designing for the edge
cases—such as missed delivery windows or missing
items—the system normalizes breakdown recovery.
A core business constraint is that every vehicle has both
weight and volume limits, and only specific trucks can
carry chilled goods. To prevent planning errors, the
Dispatcher's Allocation Board translates these abstract
numbers into dual progress bars and clear temperature
badges. The UI inherently prevents a dispatcher from
assigning a chilled load to an ambient vehicle or
overfilling a truck beyond its cubic capacity.
3. Hardware-Specific Ergonomics
4. The Reverse-Stop Loading Logic
The interface adapts strictly to the physical environment
of each role:
```
Dispatcher (Desktop): Data-dense, multi-panel
```
layouts optimized for complex allocation and dual-
monitor tracking.
```
Loader (Tablet): High-contrast, large touch targets
```
designed for shared terminal use on a loud, fast-
paced warehouse dock.
```
Driver (Mobile): High-legibility, one-handed
```
navigation with an aggressive offline-first
architecture to survive cellular dead zones.
```
Store Manager (Desktop/Mobile): A B2B e-
```
commerce layout that prioritizes bulk ordering limits,
4 PM cutoff countdowns, and quick receipt
confirmation.
To optimize field efficiency, the Loader's screen does not
```
just list items; it structures the physical packing process.
```
By enforcing a reverse-stop sequence, the system
ensures the last delivery is loaded first. This design
decision prevents the driver from having to dig through
an improperly packed truck at their first stop, directly
reducing service time and the probability of running
late.
Core Tradeoff: Automated
Constraints vs. Human Decision-
Making
The Challenge
The Tradeoff
Waypoint’s daily logistics involve complex, intersecting
```
variables: vehicle weight limits, cubic volume,
```
```
temperature requirements (chilled vs. ambient), and
```
```
strict delivery windows (e.g., Waypoint Fresh before 8
```
```
AM). A major design question was how much of this
```
routing and allocation process should be completely
automated by the system versus controlled manually
by the Dispatcher.
We could have designed a "black box" automated
allocation engine that instantly schedules the fleet and
automatically defers lower-priority orders when
demand exceeds capacity. This would maximize
mathematical efficiency and eliminate dispatcher
planning time. However, fully automating deferrals strips
the Dispatcher of their contextual business knowledge—
they might know that a specific Waypoint Style store is
launching a seasonal peak promotion and cannot
afford a delay, even if the algorithm deems it "low
priority".
Our Resolution
We chose to build a human-in-the-loop hybrid model.
The system strictly automates physical constraints—the
UI physically prevents a dispatcher from assigning
chilled goods to a dry-box truck or overloading a vehicle
past its weight/volume progress bars. However, when
demand outstrips capacity, the system stops and forces
manual human intervention via the Deferral Manager.
The Dispatcher must personally select which orders to
defer and attach a specific reason code
This tradeoff slightly increases the Dispatcher's daily
screen time, but it guarantees human accountability for
sensitive business decisions and ensures Store
Managers receive an accurate, human-verified
explanation when their deliveries are delayed.
Style Guide: The Waypoint Design
System
Design Philosophy
Color Palette
To ensure a cohesive user experience across four
radically different working environments—from a multi-
monitor dispatch office to a driver's mobile phone in a
cellular dead zone—Team Nexio established a unified,
component-driven design system. This visual language
prioritizes high legibility, strict contrast for varying
lighting conditions, and functional color semantics to
instantly communicate logistical constraints
The palette balances the Waypoint brand identity with
strict functional indicators, ensuring users can parse
complex data at a glance.
```
Primary Yellow (#FFC83D): Brand identity
```
```
and primary interactive elements (Main
```
```
CTAs, Active States).
```
```
Warning Orange (#F59E0B): Critical
```
```
system states requiring attention (Offline
```
Mode banners, Order Deferrals, Capacity
```
Warnings).
```
```
Background (#FAFAF7) & White (#FFFFFF):
```
Low-strain, high-contrast base layers that
keep complex data tables and routing
timelines clean and readable.
```
Primary Text (#202124) & Secondary Text
```
```
(#6B7280): Optimized for maximum
```
legibility in harsh warehouse lighting or
under direct sunlight in a truck cab.
```
Success Green (#22C55E): Positive
```
```
validation (On-Time Deliveries,
```
```
Synchronized Data, Verified Signatures).
```
```
Chilled Blue (#8DD8F7): A strict semantic
```
indicator applied exclusively to orders and
vehicles requiring refrigerated conditions,
preventing constraint violations.
```
Typography: Manrope
```
Core Component Library
We selected Manrope as the universal typeface for its
modern geometric structure and excellent readability in
data-heavy enterprise applications.
Display / H1: Used for critical, time-sensitive metrics
```
(e.g., Dashboard KPIs, Cutoff Countdowns).
```
```
H2: Section headers defining distinct workspace
```
```
panels (e.g., Allocation Board, Trip Queue).
```
```
Body: Highly legible base font for order details,
```
addresses, and rationale text.
```
Caption: Small, dense metadata (e.g.,
```
```
weight/volume limits, timestamp logs).
```
```
Button: Bold, capitalized tracking for clear action
```
execution.
By standardizing these UI elements, the system scales
seamlessly from desktop to mobile screens.
```
Action Elements (Buttons & Inputs): Large touch
```
```
targets for the Driver and Loader; compact,
```
keyboard-friendly inputs for the Dispatcher.
```
Data Display (Tables & Cards): Standardized
```
containers for list items.
```
Logistics-Specific (Vehicle Cards & KPI Cards):
```
Specialized widgets featuring dual-progress bars
```
(weight/volume) and high-level capacity
```
summaries.
```
Feedback & Wayfinding (Status Badges, Alerts,
```
```
Navigation): Visual tags (e.g., "Ambient", "Chilled", "On
```
```
Time") and exception-first alert banners.
```
```
Overlays (Modal / Bottom Sheet): Used for focused,
```
temporary tasks that should not disrupt the main
workflow, such as the Loader's Discrepancy Form or
the Driver's Signature capture.
AI Disclosure
Commitment to Transparency
AI-Assisted Workflow
In accordance with the Tech-Triathlon competition
rules, Team Nexio utilized Artificial Intelligence tools to
accelerate our design workflow and refine our
presentation, while ensuring the core system
architecture remained strictly human-directed.
Ideation & Prompt Generation: We used Large
```
Language Models (LLMs) to help brainstorm initial
```
layout structures and generate precise prompts for
UI inspiration.
Copywriting & Formatting: LLMs were utilized to draft,
edit, and condense the one-paragraph screen
rationales, personas, and structural documentation
```
(such as the Design Decisions and Core Tradeoff
```
```
sections) to ensure clarity and conciseness within
```
the submission constraints.
Asset & Conceptual Mockups: AI image generators
were referenced early in the process to explore color
palette applications and layout hierarchy before we
built the final components.
```
Human-Directed Execution (Non-AI)
```
System Architecture & Logic: The fundamental
interconnected workflow—including the reverse-stop
loading sequence, the handling of the offline
degradation state, and the hybrid
manual/automated deferral logic—was
conceptualized and mapped entirely by the team.
Constraint Mapping: The translation of Waypoint's
```
specific business rules (e.g., vehicle weight/volume
```
```
limits and strict delivery windows) into the UI via dual
```
progress bars and temperature tags was a manual
design decision.
Final UI/UX Build: All final high-fidelity prototypes,
interactions, component scaling, and application of
the unified style guide were meticulously crafted by
human hands in Figma to ensure enterprise-grade
consistency across all four user roles.
Prototype
Dispatcher
Loader
Driver
Store Manager
```
https://www.figma.com/make/g5NRTzBU8365rYrmQQr4
```
92/Dispatcher--Desktop--Prototype?
```
fullscreen=1&t=mc80EisirmHbmEtZ-1&code-node-id=0-
```
6
```
https://www.figma.com/make/6oh9nae21vhh9WMnQg
```
MWE3/Loader--Tablet-Terminal----Prototype?
```
fullscreen=1&t=UEw6z90tkimc7DnO-1&code-node-id=0-
```
6
```
https://www.figma.com/make/ByVOvL9JIYRKSOoCFmpZ
```
So/Driver--Mobile-Phone----Prototype?
```
fullscreen=1&t=vOCpBtJC9VCOKqmH-1&code-node-
```
```
id=0-6
```
```
https://www.figma.com/make/qm8PpGqarPfogsvi5MlD
```
o4/Store-Manager--Desktop----Prototype?
```
fullscreen=1&t=yBI4VEAcI3gaUU90-1&code-node-id=0-
```
6
Figma design
YouTube Link
```
https://www.figma.com/design/wPJiK3ffxgL9vVEvyu0Z6
```
6/Tech-Thrithon--Rootcode-?node-id=0-
1&t=hK9HYGKPbARn0Nzu-1
```
https://youtu.be/zzwOHUfLmys
```