import { Router, Request, Response } from 'express';
import { store } from '../store.js';
import { v4 as uuidv4 } from 'uuid';

export const chatRouter = Router();

// 1. Get Direct Messages Between Two Users
chatRouter.get('/history', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const targetId = req.query.targetId as string;

  if (!userId || !targetId) {
    res.status(400).json({ error: 'Both userId and targetId are required' });
    return;
  }

  const messages = store.chatMessages.filter(
    (m) =>
      (m.fromUserId === userId && m.toUserId === targetId) ||
      (m.fromUserId === targetId && m.toUserId === userId)
  );

  res.json({ messages });
});

// 2. Get Messages for an Active Call / Room
chatRouter.get('/room/:roomId', (req: Request, res: Response) => {
  const roomId = req.params.roomId as string;
  const messages = store.chatMessages.filter((m) => m.roomId === roomId);
  res.json({ messages });
});

// 3. Send Text Message via HTTP API
chatRouter.post('/send', (req: Request, res: Response) => {
  const { fromUserId, toUserId, roomId, text } = req.body;

  if (!fromUserId || !text) {
    res.status(400).json({ error: 'fromUserId and text are required' });
    return;
  }

  const sender = store.users.get(fromUserId);
  const newMsg = {
    id: `msg_${uuidv4()}`,
    roomId,
    fromUserId,
    fromUserName: sender?.name || 'User',
    toUserId,
    text,
    timestamp: new Date().toISOString(),
  };

  store.chatMessages.push(newMsg);
  res.status(201).json({ success: true, message: newMsg });
});
