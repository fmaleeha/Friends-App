import { Router, Request, Response } from 'express';
import { store } from '../store.js';
import { v4 as uuidv4 } from 'uuid';

export const walletRouter = Router();

// Standard Coin Packages
export const COIN_PACKAGES = [
  { id: 'pack-starter', coins: 100, priceInr: 99, discount: 'Popular' },
  { id: 'pack-silver', coins: 300, priceInr: 249, discount: 'Save 17%' },
  { id: 'pack-gold', coins: 700, priceInr: 499, discount: 'Save 28%' },
  { id: 'pack-vip', coins: 1500, priceInr: 999, discount: 'Best Value (Save 33%)' },
];

// 1. Get Wallet Balance & Packages
walletRouter.get('/:userId', (req: Request, res: Response): any => {
  const userId = req.params.userId as string;
  let wallet = store.wallets.get(userId);

  if (!wallet) {
    wallet = {
      id: `wlt_${uuidv4().substring(0, 8)}`,
      userId,
      coinBalance: 50,
      transactions: [],
    };
    store.wallets.set(userId, wallet);
  }

  return res.json({
    wallet,
    packages: COIN_PACKAGES,
  });
});

// 2. Recharge / Top-up Coins (Simulated Razorpay / Stripe Payment Flow)
walletRouter.post('/recharge', (req: Request, res: Response): any => {
  const { userId, packageId, paymentGateway = 'RAZORPAY' } = req.body;
  const pack = COIN_PACKAGES.find(p => p.id === packageId);

  if (!pack) {
    return res.status(400).json({ error: 'Invalid coin package selected' });
  }

  let wallet = store.wallets.get(userId);
  if (!wallet) {
    wallet = {
      id: `wlt_${uuidv4().substring(0, 8)}`,
      userId,
      coinBalance: 0,
      transactions: [],
    };
    store.wallets.set(userId, wallet);
  }

  // Credit coins
  wallet.coinBalance += pack.coins;
  const tx = {
    id: `tx_${uuidv4().substring(0, 8)}`,
    walletId: wallet.id,
    coins: pack.coins,
    type: 'RECHARGE' as const,
    referenceId: `pay_${paymentGateway.toLowerCase()}_${Date.now()}`,
    description: `Purchased ${pack.coins} Coins pack via ${paymentGateway} (₹${pack.priceInr})`,
    createdAt: new Date().toISOString(),
  };

  wallet.transactions.unshift(tx);

  console.log(`[Coin Recharge] User: ${userId} +${pack.coins} Coins (New Balance: ${wallet.coinBalance})`);
  return res.json({
    success: true,
    message: `Successfully added ${pack.coins} Coins to your wallet!`,
    wallet,
    transaction: tx,
  });
});
