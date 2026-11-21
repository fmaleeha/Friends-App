"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Star,
  MapPin, Ticket, Shield, Headphones, Coins, RefreshCw,
  Plus, CheckCircle, AlertCircle, Building2, User, Play,
  Sliders, Calendar, QrCode, Search, Volume2, MessageSquare,
  Send, MessageCircle, UserPlus, Sparkles
} from "lucide-react";

const getBackendUrl = () => {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }
  return "http://localhost:4000";
};

const BACKEND_URL = getBackendUrl();

interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: "USER" | "ORGANIZATION" | "CELEBRITY" | "SUPPORT" | "SUPER_ADMIN";
  avatarUrl?: string;
  latitude: number;
  longitude: number;
}

export default function FriendsApp() {
  // Current active role & user
  const [activeRole, setActiveRole] = useState<"USER" | "ORGANIZATION" | "CELEBRITY" | "SUPPORT" | "SUPER_ADMIN">("USER");
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: "usr-101",
    phone: "+919876543210",
    name: "Rahul Nair",
    role: "USER",
    latitude: 9.9312,
    longitude: 76.2673,
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  });

  // Navigation tab for normal user
  const [userTab, setUserTab] = useState<"MATCH" | "CELEBRITY" | "EVENTS" | "CHAT" | "SUPPORT">("MATCH");

  // Real-Time Chat & Text Messaging State
  const [isInCallChatOpen, setIsInCallChatOpen] = useState(false);
  const [inCallMessages, setInCallMessages] = useState<Array<{ id: string; fromUserId: string; fromUserName: string; text: string; timestamp: string }>>([]);
  const [inCallInputText, setInCallInputText] = useState("");

  const [activeChatPartner, setActiveChatPartner] = useState<{ id: string; name: string; role: string; avatarUrl?: string }>({
    id: "usr-104",
    name: "Amina (Support Specialist)",
    role: "SUPPORT",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
  });

  // Dynamic Persistent Contacts List
  const [chatContacts, setChatContacts] = useState<Array<{
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    badge: string;
    lastMsg: string;
  }>>([
    {
      id: "usr-104",
      name: "Amina (Support Specialist)",
      role: "Customer Care",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      badge: "24/7 Agent",
      lastMsg: "You can reach out here 24/7 for any help...",
    },
    {
      id: "usr-103",
      name: "Arjun Das (Actor)",
      role: "Cinema Celebrity",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      badge: "Verified Star",
      lastMsg: "Excited to interact with all genuine fans here!",
    },
    {
      id: "usr-106",
      name: "Priya Mohan (Singer)",
      role: "Playback Singer",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      badge: "Musician",
      lastMsg: "Let's jam and talk music on chat!",
    },
  ]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const [directMessages, setDirectMessages] = useState<Array<{ id: string; fromUserId: string; fromUserName: string; toUserId: string; text: string; timestamp: string }>>([
    {
      id: "msg-1",
      fromUserId: "usr-104",
      fromUserName: "Amina (Support Specialist)",
      toUserId: "usr-101",
      text: "Hello Rahul! Welcome to Friends App. You can reach out here 24/7 for any help or inquiries.",
      timestamp: "10:30 AM"
    },
    {
      id: "msg-2",
      fromUserId: "usr-101",
      fromUserName: "Rahul Nair",
      toUserId: "usr-104",
      text: "Thanks Amina! Excited to test random matchmaking and event tickets.",
      timestamp: "10:32 AM"
    },
    {
      id: "msg-3",
      fromUserId: "usr-103",
      fromUserName: "Arjun Das (Actor)",
      toUserId: "usr-101",
      text: "Hey Rahul! Thanks for connecting. Excited to interact with all genuine fans here!",
      timestamp: "11:15 AM"
    }
  ]);
  const [directInputText, setDirectInputText] = useState("");
  const [supportChatModalUser, setSupportChatModalUser] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [supportInputText, setSupportInputText] = useState("");

  // Login / Authentication & Registration State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [loginRole, setLoginRole] = useState<"USER" | "ORGANIZATION" | "CELEBRITY" | "SUPPORT" | "SUPER_ADMIN">("USER");
  const [loginPhone, setLoginPhone] = useState("+91 98765 43210");
  const [loginOtp, setLoginOtp] = useState("123456");

  // Sign Up Form State for New User / Celebrity / Organization
  const [signupRole, setSignupRole] = useState<"USER" | "CELEBRITY" | "ORGANIZATION">("USER");
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("+91 94471 23456");
  const [signupOtp, setSignupOtp] = useState("123456");
  const [signupBio, setSignupBio] = useState("Passionate creator excited to connect with fans!");
  const [signupCategory, setSignupCategory] = useState("Cinema & Entertainment");
  const [signupAudioRate, setSignupAudioRate] = useState(35);
  const [signupVideoRate, setSignupVideoRate] = useState(70);
  const [signupCompanyName, setSignupCompanyName] = useState("");
  const [signupRegNumber, setSignupRegNumber] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Wallet State
  const [coinBalance, setCoinBalance] = useState<number>(250);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  // Matchmaking & Call State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<"AUDIO" | "VIDEO">("AUDIO");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [peerInfo, setPeerInfo] = useState<{ id: string; name: string } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<string>("RANDOM_FRIEND");

  // Media Streams & WebRTC
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Events & PostGIS State
  const [radiusKm, setRadiusKm] = useState(25);
  const [events, setEvents] = useState<any[]>([]);
  const [activeQrModal, setActiveQrModal] = useState<any | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Celebrities State
  const [celebrities, setCelebrities] = useState<any[]>([]);
  const [celebEarnings, setCelebEarnings] = useState<any>(null);

  // Admin & Support State
  const [adminStats, setAdminStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);

  // Organization New Event Form
  const [newOrgEvent, setNewOrgEvent] = useState({
    title: "",
    venueName: "",
    price: 399,
    description: "",
  });

  // 1. Initialize Socket.io Connection & Listeners
  useEffect(() => {
    const s = io(BACKEND_URL);
    setSocket(s);

    s.on("connect", () => {
      setIsConnected(true);
      s.emit("register", { userId: currentUser.id });
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    s.on("match:waiting", (data) => {
      setIsSearching(true);
    });

    s.on("match:success", async (data) => {
      setIsSearching(false);
      setActiveRoomId(data.roomId);
      setPeerInfo(data.peer);
      setCallType("RANDOM_FRIEND");
      setCallActive(true);
      await startLocalMedia(data.mediaType);
    });

    s.on("celebrity:call:accepted", async (data) => {
      setActiveRoomId(data.roomId);
      setPeerInfo(data.celebrity || data.peer);
      setCallType("CELEBRITY_CALL");
      setCallActive(true);
      await startLocalMedia(data.mediaType);
    });

    s.on("support:call:accepted", async (data) => {
      setActiveRoomId(data.roomId);
      setPeerInfo(data.user || data.peer);
      setCallType("SUPPORT_CALL");
      setCallActive(true);
      await startLocalMedia(data.mediaType);
    });

    s.on("wallet:update", (data) => {
      setCoinBalance(data.coinBalance);
    });

    s.on("chat:room:message", (msg) => {
      setInCallMessages((prev) => [...prev, msg]);
    });

    s.on("chat:direct:message", (msg) => {
      setDirectMessages((prev) => [...prev, msg]);
    });

    s.on("call:ended", (data) => {
      cleanupCall();
      alert(`Call ended: ${data.reason || "Disconnected"}`);
    });

    s.on("call:error", (data) => {
      alert(data.message);
      setIsSearching(false);
    });

    return () => {
      s.disconnect();
    };
  }, [currentUser.id]);

  // Call duration counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  // Fetch initial data based on role
  useEffect(() => {
    fetchEvents(radiusKm);
    fetchCelebrities();
    fetchWallet();
    if (activeRole === "SUPER_ADMIN") fetchAdminStats();
    if (activeRole === "SUPPORT") fetchSupportTickets();
    if (activeRole === "CELEBRITY") fetchCelebrityEarnings();
  }, [activeRole, radiusKm]);

  // Helper APIs
  const fetchWallet = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/wallet/${currentUser.id}`);
      const data = await res.json();
      if (data.wallet) setCoinBalance(data.wallet.coinBalance);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEvents = async (rad: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/nearby?lat=9.9312&lng=76.2673&radiusKm=${rad}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCelebrities = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/celebrities/list`);
      const data = await res.json();
      setCelebrities(data.celebrities || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`);
      const data = await res.json();
      setAdminStats(data.metrics);
      const userRes = await fetch(`${BACKEND_URL}/api/admin/users`);
      const userData = await userRes.json();
      setAllUsers(userData.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/support/tickets`);
      const data = await res.json();
      setSupportTickets(data.tickets || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCelebrityEarnings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/celebrities/celeb-1/earnings`);
      const data = await res.json();
      setCelebEarnings(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Role Switcher Handler
  const switchRole = (role: typeof activeRole) => {
    setActiveRole(role);
    cleanupCall();

    const roleMap: Record<typeof activeRole, UserProfile> = {
      USER: { id: "usr-101", phone: "+919876543210", name: "Rahul Nair", role: "USER", latitude: 9.9312, longitude: 76.2673, avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
      ORGANIZATION: { id: "usr-102", phone: "+919876543211", name: "Kerala Beats Entertainment", role: "ORGANIZATION", latitude: 9.9312, longitude: 76.2673, avatarUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150" },
      CELEBRITY: { id: "usr-103", phone: "+919876543212", name: "Arjun Das (Actor)", role: "CELEBRITY", latitude: 9.9312, longitude: 76.2673, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      SUPPORT: { id: "usr-104", phone: "+919876543213", name: "Amina (Support Specialist)", role: "SUPPORT", latitude: 9.9312, longitude: 76.2673, avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
      SUPER_ADMIN: { id: "usr-105", phone: "+919876543214", name: "Admin Chief (SuperAdmin)", role: "SUPER_ADMIN", latitude: 9.9312, longitude: 76.2673, avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150" },
    };

    const targetUser = roleMap[role];
    setCurrentUser(targetUser);
    if (socket) {
      socket.emit("register", { userId: targetUser.id });
    }
  };

  const handleRoleSelect = (role: typeof activeRole) => {
    setLoginRole(role);
    if (role === "USER") setLoginPhone("+91 98765 43210");
    if (role === "ORGANIZATION") setLoginPhone("+91 98765 43211");
    if (role === "CELEBRITY") setLoginPhone("+91 98765 43212");
    if (role === "SUPPORT") setLoginPhone("+91 98765 43213");
    if (role === "SUPER_ADMIN") setLoginPhone("+91 98765 43214");
  };

  const handleVerifyAndLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const isSignup = authMode === "SIGNUP";
      const rawPhone = (isSignup ? signupPhone : loginPhone).replace(/\s+/g, "");
      const role = isSignup ? signupRole : loginRole;
      const otp = isSignup ? signupOtp : loginOtp;

      const payload: any = {
        phone: rawPhone,
        otp,
        role,
      };

      if (isSignup) {
        payload.name = signupName.trim() || (role === "CELEBRITY" ? "Celebrity Creator" : role === "ORGANIZATION" ? "Event Partner" : "New User");
        if (signupRole === "CELEBRITY") {
          payload.bio = signupBio.trim();
          payload.category = signupCategory.trim();
          payload.audioRate = Number(signupAudioRate);
          payload.videoRate = Number(signupVideoRate);
        }
        if (signupRole === "ORGANIZATION") {
          payload.companyName = signupCompanyName.trim() || payload.name;
          payload.regNumber = signupRegNumber.trim() || "KL-REG-2024-NEW";
        }
      }

      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setActiveRole(data.user.role);
        if (data.wallet) {
          setCoinBalance(data.wallet.coinBalance);
        }
        if (socket) {
          socket.emit("register", { userId: data.user.id });
        }
        setIsLoggedIn(true);
        fetchEvents(radiusKm);
        fetchCelebrities();
      } else {
        setLoginError(data.error || "Authentication failed. Please check OTP.");
      }
    } catch (err) {
      console.error(err);
      // Fallback in case of network issue
      switchRole(loginRole);
      setIsLoggedIn(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAddFriendFromCall = () => {
    if (!peerInfo) return;
    const existing = chatContacts.find((c) => c.id === peerInfo.id);
    if (!existing) {
      const newContact = {
        id: peerInfo.id,
        name: peerInfo.name,
        role: "Friend (Random Match)",
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${peerInfo.id}`,
        badge: "Direct Friend",
        lastMsg: "Connected via Random Match! Tap to message.",
      };
      setChatContacts((prev) => [newContact, ...prev]);
      setActiveChatPartner(newContact);
    } else {
      setActiveChatPartner(existing);
    }
    alert(`🎉 Successfully added ${peerInfo.name} to your Direct Friends & Chat list! You can text them anytime in "Messages & Chat".`);
  };

  const handleLogout = () => {
    cleanupCall();
    setIsLoggedIn(false);
    setLoginError(null);
  };

  // WebRTC & Media Setup
  const startLocalMedia = async (mediaType: "AUDIO" | "VIDEO") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mediaType === "VIDEO",
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera/Mic permission bypassed or unavailable:", err);
    }
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setCallActive(false);
    setIsSearching(false);
    setActiveRoomId(null);
    setPeerInfo(null);
  };

  // Actions
  const handleStartRandomMatch = () => {
    if (!socket) return;
    setIsSearching(true);
    socket.emit("match:join", {
      userId: currentUser.id,
      mediaType: selectedMediaType,
    });
  };

  const handleCancelMatch = () => {
    if (!socket) return;
    setIsSearching(false);
    socket.emit("match:cancel", { userId: currentUser.id });
  };

  const handleCallCelebrity = (celeb: any, media: "AUDIO" | "VIDEO") => {
    if (!socket) return;
    socket.emit("celebrity:call:initiate", {
      callerId: currentUser.id,
      celebrityUserId: celeb.userId,
      mediaType: media,
    });
  };

  const handleAgentCallUser = (targetUserId: string, media: "AUDIO" | "VIDEO") => {
    if (!socket) return;
    socket.emit("support:call:user", {
      agentId: currentUser.id,
      targetUserId,
      mediaType: media,
    });
  };

  const handleEndCall = () => {
    if (socket && activeRoomId) {
      socket.emit("call:end", { roomId: activeRoomId, reason: "Hangup" });
    }
    cleanupCall();
  };

  const handleSendInCallMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!socket || !activeRoomId || !inCallInputText.trim()) return;
    const text = inCallInputText.trim();
    socket.emit("chat:room:send", {
      roomId: activeRoomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
    });
    setInCallInputText("");
  };

  const handleSendDirectMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatPartner || !directInputText.trim()) return;
    const text = directInputText.trim();
    const newMsg = {
      id: `msg_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: activeChatPartner.id,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDirectMessages((prev) => [...prev, newMsg]);
    if (socket) {
      socket.emit("chat:direct:send", {
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        toUserId: activeChatPartner.id,
        text,
      });
    }
    setDirectInputText("");
  };

  const handleSendSupportMessage = (targetUserId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!supportInputText.trim()) return;
    const text = supportInputText.trim();
    const newMsg = {
      id: `msg_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: targetUserId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDirectMessages((prev) => [...prev, newMsg]);
    if (socket) {
      socket.emit("chat:direct:send", {
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        toUserId: targetUserId,
        text,
      });
    }
    setSupportInputText("");
  };

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoDisabled(!videoTrack.enabled);
      }
    } else {
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  const handleRecharge = async (packId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/wallet/recharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, packageId: packId }),
      });
      const data = await res.json();
      if (data.wallet) {
        setCoinBalance(data.wallet.coinBalance);
        setIsRechargeOpen(false);
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookTicket = async (event: any, tier: any) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          eventId: event.id,
          ticketTierId: tier.id,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (data.booking) {
        setActiveQrModal(data.booking);
        setBookingSuccess(`Booked 1x ${tier.name} for ${event.title}!`);
        fetchEvents(radiusKm);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOrgEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerId: currentUser.id,
          title: newOrgEvent.title,
          description: newOrgEvent.description,
          venueName: newOrgEvent.venueName,
          latitude: 9.9866,
          longitude: 76.2662,
          tiers: [{ name: "General Admission", priceInr: newOrgEvent.price, totalQuantity: 300 }],
        }),
      });
      const data = await res.json();
      if (data.event) {
        alert("Event published successfully!");
        setNewOrgEvent({ title: "", venueName: "", price: 399, description: "" });
        fetchEvents(radiusKm);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminBanToggle = async (userId: string, currentBan: boolean) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/users/${userId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !currentBan }),
      });
      fetchAdminStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Helper formatting for seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080d1a] text-slate-100">
      {/* ------------------------------------------------------------- */}
      {/* GLOBAL TOP NAVIGATION & ROLE SWITCHER */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#0e1628]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
                Friends App
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`} />
                {isConnected ? "WebRTC Signaling Online" : "Connecting..."}
              </div>
            </div>
          </div>

          {/* Logged In: Role Lock Badge & User Controls */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* Strictly Role-Locked Badge */}
              <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
                <span className="text-slate-400 hidden sm:inline">Role:</span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                  activeRole === "SUPER_ADMIN" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                  activeRole === "CELEBRITY" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                  activeRole === "ORGANIZATION" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                  activeRole === "SUPPORT" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" :
                  "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}>
                  {activeRole === "USER" && "👤 Normal User"}
                  {activeRole === "ORGANIZATION" && "🏢 Organization / Company"}
                  {activeRole === "CELEBRITY" && "⭐ Celebrity"}
                  {activeRole === "SUPPORT" && "🎧 Support Agent"}
                  {activeRole === "SUPER_ADMIN" && "🛡️ Super Admin"}
                </span>
              </div>

              {/* Coin Wallet Badge (for users / celebrities) */}
              {(activeRole === "USER" || activeRole === "CELEBRITY") && (
                <button
                  onClick={() => setIsRechargeOpen(true)}
                  className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full text-amber-400 text-xs font-semibold transition"
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{coinBalance} Coins</span>
                  <Plus className="w-3 h-3 text-amber-300" />
                </button>
              )}

              {/* User Name Badge */}
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-medium text-slate-200">{currentUser.name}</span>
              </div>

              {/* Strict Logout Button: Only way to exit this role */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 px-3.5 py-1.5 rounded-xl transition font-semibold shadow-sm"
              >
                <span>🚪 Logout</span>
              </button>
            </div>
          ) : (
            /* Not Logged In Badge */
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span>🔐 Multi-Role OTP Login</span>
            </div>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVE CALL MODAL (FULL-SCREEN WEBRTC AUDIO & VIDEO) */}
      {/* ------------------------------------------------------------- */}
      {callActive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-6">
          {/* Call Header */}
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
                {peerInfo?.name?.[0] || "F"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{peerInfo?.name || "Connected Friend"}</h2>
                <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {formatTime(callDuration)} • {callType.replace("_", " ")}
                </p>
              </div>
            </div>

            {callType === "CELEBRITY_CALL" && (
              <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Live Billing: 40-80 Coins/min
              </div>
            )}
          </div>

          {/* Video Streams Grid or Audio Visualizer */}
          <div className="w-full max-w-4xl flex-1 flex items-center justify-center my-6 relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
            {selectedMediaType === "VIDEO" && !isVideoDisabled ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-slate-950/70 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm">
                    Two-Way Video Connected ({peerInfo?.name})
                  </div>
                </div>

                {/* Local Camera PIP Preview */}
                <div className="absolute top-4 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg bg-black">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-2 text-[10px] bg-black/60 px-1 rounded text-white">You</span>
                </div>
              </div>
            ) : (
              // Audio Call Visualizer
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-blue-600/20 animate-ping absolute inset-0" />
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 relative">
                    <User className="w-16 h-16 text-white" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 h-12">
                  {[24, 40, 16, 52, 32, 48, 20, 60, 36, 18, 44, 28].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1.5 bg-blue-400 rounded-full animate-pulse"
                    />
                  ))}
                </div>
                <p className="text-slate-400 text-sm">Real-time WebRTC Audio Streaming with HD Opus Codec</p>
              </div>
            )}

            {/* In-Call Live Chat Drawer Overlay */}
            {isInCallChatOpen && (
              <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-950/95 backdrop-blur-md border-l border-slate-800 flex flex-col z-20 shadow-2xl">
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Live Call Chat</span>
                  </div>
                  <button
                    onClick={() => setIsInCallChatOpen(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Messages feed */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                  {inCallMessages.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      No messages yet. Send a message to your friend!
                    </div>
                  ) : (
                    inCallMessages.map((msg, i) => {
                      const isMe = msg.fromUserId === currentUser.id;
                      return (
                        <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <span className="text-[10px] text-slate-500 mb-0.5">{msg.fromUserName}</span>
                          <div
                            className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                              isMe ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendInCallMessage} className="p-2 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={inCallInputText}
                    onChange={(e) => setInCallInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Call Controls Bar */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-6 py-3 rounded-full shadow-2xl">
            <button
              onClick={handleToggleMute}
              className={`p-4 rounded-full transition ${
                isMuted ? "bg-white text-slate-900" : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {selectedMediaType === "VIDEO" && (
              <button
                onClick={handleToggleVideo}
                className={`p-4 rounded-full transition ${
                  isVideoDisabled ? "bg-white text-slate-900" : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                {isVideoDisabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}

            {/* Live In-Call Text Chat Toggle Button */}
            <button
              onClick={() => setIsInCallChatOpen(!isInCallChatOpen)}
              className={`p-4 rounded-full transition relative ${
                isInCallChatOpen ? "bg-blue-600 text-white" : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
              title="Open Live Chat"
            >
              <MessageSquare className="w-6 h-6" />
              {inCallMessages.length > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
              )}
            </button>

            {/* Save as Friend / Direct Chat Button */}
            {peerInfo && (
              <button
                onClick={handleAddFriendFromCall}
                className="p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/30"
                title="Add to Direct Friends & Chat"
              >
                <UserPlus className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition shadow-lg shadow-rose-600/40"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LOGIN & REGISTRATION VIEW (MULTI-ROLE AUTHENTICATION)         */}
      {/* ------------------------------------------------------------- */}
      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center p-4 py-10">
          <div className="w-full max-w-lg bg-[#0c1424] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Subtle blue accent glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header with FC Logo matching user's image */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 font-black text-xl text-white tracking-wider">
                FC
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Friends Connect</h2>
                <p className="text-xs text-slate-400">Mobile Number + OTP Authentication</p>
              </div>
            </div>

            {/* Top Toggle: Demo Login vs New Account Registration */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => { setAuthMode("LOGIN"); setLoginError(null); }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition ${
                  authMode === "LOGIN"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ⚡ Demo Login (5 Roles)
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("SIGNUP"); setLoginError(null); }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  authMode === "SIGNUP"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Create New Account</span>
              </button>
            </div>

            {/* 1. DEMO LOGIN FORM (Exact Layout from Screenshot) */}
            {authMode === "LOGIN" ? (
              <>
                {/* Green Notification Alert from user's image */}
                <div className="bg-[#0b2923] border border-emerald-600/40 rounded-2xl p-4 mb-5 text-xs text-emerald-300 leading-relaxed">
                  <span className="font-bold text-emerald-200">Dummy OTP Ready: </span>
                  മൊബൈൽ നമ്പറും ഡമ്മി OTP 123456 ഉം താഴെ ഓട്ടോമാറ്റിക്കായി പൂരിപ്പിച്ചിട്ടുണ്ട്. നേരിട്ട് &quot;Verify OTP &amp; Enter Website&quot; ക്ലിക്ക് ചെയ്യുക!
                </div>

                <form onSubmit={handleVerifyAndLogin} className="space-y-4">
                  {/* Dropdown: Choose Account Role to Login */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Choose Account Role to Login
                    </label>
                    <div className="relative">
                      <select
                        value={loginRole}
                        onChange={(e) => handleRoleSelect(e.target.value as any)}
                        className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none font-medium cursor-pointer"
                      >
                        <option value="USER">1. Normal User (Rahul Nair)</option>
                        <option value="ORGANIZATION">2. Organization / Company (Kerala Beats Entertainment)</option>
                        <option value="CELEBRITY">3. Celebrity (Arjun Das Actor)</option>
                        <option value="SUPPORT">4. Customer Care Support (Amina Specialist)</option>
                        <option value="SUPER_ADMIN">5. Super Admin (Governance &amp; Controls)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Number Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-medium font-mono"
                    />
                  </div>

                  {/* 6-Digit Dummy OTP / Password Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      6-Digit Dummy OTP / Password
                    </label>
                    <input
                      type="text"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white tracking-widest focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  {loginError && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">
                      {loginError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    <span>🔒</span>
                    <span>{loginLoading ? "Verifying OTP..." : "Verify OTP (123456) & Enter Website"}</span>
                  </button>
                </form>
              </>
            ) : (
              /* 2. CREATE NEW ACCOUNT (SIGN UP) FORM */
              <form onSubmit={handleVerifyAndLogin} className="space-y-4">
                {/* Account Type Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Select Account Type to Register
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignupRole("USER")}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        signupRole === "USER"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 font-bold"
                          : "bg-[#131d33] border-slate-700/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-base mb-0.5">👤</div>
                      <div className="text-xs">Normal User</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRole("CELEBRITY")}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        signupRole === "CELEBRITY"
                          ? "bg-amber-600/20 border-amber-500 text-amber-300 font-bold"
                          : "bg-[#131d33] border-slate-700/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-base mb-0.5">⭐</div>
                      <div className="text-xs">Celebrity</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRole("ORGANIZATION")}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        signupRole === "ORGANIZATION"
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-[#131d33] border-slate-700/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-base mb-0.5">🏢</div>
                      <div className="text-xs">Company</div>
                    </button>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {signupRole === "USER" && "Full Name (നിങ്ങളുടെ പേര്)"}
                    {signupRole === "CELEBRITY" && "Stage / Celebrity Artist Name (സെലിബ്രിറ്റി പേര്)"}
                    {signupRole === "ORGANIZATION" && "Company / Brand Name (സ്ഥാപനത്തിന്റെ പേര്)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder={
                      signupRole === "USER" ? "e.g. Vishnu Prasad" :
                      signupRole === "CELEBRITY" ? "e.g. Keerthy / Mohan" : "e.g. Sun Music Live Pvt Ltd"
                    }
                    className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Mobile Number & OTP Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+91 94471 23456"
                      className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Dummy OTP</label>
                    <input
                      type="text"
                      required
                      value={signupOtp}
                      onChange={(e) => setSignupOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white font-mono tracking-wider focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Role Specific Registration Fields */}
                {signupRole === "CELEBRITY" && (
                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/20 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Category / Art</label>
                        <input
                          type="text"
                          value={signupCategory}
                          onChange={(e) => setSignupCategory(e.target.value)}
                          placeholder="e.g. Playback Singer"
                          className="w-full bg-[#131d33] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Audio Rate (Coins/min)</label>
                        <input
                          type="number"
                          value={signupAudioRate}
                          onChange={(e) => setSignupAudioRate(Number(e.target.value))}
                          className="w-full bg-[#131d33] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Video Rate (Coins/min)</label>
                      <input
                        type="number"
                        value={signupVideoRate}
                        onChange={(e) => setSignupVideoRate(Number(e.target.value))}
                        className="w-full bg-[#131d33] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Bio / Introduction</label>
                      <input
                        type="text"
                        value={signupBio}
                        onChange={(e) => setSignupBio(e.target.value)}
                        placeholder="Short intro for your fans..."
                        className="w-full bg-[#131d33] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {signupRole === "ORGANIZATION" && (
                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/20 space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Legal Registration / License No.</label>
                      <input
                        type="text"
                        value={signupRegNumber}
                        onChange={(e) => setSignupRegNumber(e.target.value)}
                        placeholder="e.g. KL-REG-2024-9988"
                        className="w-full bg-[#131d33] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Role Perk Notification */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2.5 text-xs text-blue-300">
                  {signupRole === "USER" && "🎁 150 Free Welcome Coins will be credited to your new account automatically!"}
                  {signupRole === "CELEBRITY" && "🌟 You will be listed on Celebrity Hub with VIP audio & video calling!"}
                  {signupRole === "ORGANIZATION" && "🎪 You will be authorized to create PostGIS nearby events and sell QR tickets!"}
                </div>

                {loginError && (
                  <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">
                    {loginError}
                  </div>
                )}

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{loginLoading ? "Creating Account..." : "Verify OTP & Register Account"}</span>
                </button>
              </form>
            )}

            <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500">
                Supports Firebase Phone Auth &amp; Twilio SMS. All 5 roles pre-configured for instant one-click login.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* ------------------------------------------------------------- */}
      {/* ROLE 1: NORMAL USER PORTAL */}
      {/* ------------------------------------------------------------- */}
      {activeRole === "USER" && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">
          {/* Sub Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex gap-2">
              {[
                { id: "MATCH", label: "Random Match", icon: Phone },
                { id: "CELEBRITY", label: "Celebrity Hub", icon: Star },
                { id: "EVENTS", label: "Nearby Events", icon: Ticket },
                { id: "CHAT", label: "Messages & Chat", icon: MessageSquare },
                { id: "SUPPORT", label: "Help & Care", icon: Headphones },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = userTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setUserTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      isSelected
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1A. RANDOM FRIEND MATCHMAKING TAB */}
          {userTab === "MATCH" && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-[#0e1628] border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

                <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider mb-4">
                  Matchmaker v1.0
                </span>

                <h2 className="text-3xl font-extrabold text-white mb-2">Connect with Random Friends</h2>
                <p className="text-slate-400 max-w-md text-sm mb-8">
                  Talk instantly with online friends via real-time WebRTC audio or video call. Safe, moderated, and instantaneous.
                </p>

                {/* Mode Switcher: Audio vs Video */}
                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-8">
                  <button
                    onClick={() => !isSearching && setSelectedMediaType("AUDIO")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition ${
                      selectedMediaType === "AUDIO"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    Audio Only
                  </button>
                  <button
                    onClick={() => !isSearching && setSelectedMediaType("VIDEO")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition ${
                      selectedMediaType === "VIDEO"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Two-Way Video
                  </button>
                </div>

                {/* Matchmaking Action Button & Radar Animation */}
                {isSearching ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full bg-blue-500/20 animate-ping absolute" />
                      <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/40">
                        {selectedMediaType === "AUDIO" ? (
                          <Headphones className="w-12 h-12 text-white animate-bounce" />
                        ) : (
                          <Video className="w-12 h-12 text-white animate-bounce" />
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">Looking for an online partner...</p>
                      <p className="text-xs text-blue-400">Waiting in active queue • Position #1</p>
                    </div>
                    <button
                      onClick={handleCancelMatch}
                      className="mt-2 text-rose-400 hover:text-rose-300 text-xs font-semibold px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20"
                    >
                      Cancel Searching
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={handleStartRandomMatch}
                      className="group flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
                    >
                      <Play className="w-12 h-12 text-white fill-white ml-1.5 transition-transform group-hover:scale-110" />
                    </button>
                    <span className="text-slate-300 text-sm font-semibold">Tap to Find Online Friend</span>
                    <span className="text-xs text-slate-500">Instant WebRTC P2P Audio/Video connection</span>
                  </div>
                )}
              </div>

              {/* Sidebar: Online Stats & Rules */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Community Guidelines
                  </h3>
                  <ul className="text-xs text-slate-400 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      Be respectful and kind to everyone on the call.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      Inappropriate behavior results in instant hardware ban by Super Admin.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      End call anytime if you feel uncomfortable.
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-amber-300 text-sm">Want to talk to Celebrities?</h3>
                  </div>
                  <p className="text-xs text-amber-200/80 mb-4">
                    Call verified cinema stars, singers, and creators directly using per-minute coins!
                  </p>
                  <button
                    onClick={() => setUserTab("CELEBRITY")}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition"
                  >
                    Browse Celebrities
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1B. CELEBRITY HUB TAB */}
          {userTab === "CELEBRITY" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Verified Celebrities & Creators</h2>
                <p className="text-slate-400 text-sm">Connect 1-on-1 via direct voice call or video call. Billed per minute from your coin wallet.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {celebrities.map((celeb) => (
                  <div
                    key={celeb.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={celeb.avatarUrl}
                          alt={celeb.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-white text-base">{celeb.name}</h3>
                            <CheckCircle className="w-4 h-4 text-blue-400" />
                          </div>
                          <p className="text-xs text-slate-400">{celeb.category}</p>
                          <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{celeb.rating} Rating</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{celeb.bio}</p>
                    </div>

                    <div className="border-t border-slate-800 pt-4 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Audio Rate:</span>
                        <span className="font-semibold text-amber-400">{celeb.audioRatePerMinCoins} Coins / min</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Video Rate:</span>
                        <span className="font-semibold text-amber-400">{celeb.videoRatePerMinCoins} Coins / min</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-2">
                        <button
                          onClick={() => handleCallCelebrity(celeb, "AUDIO")}
                          className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-2 rounded-xl text-xs transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Audio
                        </button>
                        <button
                          onClick={() => handleCallCelebrity(celeb, "VIDEO")}
                          className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-2 rounded-xl text-xs transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Video
                        </button>
                        <button
                          onClick={() => {
                            setActiveChatPartner({
                              id: celeb.userId,
                              name: celeb.name,
                              role: "CELEBRITY",
                              avatarUrl: celeb.avatarUrl,
                            });
                            setUserTab("CHAT");
                          }}
                          className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-2 rounded-xl text-xs transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1C. NEARBY EVENTS & TICKETING TAB */}
          {userTab === "EVENTS" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Nearby Events & Ticket Passes</h2>
                  <p className="text-slate-400 text-sm">Discovered dynamically using PostGIS geolocation distance queries.</p>
                </div>

                {/* Distance Slider */}
                <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Radius: <span className="text-blue-400">{radiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-32 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {bookingSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  {bookingSuccess}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                    <div className="h-44 relative">
                      <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        {event.distanceKm} km away
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {event.venueName}
                        </p>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{event.description}</p>

                      <div className="space-y-2 border-t border-slate-800 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Ticket Tier</h4>
                        <div className="space-y-2">
                          {event.ticketTiers.map((tier: any) => (
                            <div
                              key={tier.id}
                              className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs"
                            >
                              <div>
                                <span className="font-bold text-white">{tier.name}</span>
                                <span className="text-slate-500 text-[10px] ml-2">({tier.totalQuantity - tier.soldQuantity} left)</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-emerald-400">₹{tier.priceInr}</span>
                                <button
                                  onClick={() => handleBookTicket(event, tier)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                                >
                                  Book Now
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1D. MESSAGES & DIRECT TEXT CHAT TAB */}
          {userTab === "CHAT" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden grid md:grid-cols-3 h-[600px] shadow-2xl">
              {/* Contacts List Column */}
              <div className="border-r border-slate-800 flex flex-col bg-slate-950/40">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-white text-sm">Conversations</h3>
                  </div>
                  <button
                    onClick={() => setIsNewChatOpen(!isNewChatOpen)}
                    className="text-[11px] bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    New Chat
                  </button>
                </div>

                {/* New Chat Dropdown Selector */}
                {isNewChatOpen && (
                  <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start direct chat with:</div>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {celebrities.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            const existing = chatContacts.find((ct) => ct.id === c.userId);
                            if (!existing) {
                              const newCt = {
                                id: c.userId,
                                name: c.name,
                                role: c.category,
                                avatarUrl: c.avatarUrl,
                                badge: "Celebrity",
                                lastMsg: "Tap to chat with celebrity",
                              };
                              setChatContacts([newCt, ...chatContacts]);
                              setActiveChatPartner(newCt);
                            } else {
                              setActiveChatPartner(existing);
                            }
                            setIsNewChatOpen(false);
                          }}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs text-white"
                        >
                          <img src={c.avatarUrl} className="w-6 h-6 rounded-full object-cover" />
                          <span className="truncate">{c.name}</span>
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded ml-auto">VIP</span>
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          const supportCt = chatContacts.find((ct) => ct.id === "usr-104");
                          if (supportCt) setActiveChatPartner(supportCt);
                          setIsNewChatOpen(false);
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs text-white"
                      >
                        <Headphones className="w-5 h-5 text-indigo-400" />
                        <span>Amina (Support Helpdesk)</span>
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded ml-auto">24/7</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                  {chatContacts.map((contact) => {
                    const isSelected = activeChatPartner?.id === contact.id;
                    return (
                      <div
                        key={contact.id}
                        onClick={() => setActiveChatPartner(contact)}
                        className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                          isSelected ? "bg-blue-600/15 border-l-4 border-blue-500" : "hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={contact.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${contact.id}`}
                            alt={contact.name}
                            className="w-11 h-11 rounded-full object-cover border border-slate-700"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-white text-xs truncate">{contact.name}</span>
                            <span className="text-[10px] text-slate-500">{contact.badge}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{contact.lastMsg}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chat Thread & Input Column */}
              <div className="md:col-span-2 flex flex-col bg-slate-900/60">
                {/* Active Partner Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeChatPartner?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      alt={activeChatPartner?.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        {activeChatPartner?.name}
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                      </h4>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Online now • Instant response
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCallCelebrity(celebrities[0] || { userId: activeChatPartner.id }, "AUDIO")}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Audio Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCallCelebrity(celebrities[0] || { userId: activeChatPartner.id }, "VIDEO")}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Bubble Thread */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {directMessages
                    .filter(
                      (m) =>
                        (m.fromUserId === currentUser.id && m.toUserId === activeChatPartner?.id) ||
                        (m.fromUserId === activeChatPartner?.id && m.toUserId === currentUser.id)
                    )
                    .map((msg, idx) => {
                      const isMe = msg.fromUserId === currentUser.id;
                      return (
                        <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-xs leading-relaxed shadow-md ${
                              isMe
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                        </div>
                      );
                    })}
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendDirectMessage} className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950/60">
                  <input
                    type="text"
                    value={directInputText}
                    onChange={(e) => setDirectInputText(e.target.value)}
                    placeholder={`Message ${activeChatPartner?.name}...`}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!directInputText.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2.5 rounded-2xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 1E. HELP & CUSTOMER CARE TAB */}
          {userTab === "SUPPORT" && (
            <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
                  <Headphones className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-white">24/7 Support Desk</h2>
                <p className="text-slate-400 text-xs">Have questions regarding payments, tickets, or abusive users? Request a direct callback.</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Subject of concern..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <textarea
                  placeholder="Explain your issue in detail..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => alert("Ticket filed! Support agent will call you.")}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition"
                >
                  Submit Ticket & Request Callback
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ROLE 2: ORGANIZATION EVENT STUDIO */}
      {/* ------------------------------------------------------------- */}
      {activeRole === "ORGANIZATION" && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Event Organizer Studio</h2>
              <p className="text-slate-400 text-xs">Kerala Beats Entertainment Pvt Ltd • Host events & scan tickets</p>
            </div>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified Event Host
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Create Event Form */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Publish New Event
              </h3>
              <form onSubmit={handleCreateOrgEvent} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newOrgEvent.title}
                    onChange={(e) => setNewOrgEvent({ ...newOrgEvent, title: e.target.value })}
                    placeholder="e.g. South India Music Festival 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Venue Address & Location</label>
                  <input
                    type="text"
                    required
                    value={newOrgEvent.venueName}
                    onChange={(e) => setNewOrgEvent({ ...newOrgEvent, venueName: e.target.value })}
                    placeholder="e.g. Marine Drive Grounds, Kochi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">General Ticket Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newOrgEvent.price}
                    onChange={(e) => setNewOrgEvent({ ...newOrgEvent, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newOrgEvent.description}
                    onChange={(e) => setNewOrgEvent({ ...newOrgEvent, description: e.target.value })}
                    placeholder="Details about musicians, DJs, and food stalls..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition"
                >
                  Publish Event with PostGIS Coordinates
                </button>
              </form>
            </div>

            {/* Gate Scanner Simulator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                Gate QR Ticket Scanner
              </h3>
              <p className="text-xs text-slate-400">Simulate venue gate admission verification.</p>
              <input
                type="text"
                placeholder="Enter or paste QR token..."
                id="gate-qr-input"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById("gate-qr-input") as HTMLInputElement;
                  const res = await fetch(`${BACKEND_URL}/api/events/verify-ticket`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ qrToken: input.value || "TICKET_bkg_1" }),
                  });
                  const d = await res.json();
                  alert(d.message || d.error);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition"
              >
                Scan & Admit Guest
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ROLE 3: CELEBRITY STUDIO */}
      {/* ------------------------------------------------------------- */}
      {activeRole === "CELEBRITY" && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Celebrity Calling Studio</h2>
              <p className="text-slate-400 text-xs">Arjun Das (Actor & Voice Artist) • Control availability and rates</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Status: ONLINE</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Earnings Card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6">
              <h3 className="font-bold text-amber-300 text-sm mb-4">Earnings Ledger</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Total Coins Earned</span>
                  <p className="text-3xl font-extrabold text-amber-400">{celebEarnings?.totalEarnedCoins || 3400} Coins</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Estimated INR Payout (70% rev share)</span>
                  <p className="text-xl font-bold text-emerald-400">₹{celebEarnings?.estimatedInrPayout || "2,380.00"}</p>
                </div>
              </div>
            </div>

            {/* Rates & Settings */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Call Rate Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs text-slate-400 block mb-1">Audio Rate (Coins/min)</label>
                  <input
                    type="number"
                    defaultValue={40}
                    className="w-full bg-transparent font-bold text-lg text-white border-none focus:outline-none"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs text-slate-400 block mb-1">Video Rate (Coins/min)</label>
                  <input
                    type="number"
                    defaultValue={80}
                    className="w-full bg-transparent font-bold text-lg text-white border-none focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => alert("Rate settings updated successfully!")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition"
              >
                Save New Rates
              </button>
            </div>
          </div>

          {/* Fan Direct Messages Inbox for Celebrity */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Fan Text Messages Inbox
              </h3>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full font-semibold">
                VIP Chats
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  fromUserName: "Rahul Nair (+91 98765 43210)",
                  text: "Hey Arjun! Huge fan of your movies and voice dubbing. Can you share some voice acting tips?",
                  time: "10 mins ago",
                },
                {
                  fromUserName: "Ananya Sharma (+91 98111 22334)",
                  text: "Hello sir! Loved your performance in the new release. When is the next fan meetup?",
                  time: "1 hour ago",
                },
              ].map((fanMsg, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{fanMsg.fromUserName}</span>
                      <span className="text-[10px] text-slate-500">{fanMsg.time}</span>
                    </div>
                    <p className="text-xs text-slate-300">{fanMsg.text}</p>
                  </div>
                  <button
                    onClick={() => {
                      const reply = prompt("Type your reply to fan:");
                      if (reply) alert(`Reply sent to ${fanMsg.fromUserName}: "${reply}"`);
                    }}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition self-start md:self-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ROLE 4: CUSTOMER CARE SUPPORT CONSOLE */}
      {/* ------------------------------------------------------------- */}
      {activeRole === "SUPPORT" && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Customer Care Agent Console</h2>
              <p className="text-slate-400 text-xs">Direct WebRTC Outbound Dialer to call users & resolve tickets</p>
            </div>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-semibold">
              Agent: Amina (Support Desk #4)
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-white text-base">Incoming Inquiries & Grievances</h3>
            <div className="space-y-3">
              {supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                        {ticket.priority}
                      </span>
                      <h4 className="font-bold text-white text-sm">{ticket.subject}</h4>
                    </div>
                    <p className="text-xs text-slate-400">{ticket.description}</p>
                    <p className="text-[11px] text-slate-500">From: {ticket.userName} ({ticket.userPhone})</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSupportChatModalUser({ id: ticket.userId, name: ticket.userName, phone: ticket.userPhone })}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-emerald-600/30"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Live Text Chat
                    </button>
                    <button
                      onClick={() => handleAgentCallUser(ticket.userId, "AUDIO")}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-blue-600/30"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Audio
                    </button>
                    <button
                      onClick={() => handleAgentCallUser(ticket.userId, "VIDEO")}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-indigo-600/30"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ROLE 5: SUPER ADMIN GOVERNANCE DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {activeRole === "SUPER_ADMIN" && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Super Admin Command Center</h2>
              <p className="text-slate-400 text-xs">Real-time metrics, platform compliance & user moderation</p>
            </div>
            <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold px-3 py-1 rounded-full">
              Full Governance Access
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", val: adminStats?.totalUsers || 5, color: "text-blue-400" },
              { label: "Active WebRTC Calls", val: adminStats?.activeCallsNow || 0, color: "text-emerald-400" },
              { label: "Coin Circulation", val: `${adminStats?.totalCoinsInCirculation || 5800}c`, color: "text-amber-400" },
              { label: "Tickets GMV", val: `₹${adminStats?.totalTicketGmvInr || 2490}`, color: "text-indigo-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs text-slate-400">{stat.label}</span>
                <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.val}</p>
              </div>
            ))}
          </div>

          {/* User Moderation Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">User Moderation & Bans</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Coins</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="text-slate-300">
                      <td className="py-3 font-semibold text-white">{u.name}</td>
                      <td className="py-3 font-mono text-slate-400">{u.phone}</td>
                      <td className="py-3">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">{u.role}</span>
                      </td>
                      <td className="py-3 text-amber-400 font-semibold">{u.wallet?.coinBalance || 0}</td>
                      <td className="py-3">
                        {u.isBanned ? (
                          <span className="text-rose-400 font-bold">SUSPENDED</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">ACTIVE</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleAdminBanToggle(u.id, u.isBanned)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            u.isBanned
                              ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                              : "bg-rose-600/20 text-rose-400 hover:bg-rose-600/30"
                          }`}
                        >
                          {u.isBanned ? "Revoke Ban" : "Ban Account"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* COIN RECHARGE MODAL */}
      {/* ------------------------------------------------------------- */}
      {isRechargeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-lg">Top-up Coin Wallet</h3>
              </div>
              <button
                onClick={() => setIsRechargeOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { id: "pack-starter", coins: 100, price: 99, tag: "Starter Pack" },
                { id: "pack-silver", coins: 300, price: 249, tag: "Popular (Save 17%)" },
                { id: "pack-gold", coins: 700, price: 499, tag: "Great Value" },
                { id: "pack-vip", coins: 1500, price: 999, tag: "Best Value (Save 33%)" },
              ].map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => handleRecharge(pack.id)}
                  className="flex items-center justify-between bg-slate-950 hover:bg-slate-800/80 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{pack.coins} Coins</span>
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {pack.tag}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">Simulated Razorpay / Stripe</span>
                  </div>
                  <span className="font-bold text-amber-400 text-lg">₹{pack.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DIGITAL QR TICKET MODAL */}
      {/* ------------------------------------------------------------- */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="font-bold text-white text-lg">Your Admission Ticket</h3>
            <p className="text-xs text-slate-400">{activeQrModal.eventTitle} ({activeQrModal.tierName})</p>

            <div className="bg-white p-6 rounded-2xl inline-block mx-auto">
              <QrCode className="w-48 h-48 text-slate-950 mx-auto" />
            </div>

            <p className="text-[11px] font-mono text-slate-400 break-all bg-slate-950 p-2 rounded-lg">
              {activeQrModal.qrToken}
            </p>

            <button
              onClick={() => setActiveQrModal(null)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Done & Save to Pass
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUPPORT AGENT LIVE CHAT MODAL */}
      {/* ------------------------------------------------------------- */}
      {supportChatModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full flex flex-col h-[520px] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                  {supportChatModalUser.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{supportChatModalUser.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{supportChatModalUser.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSupportChatModalUser(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Chat Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 text-xs bg-slate-900/50">
              {directMessages
                .filter(
                  (m) =>
                    (m.fromUserId === currentUser.id && m.toUserId === supportChatModalUser.id) ||
                    (m.fromUserId === supportChatModalUser.id && m.toUserId === currentUser.id)
                )
                .map((msg, idx) => {
                  const isMe = msg.fromUserId === currentUser.id;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-3.5 py-2 rounded-2xl max-w-[80%] leading-relaxed ${
                          isMe ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })}
            </div>

            {/* Modal Chat Input */}
            <form
              onSubmit={(e) => handleSendSupportMessage(supportChatModalUser.id, e)}
              className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950/80"
            >
              <input
                type="text"
                value={supportInputText}
                onChange={(e) => setSupportInputText(e.target.value)}
                placeholder={`Type support reply to ${supportChatModalUser.name}...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!supportInputText.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition flex items-center justify-center shadow-lg shadow-emerald-600/30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
