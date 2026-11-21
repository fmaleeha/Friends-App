import { Router, Request, Response } from 'express';
import { store } from '../store.js';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../types.js';

export const authRouter = Router();

// Simulated OTP storage (for testing: any 6-digit code or default '123456')
const activeOtps = new Map<string, string>();

// 1. Send OTP (Simulating Firebase Phone Auth / Twilio SMS)
authRouter.post('/send-otp', (req: Request, res: Response): any => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const otp = '123456'; // Default demo OTP for rapid MVP testing
  activeOtps.set(phone, otp);

  console.log(`[SMS OTP Generated] Phone: ${phone} -> OTP: ${otp}`);
  return res.json({
    success: true,
    message: `OTP sent successfully to ${phone}. For testing, use code: 123456`,
    provider: 'FIREBASE_TWILIO_GATEWAY',
  });
});

// 2. Verify OTP & Login / Signup
authRouter.post('/verify-otp', (req: Request, res: Response): any => {
  const { phone, otp, name, role = 'USER' } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const expectedOtp = activeOtps.get(phone) || '123456';
  if (otp !== expectedOtp && otp !== '123456') {
    return res.status(400).json({ error: 'Invalid or expired OTP code' });
  }

  // Find existing user by phone
  let user = Array.from(store.users.values()).find(u => u.phone === phone);

  if (!user) {
    // Create new user
    user = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      phone,
      name: name || `User ${phone.slice(-4)}`,
      role: role as Role,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${phone}`,
      latitude: 9.9312,
      longitude: 76.2673,
      isVerified: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
    };
    store.users.set(user.id, user);

    // If registering as a Celebrity, initialize Celebrity Profile
    if (role === 'CELEBRITY') {
      store.celebrities.set(user.id, {
        id: `celeb_${uuidv4().substring(0, 8)}`,
        userId: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl!,
        bio: req.body.bio || 'Verified talent on Friends App.',
        category: req.body.category || 'Creator & Influencer',
        audioRatePerMinCoins: Number(req.body.audioRate) || 30,
        videoRatePerMinCoins: Number(req.body.videoRate) || 60,
        availability: 'ONLINE',
        rating: 5.0,
        totalEarnedCoins: 0,
      });
    }

    // If registering as an Organization, initialize Organization Profile
    if (role === 'ORGANIZATION') {
      store.organizations.set(user.id, {
        id: `org_${uuidv4().substring(0, 8)}`,
        userId: user.id,
        companyName: req.body.companyName || user.name,
        regNumber: req.body.regNumber || 'REG-PENDING',
        isApproved: true,
      });
    }

    // Give new user starting welcome coins
    store.wallets.set(user.id, {
      id: `wlt_${uuidv4().substring(0, 8)}`,
      userId: user.id,
      coinBalance: role === 'USER' ? 150 : 0,
      transactions: [
        {
          id: `tx_${uuidv4().substring(0, 8)}`,
          walletId: `wlt_${user.id}`,
          coins: role === 'USER' ? 150 : 0,
          type: 'RECHARGE',
          description: 'Welcome Bonus Coins',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'This account has been suspended by Super Admin due to platform violations.' });
  }

  return res.json({
    success: true,
    token: `jwt_token_${user.id}_${Date.now()}`,
    user,
    wallet: store.wallets.get(user.id),
  });
});

// 3. Quick Role Switcher (For immediate full-platform demonstration)
authRouter.get('/roles', (_req: Request, res: Response) => {
  const roleList = [
    { role: 'USER', label: '1. Normal User', user: store.users.get('usr-101') },
    { role: 'ORGANIZATION', label: '2. Organization / Company', user: store.users.get('usr-102') },
    { role: 'CELEBRITY', label: '3. Celebrity User', user: store.users.get('usr-103') },
    { role: 'SUPPORT', label: '4. Customer Care Agent', user: store.users.get('usr-104') },
    { role: 'SUPER_ADMIN', label: '5. Super Admin', user: store.users.get('usr-105') },
  ];
  res.json({ roles: roleList });
});

// 4. Get Current User by ID
authRouter.get('/user/:id', (req: Request, res: Response): any => {
  const userId = req.params.id as string;
  const user = store.users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const wallet = store.wallets.get(user.id);
  const celebProfile = store.celebrities.get(user.id);
  const orgProfile = store.organizations.get(user.id);

  return res.json({ user, wallet, celebProfile, orgProfile });
});
