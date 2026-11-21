import { Router, Request, Response } from 'express';
import { store } from '../store.js';

export const adminRouter = Router();

// 1. Super Admin Dashboard Metrics
adminRouter.get('/stats', (_req: Request, res: Response) => {
  const users = Array.from(store.users.values());
  const activeCalls = Array.from(store.activeCalls.values());
  const events = Array.from(store.events.values());
  const bookings = Array.from(store.bookings.values());

  const totalTicketGmvInr = bookings.reduce((sum, b) => sum + b.totalAmountInr, 0);
  const totalCoinsInCirculation = Array.from(store.wallets.values()).reduce((sum, w) => sum + w.coinBalance, 0);

  res.json({
    metrics: {
      totalUsers: users.length,
      normalUsers: users.filter(u => u.role === 'USER').length,
      celebrities: users.filter(u => u.role === 'CELEBRITY').length,
      organizations: users.filter(u => u.role === 'ORGANIZATION').length,
      supportAgents: users.filter(u => u.role === 'SUPPORT').length,
      activeCallsNow: activeCalls.length,
      publishedEvents: events.filter(e => e.isPublished).length,
      totalTicketsSold: bookings.reduce((sum, b) => sum + b.quantity, 0),
      totalTicketGmvInr,
      totalCoinsInCirculation,
      openSupportTickets: Array.from(store.supportTickets.values()).filter(t => t.status !== 'RESOLVED').length,
    },
    activeCalls,
  });
});

// 2. User Moderation: Ban or Unban User
adminRouter.patch('/users/:id/moderation', (req: Request, res: Response): any => {
  const { isBanned, isVerified } = req.body;
  const userId = req.params.id as string;
  const user = store.users.get(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (isBanned !== undefined) {
    user.isBanned = Boolean(isBanned);
    console.log(`[Admin Action] User ${user.name} (${user.id}) ban status set to: ${user.isBanned}`);
  }

  if (isVerified !== undefined) {
    user.isVerified = Boolean(isVerified);
  }

  return res.json({ success: true, user });
});

// 3. List All Users for Admin Console
adminRouter.get('/users', (_req: Request, res: Response) => {
  const users = Array.from(store.users.values()).map(u => ({
    ...u,
    wallet: store.wallets.get(u.id),
  }));
  res.json({ users });
});
