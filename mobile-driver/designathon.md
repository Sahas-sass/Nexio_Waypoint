Dispatcher (Desktop)
Primary Environment: Planning office with large screens and stable connectivity.
## Core Pages:
● Command Dashboard: A high-level overview showing total incoming volume,
available fleet capacity, and real-time alerts for active routes.
● Allocation & Planning Board: A workspace displaying unassigned orders alongside
available vehicles, automatically highlighting constraint violations (weight, volume,
temperature, and time windows).
● Deferral Manager (Degradation Screen Candidate): A dedicated interface
triggered when demand exceeds capacity. It lists orders by priority and requires the
dispatcher to select orders for deferral and attach a reason code.
● Live Tracking & Exceptions: A map and timeline view tracking departed vehicles,
surfacing driver delays or connectivity drops.
## User Flow:
- Review the confirmed order queue after the 4 PM cutoff.
- Run the allocation engine to assign orders to specific vehicles and trips based on
capacity and operating constraints.
- Manage capacity shortfalls by selecting lower-priority orders in the Deferral Manager,
generating automated notices to Store Managers.
- Publish the finalized plans to the Warehouse Loaders.
- Monitor active routes, receiving live updates from drivers and intervening when
delays threaten strict delivery windows (e.g., 8 AM Fresh store openings).
Loader (Tablet/Terminal)
Primary Environment: Warehouse dock, using shared devices, prioritizing speed and
accuracy.
## Core Pages:

● Trip Queue: A simplified list of pending vehicle departures organized by dock door
and departure time.
● Load Sequence View: An itemized list for a specific trip, ordered in reverse-stop
sequence (last delivery loaded first) to support efficient unloading at the outlets.
● Discrepancy Form: A quick-input modal to flag missing, short-shipped, or damaged
items before a vehicle departs.
## User Flow:
- Select the next assigned vehicle/trip from the Queue.
- Follow the Load Sequence View to pick and stage items, checking them off digitally
rather than using printed run sheets.
- Identify any missing items and use the Discrepancy Form to log the shortfall.
- Finalize the load, locking the digital manifest and automatically triggering a
notification to the Driver and Dispatcher that the vehicle is ready for departure.
Driver (Mobile Phone)
Primary Environment: On the road, using a personal phone, safely stopped, with frequent
mobile coverage drops.
## Core Pages:
● Daily Itinerary: A clear sequence of stops, highlighting expected arrival times, outlet
access conditions (e.g., van only, rear dock), and delivery windows.
● Active Stop Detail: Specific instructions for the current outlet, including the digital
run sheet of expected items.
● Proof of Delivery (PoD): An interface to capture digital signatures, photos, and
record loading shortfalls.
● Offline Mode Banner (Degradation Screen Candidate): A prominent UI state
indicating connection loss, confirming that data is saving locally and showing a queue
of pending syncs.
## User Flow:
- Log in and view the day's assigned itinerary.
- Navigate to the first stop, viewing specific unloading conditions (e.g., mall bay access
window).
- Unload the goods and use the PoD screen to record the delivery outcome.
- If mobile coverage drops (e.g., in the hill country), continue completing PoD screens
in offline mode.
- System automatically reconciles and syncs local records with the central database
once connectivity returns.
Store Manager (Desktop/Mobile)
Primary Environment: Outlet counter, prioritizing quick interactions while managing store
operations.
## Core Pages:

● Order Entry: Distinct ordering interfaces tailored to the brand (e.g., daily dry
groceries for Fresh, weekly seasonal orders for Style, single high-value items for
## Tech).
● Receiving Dashboard: A timeline showing expected arrival times for today's
deliveries to schedule receiving staff.
● Exception Alert View: Clear, immediate notifications explaining if an order was
deferred to the next run and the reason why.
● Receipt Confirmation: A checklist matching the driver's PoD to officially accept the
goods and report any immediate issues.
## User Flow:
- Submit an order prior to the 4 PM cutoff and receive an immediate system
confirmation.
- Check the Receiving Dashboard on the morning of delivery to view the Driver's ETA.
- Receive an Exception Alert if the Dispatcher was forced to defer the order due to
fleet capacity.
- Upon the Driver's arrival, verify the unloaded goods against the expected list and
digitally confirm receipt.
