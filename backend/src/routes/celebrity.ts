import { Router, Request, Response } from 'express';
import { store } from '../store.js';
import { Availability } from '../types.js';

export const celebrityRouter = Router();

// 1. Get all Verified Celebrities
celebrityRouter.get('/list', (_req: Request, res: Response) => {
  const list = Array.from(store.celebrities.values());
  res.json({ celebrities: list });
});

// 2. Get Single Celebrity Profile
celebrityRouter.get('/:id', (req: Request, res: Response): any => {
  const celebId = req.params.id as string;
  const celeb = store.celebrities.get(celebId) || Array.from(store.celebrities.values()).find(c => c.id === celebId || c.userId === celebId);
  if (!celeb) {
    return res.status(404).json({ error: 'Celebrity not found' });
  }
  return res.json({ celebrity: celeb });
});

// 3. Update Celebrity Rates & Availability (Celebrity Role)
celebrityRouter.patch('/:id/settings', (req: Request, res: Response): any => {
  const { availability, audioRatePerMinCoins, videoRatePerMinCoins, bio } = req.body;
  const celebId = req.params.id as string;
  const celeb = store.celebrities.get(celebId) || Array.from(store.celebrities.values()).find(c => c.id === celebId || c.userId === celebId);

  if (!celeb) {
    return res.status(404).json({ error: 'Celebrity not found' });
  }

  if (availability) celeb.availability = availability as Availability;
  if (audioRatePerMinCoins !== undefined) celeb.audioRatePerMinCoins = Number(audioRatePerMinCoins);
  if (videoRatePerMinCoins !== undefined) celeb.videoRatePerMinCoins = Number(videoRatePerMinCoins);
  if (bio) celeb.bio = bio;

  console.log(`[Celebrity Settings Updated] ${celeb.name} -> Status: ${celeb.availability}, Audio: ${celeb.audioRatePerMinCoins}c/min, Video: ${celeb.videoRatePerMinCoins}c/min`);
  return res.json({ success: true, celebrity: celeb });
});

// 4. Celebrity Earnings & Analytics
celebrityRouter.get('/:id/earnings', (req: Request, res: Response): any => {
  const celebId = req.params.id as string;
  const celeb = store.celebrities.get(celebId) || Array.from(store.celebrities.values()).find(c => c.id === celebId || c.userId === celebId);
  if (!celeb) {
    return res.status(404).json({ error: 'Celebrity not found' });
  }
  const wallet = store.wallets.get(celeb.userId);

  return res.json({
    celebrityId: celeb.id,
    name: celeb.name,
    totalEarnedCoins: celeb.totalEarnedCoins,
    currentCoinBalance: wallet?.coinBalance || 0,
    estimatedInrPayout: ((wallet?.coinBalance || 0) * 0.70).toFixed(2), // 70% revenue share to creator
    transactions: wallet?.transactions || [],
  });
});
