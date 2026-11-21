import { Router, Request, Response } from 'express';
import { store } from '../store.js';
import { v4 as uuidv4 } from 'uuid';
import { SupportTicket } from '../types.js';

export const supportRouter = Router();

// 1. Get All Tickets (Customer Support & Admin Role)
supportRouter.get('/tickets', (_req: Request, res: Response) => {
  const tickets = Array.from(store.supportTickets.values());
  res.json({ tickets });
});

// 2. File a New Support Ticket (User, Org, or Celebrity)
supportRouter.post('/tickets/create', (req: Request, res: Response): any => {
  const { userId, subject, description, priority = 'MEDIUM' } = req.body;
  const user = store.users.get(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newTicket: SupportTicket = {
    id: `tkt_${uuidv4().substring(0, 8)}`,
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    subject,
    description,
    priority,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  store.supportTickets.set(newTicket.id, newTicket);
  console.log(`[Support Ticket Filed] ID: ${newTicket.id} from ${user.name}: "${subject}"`);
  return res.status(201).json({ success: true, ticket: newTicket });
});

// 3. Update Ticket Status / Assign Agent
supportRouter.patch('/tickets/:id', (req: Request, res: Response): any => {
  const { status, agentId } = req.body;
  const ticketId = req.params.id as string;
  const ticket = store.supportTickets.get(ticketId);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (status) ticket.status = status;
  if (agentId) {
    const agent = store.users.get(agentId);
    if (agent) {
      ticket.assignedAgentId = agent.id;
      ticket.assignedAgentName = agent.name;
    }
  }

  return res.json({ success: true, ticket });
});
