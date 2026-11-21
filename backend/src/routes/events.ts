import { Router, Request, Response } from 'express';
import { store, AppDataStore } from '../store.js';
import { v4 as uuidv4 } from 'uuid';
import { EventItem, TicketBooking, TicketTier } from '../types.js';

export const eventsRouter = Router();

// 1. Get Nearby Events with PostGIS/Haversine distance calculation
eventsRouter.get('/nearby', (req: Request, res: Response) => {
  const userLat = parseFloat(req.query.lat as string) || 9.9312;
  const userLon = parseFloat(req.query.lng as string) || 76.2673;
  const radiusKm = parseFloat(req.query.radiusKm as string) || 50;

  const results: EventItem[] = [];

  for (const event of store.events.values()) {
    if (!event.isPublished) continue;

    const distance = AppDataStore.calculateDistanceKm(userLat, userLon, event.latitude, event.longitude);

    if (distance <= radiusKm) {
      results.push({
        ...event,
        distanceKm: distance,
      });
    }
  }

  // Sort by closest distance first
  results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  res.json({
    userLocation: { latitude: userLat, longitude: userLon },
    radiusKm,
    totalFound: results.length,
    events: results,
  });
});

// 2. Get Single Event Details
eventsRouter.get('/:id', (req: Request, res: Response): any => {
  const eventId = req.params.id as string;
  const event = store.events.get(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  return res.json({ event });
});

// 3. Create Event (Organization Role)
eventsRouter.post('/create', (req: Request, res: Response): any => {
  const { organizerId, title, description, venueName, latitude, longitude, bannerUrl, startTime, endTime, tiers } = req.body;

  const orgUser = store.users.get(organizerId);
  if (!orgUser || (orgUser.role !== 'ORGANIZATION' && orgUser.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Only verified Organization accounts can publish events' });
  }

  const eventId = `evt_${uuidv4().substring(0, 8)}`;
  const ticketTiers: TicketTier[] = (tiers || []).map((t: any, idx: number) => ({
    id: `tier_${eventId}_${idx + 1}`,
    eventId,
    name: t.name || 'General Admission',
    priceInr: Number(t.priceInr) || 299,
    totalQuantity: Number(t.totalQuantity) || 500,
    soldQuantity: 0,
  }));

  const newEvent: EventItem = {
    id: eventId,
    organizerId: orgUser.id,
    organizerName: orgUser.name,
    title,
    description,
    venueName,
    latitude: parseFloat(latitude) || 9.9312,
    longitude: parseFloat(longitude) || 76.2673,
    bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    startTime: startTime || new Date(Date.now() + 7 * 86400000).toISOString(),
    endTime: endTime || new Date(Date.now() + 8 * 86400000).toISOString(),
    isPublished: true,
    ticketTiers,
  };

  store.events.set(newEvent.id, newEvent);
  console.log(`[Event Published] ${newEvent.title} by ${orgUser.name}`);
  return res.status(201).json({ success: true, event: newEvent });
});

// 4. Book Event Ticket (Razorpay / Stripe simulation)
eventsRouter.post('/book', (req: Request, res: Response): any => {
  const { userId, eventId, ticketTierId, quantity = 1, paymentGateway = 'RAZORPAY' } = req.body;

  const user = store.users.get(userId);
  const event = store.events.get(eventId);

  if (!user || !event) {
    return res.status(404).json({ error: 'User or Event not found' });
  }

  const tier = event.ticketTiers.find(t => t.id === ticketTierId);
  if (!tier) {
    return res.status(404).json({ error: 'Ticket tier not found' });
  }

  if (tier.soldQuantity + quantity > tier.totalQuantity) {
    return res.status(400).json({ error: 'Sold out! Not enough tickets remaining in this tier.' });
  }

  // Increment sold tickets
  tier.soldQuantity += quantity;

  const totalAmountInr = tier.priceInr * quantity;
  const bookingId = `bkg_${uuidv4().substring(0, 8)}`;
  const qrToken = `TICKET_${bookingId}_${Date.now()}`;

  const booking: TicketBooking = {
    id: bookingId,
    userId: user.id,
    userName: user.name,
    eventId: event.id,
    eventTitle: event.title,
    ticketTierId: tier.id,
    tierName: tier.name,
    quantity,
    totalAmountInr,
    paymentGateway,
    paymentIntentId: `pay_${paymentGateway.toLowerCase()}_${uuidv4().substring(0, 10)}`,
    qrToken,
    status: 'CONFIRMED',
    bookedAt: new Date().toISOString(),
  };

  store.bookings.set(booking.id, booking);

  console.log(`[Ticket Booked] User: ${user.name} -> ${event.title} (${tier.name} x${quantity}) - ₹${totalAmountInr}`);
  return res.json({
    success: true,
    message: 'Ticket confirmed successfully!',
    booking,
  });
});

// 5. Get User Bookings
eventsRouter.get('/user/:userId/bookings', (req: Request, res: Response) => {
  const userBookings = Array.from(store.bookings.values()).filter(b => b.userId === req.params.userId);
  res.json({ bookings: userBookings });
});

// 6. Verify / Scan QR Ticket (Gate Admission Scanner for Organizations)
eventsRouter.post('/verify-ticket', (req: Request, res: Response): any => {
  const { qrToken } = req.body;
  const booking = Array.from(store.bookings.values()).find(b => b.qrToken === qrToken);

  if (!booking) {
    return res.status(404).json({ valid: false, message: 'Invalid ticket pass' });
  }

  if (booking.status === 'CHECKED_IN') {
    return res.status(400).json({ valid: false, message: 'Ticket has ALREADY been scanned and admitted.', booking });
  }

  booking.status = 'CHECKED_IN';
  return res.json({
    valid: true,
    message: `Entry Allowed! Welcome ${booking.userName} (${booking.tierName} x${booking.quantity})`,
    booking,
  });
});
