// Placeholder route data matching the Figma prototype until the API is wired up.

export const truckPhoto =
  'https://images.unsplash.com/photo-1695222833131-54ee679ae8e5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=84&w=1200';
export const deliveryPhoto =
  'https://images.unsplash.com/photo-1601467995997-ac1ae9a8fff4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=82&w=800';

export const driver = {
  id: 'D-1084',
  name: 'Kasun Perera',
  fleet: 'Colombo Regional Fleet',
  truck: 'TRK-024',
  dateLabel: 'Monday, 14 October',
};

export type StopKind = 'done' | 'current' | 'upcoming';

export const routeStops: {
  no: string;
  store: string;
  city: string;
  time: string;
  temp: 'Chilled' | 'Ambient';
  status: string;
  kind: StopKind;
}[] = [
  { no: '01', store: 'Fresh Store #18', city: 'Colombo 07', time: 'Before 8:00 AM', temp: 'Chilled', status: 'Completed', kind: 'done' },
  { no: '02', store: 'Fresh Store #22', city: 'Nugegoda', time: '8:00–8:30 AM', temp: 'Chilled', status: 'Current Stop', kind: 'current' },
  { no: '03', store: 'Style Store #08', city: 'Colombo 03', time: '9:00–10:00 AM', temp: 'Ambient', status: 'Upcoming', kind: 'upcoming' },
  { no: '04', store: 'Daily Market #11', city: 'Dehiwala', time: '10:30–11:15 AM', temp: 'Ambient', status: 'Upcoming', kind: 'upcoming' },
];

export const stopDetails: Record<
  string,
  { number: string; store: string; city: string; window: string; address: string; distance: string }
> = {
  '02': { number: '02', store: 'Fresh Store #22', city: 'Nugegoda', window: '8:00 – 8:30 AM', address: '155 High Level Rd, Nugegoda', distance: '1.2 km' },
  '03': { number: '03', store: 'Style Store #08', city: 'Colombo 03', window: '9:00 – 10:00 AM', address: '42 Galle Rd, Colombo 03', distance: '4.8 km' },
};

export const deliveryItems = [
  { sku: 'CH-1048', name: 'Fresh Milk Crates', quantity: '12 crates', detail: '144 units · Chilled' },
  { sku: 'CH-2072', name: 'Greek Yogurt Cases', quantity: '10 cases', detail: '120 units · Chilled' },
  { sku: 'CH-3185', name: 'Cheese Cartons', quantity: '6 cartons', detail: '72 units · Chilled' },
];

export const historyDeliveries = [
  { stop: 'Stop 02', store: 'Fresh Store #22', city: 'Nugegoda', time: '8:24 AM', items: '28 / 28 items', type: 'Chilled', status: 'Complete' },
  { stop: 'Stop 01', store: 'Fresh Store #18', city: 'Colombo 07', time: '7:02 AM', items: '16 / 16 items', type: 'Chilled', status: 'Complete' },
  { stop: 'Stop 06', store: 'Urban Market #05', city: 'Rajagiriya', time: 'Yesterday · 1:42 PM', items: '21 / 22 items', type: 'Ambient', status: 'Shortfall' },
  { stop: 'Stop 05', store: 'Daily Market #14', city: 'Battaramulla', time: 'Yesterday · 12:18 PM', items: '34 / 34 items', type: 'Ambient', status: 'Complete' },
];

export const syncQueue = [
  { name: 'Stop 01 PoD', time: '6:58 AM' },
  { name: 'Stop 02 Signature', time: '8:22 AM' },
  { name: 'Stop 02 Delivery Photo', time: '8:23 AM' },
];
