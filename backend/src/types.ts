export type Role = 'USER' | 'ORGANIZATION' | 'CELEBRITY' | 'SUPPORT' | 'SUPER_ADMIN';
export type CallType = 'RANDOM_FRIEND' | 'CELEBRITY_CALL' | 'SUPPORT_CALL';
export type MediaType = 'AUDIO' | 'VIDEO';
export type Availability = 'ONLINE' | 'BUSY' | 'OFFLINE' | 'DO_NOT_DISTURB';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface CelebrityProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  bio: string;
  category: string;
  audioRatePerMinCoins: number;
  videoRatePerMinCoins: number;
  availability: Availability;
  rating: number;
  totalEarnedCoins: number;
}

export interface OrganizationProfile {
  id: string;
  userId: string;
  companyName: string;
  regNumber: string;
  isApproved: boolean;
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  priceInr: number;
  totalQuantity: number;
  soldQuantity: number;
}

export interface EventItem {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  venueName: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  bannerUrl: string;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  ticketTiers: TicketTier[];
}

export interface TicketBooking {
  id: string;
  userId: string;
  userName: string;
  eventId: string;
  eventTitle: string;
  ticketTierId: string;
  tierName: string;
  quantity: number;
  totalAmountInr: number;
  paymentGateway: 'RAZORPAY' | 'STRIPE';
  paymentIntentId: string;
  qrToken: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
  bookedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  coins: number;
  type: 'RECHARGE' | 'CALL_DEDUCTION' | 'CELEB_EARNING' | 'REFUND';
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  coinBalance: number;
  transactions: WalletTransaction[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export interface ActiveCall {
  roomId: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  callType: CallType;
  mediaType: MediaType;
  startedAt: number;
  ratePerMin?: number;
}

export interface ChatMessage {
  id: string;
  roomId?: string;
  fromUserId: string;
  fromUserName: string;
  toUserId?: string;
  text: string;
  timestamp: string;
}
