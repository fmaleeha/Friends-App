import { User, CelebrityProfile, OrganizationProfile, EventItem, TicketBooking, Wallet, SupportTicket, ActiveCall, ChatMessage } from './types.js';

export class AppDataStore {
  // Users across the 5 roles
  users: Map<string, User> = new Map();
  wallets: Map<string, Wallet> = new Map();
  celebrities: Map<string, CelebrityProfile> = new Map();
  organizations: Map<string, OrganizationProfile> = new Map();
  events: Map<string, EventItem> = new Map();
  bookings: Map<string, TicketBooking> = new Map();
  supportTickets: Map<string, SupportTicket> = new Map();
  activeCalls: Map<string, ActiveCall> = new Map();
  chatMessages: ChatMessage[] = [];

  // Matchmaking queues
  audioMatchQueue: Array<{ socketId: string; user: User }> = [];
  videoMatchQueue: Array<{ socketId: string; user: User }> = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Normal User
    const user1: User = {
      id: 'usr-101',
      phone: '+919876543210',
      name: 'Rahul Nair',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      latitude: 9.9312,
      longitude: 76.2673, // Kochi, Kerala
      isVerified: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user1.id, user1);
    this.wallets.set(user1.id, {
      id: 'wlt-101',
      userId: user1.id,
      coinBalance: 250,
      transactions: [
        {
          id: 'tx-1',
          walletId: 'wlt-101',
          coins: 200,
          type: 'RECHARGE',
          description: 'Welcome Bonus + Razorpay Top-up',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    // 2. Organization User
    const orgUser: User = {
      id: 'usr-102',
      phone: '+919876543211',
      name: 'Kerala Beats Entertainment',
      role: 'ORGANIZATION',
      avatarUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150',
      latitude: 9.9312,
      longitude: 76.2673,
      isVerified: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(orgUser.id, orgUser);
    this.organizations.set(orgUser.id, {
      id: 'org-1',
      userId: orgUser.id,
      companyName: 'Kerala Beats Entertainment Pvt Ltd',
      regNumber: 'KL-REG-2024-9988',
      isApproved: true,
    });

    // 3. Celebrity User
    const celebUser: User = {
      id: 'usr-103',
      phone: '+919876543212',
      name: 'Arjun Das (Actor & Voice Artist)',
      role: 'CELEBRITY',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      latitude: 9.9312,
      longitude: 76.2673,
      isVerified: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(celebUser.id, celebUser);
    this.celebrities.set(celebUser.id, {
      id: 'celeb-1',
      userId: celebUser.id,
      name: celebUser.name,
      avatarUrl: celebUser.avatarUrl!,
      bio: 'Popular cinema actor, passionate about connecting with genuine fans through voice & video!',
      category: 'Cinema & Voice Art',
      audioRatePerMinCoins: 40,
      videoRatePerMinCoins: 80,
      availability: 'ONLINE',
      rating: 4.95,
      totalEarnedCoins: 3400,
    });
    this.wallets.set(celebUser.id, {
      id: 'wlt-celeb',
      userId: celebUser.id,
      coinBalance: 3400,
      transactions: [],
    });

    // Celebrity 2
    const celeb2: User = {
      id: 'usr-106',
      phone: '+919876543215',
      name: 'Priya Mohan (Playback Singer)',
      role: 'CELEBRITY',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      latitude: 9.9816,
      longitude: 76.2999,
      isVerified: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(celeb2.id, celeb2);
    this.celebrities.set(celeb2.id, {
      id: 'celeb-2',
      userId: celeb2.id,
      name: celeb2.name,
      avatarUrl: celeb2.avatarUrl!,
      bio: 'Playback singer & classical musician. Let’s talk music and jam on calls!',
      category: 'Music & Singing',
      audioRatePerMinCoins: 30,
      videoRatePerMinCoins: 60,
      availability: 'ONLINE',
      rating: 4.88,
      totalEarnedCoins: 1950,
    });
    this.wallets.set(celeb2.id, {
      id: 'wlt-celeb2',
      userId: celeb2.id,
      coinBalance: 1950,
      transactions: [],
    });

    // 4. Customer Care Agent
    const supportUser: User = {
      id: 'usr-104',
      phone: '+919876543213',
      name: 'Amina (Support Specialist)',
      role: 'SUPPORT',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      latitude: 9.9312,
      longitude: 76.2673,
      isVerified: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(supportUser.id, supportUser);

    // 5. Super Admin
    const adminUser: User = {
      id: 'usr-105',
      phone: '+919876543214',
      name: 'Admin Chief (Governance)',
      role: 'SUPER_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      latitude: 9.9312,
      longitude: 76.2673,
      isVerified: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(adminUser.id, adminUser);

    // Seed Events with Location Coordinates
    const event1: EventItem = {
      id: 'evt-1',
      organizerId: orgUser.id,
      organizerName: 'Kerala Beats Entertainment',
      title: 'Grand Coastal Music & Indie Fest 2026',
      description: 'A 2-day seaside music explosion featuring live bands, celebrity guest performances, food street, and open mic arenas.',
      venueName: 'Bolgatty Palace Grounds, Kochi',
      latitude: 9.9866,
      longitude: 76.2662,
      bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      startTime: '2026-11-20T17:00:00Z',
      endTime: '2026-11-22T23:30:00Z',
      isPublished: true,
      ticketTiers: [
        { id: 'tier-1', eventId: 'evt-1', name: 'General Entry', priceInr: 499, totalQuantity: 1000, soldQuantity: 420 },
        { id: 'tier-2', eventId: 'evt-1', name: 'VIP Front Row', priceInr: 1299, totalQuantity: 250, soldQuantity: 180 },
        { id: 'tier-3', eventId: 'evt-1', name: 'Backstage Meet & Greet Pass', priceInr: 2999, totalQuantity: 50, soldQuantity: 48 },
      ],
    };
    this.events.set(event1.id, event1);

    const event2: EventItem = {
      id: 'evt-2',
      organizerId: orgUser.id,
      organizerName: 'Kerala Beats Entertainment',
      title: 'Kochi Tech Creators & Film Con 2026',
      description: 'Interact with leading digital creators, indie filmmakers, and tech innovators. Workshops, pitch desks, and live networking.',
      venueName: 'Kaloor Stadium Convention Centre, Kochi',
      latitude: 9.9972,
      longitude: 76.3005,
      bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      startTime: '2026-12-05T10:00:00Z',
      endTime: '2026-12-06T18:00:00Z',
      isPublished: true,
      ticketTiers: [
        { id: 'tier-4', eventId: 'evt-2', name: 'Delegate Pass', priceInr: 349, totalQuantity: 500, soldQuantity: 210 },
        { id: 'tier-5', eventId: 'evt-2', name: 'VIP All-Access Pass', priceInr: 899, totalQuantity: 100, soldQuantity: 65 },
      ],
    };
    this.events.set(event2.id, event2);

    // Seed Support Ticket
    const ticket1: SupportTicket = {
      id: 'tkt-1',
      userId: user1.id,
      userName: user1.name,
      userPhone: user1.phone,
      assignedAgentId: supportUser.id,
      assignedAgentName: supportUser.name,
      subject: 'Inquiry regarding Event VIP seat booking confirmation',
      description: 'Booked VIP ticket for Coastal Music Fest, need assistance verifying QR admission pass.',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    this.supportTickets.set(ticket1.id, ticket1);

    // Seed Initial Text Chat Messages
    this.chatMessages.push(
      {
        id: 'msg-1',
        fromUserId: 'usr-104',
        fromUserName: 'Amina (Support Specialist)',
        toUserId: 'usr-101',
        text: 'Hello Rahul! Welcome to Friends App. You can reach out here 24/7 for any help or inquiries.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg-2',
        fromUserId: 'usr-101',
        fromUserName: 'Rahul Nair',
        toUserId: 'usr-104',
        text: 'Thanks Amina! Excited to test random matchmaking and event tickets.',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
      },
      {
        id: 'msg-3',
        fromUserId: 'usr-103',
        fromUserName: 'Arjun Das',
        toUserId: 'usr-101',
        text: 'Hey Rahul! Thanks for connecting. Excited to interact with all genuine fans here!',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      }
    );
  }

  // Calculate distance between two GPS coordinates using Haversine formula (km)
  static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
}

export const store = new AppDataStore();
