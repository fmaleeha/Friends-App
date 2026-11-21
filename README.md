# Friends App — Multi-Platform Voice & Video Social Platform

A production-ready multi-platform social ecosystem featuring **Random Audio/Video Friend Matchmaking**, **Celebrity Premium Calling with Per-Minute Wallet Coins**, **Location-based Event Discovery & Ticketing**, **Customer Care WebRTC Dialer**, and **Super Admin Governance**.

---

## 🏗️ Monorepo Architecture

```
Friends App/
├── backend/                  # NestJS / Node.js API + Socket.io WebRTC Signaling Gateway
│   ├── src/
│   │   ├── routes/           # Auth (OTP), Events (PostGIS), Celebrities, Wallet, Admin, Support
│   │   ├── signaling.ts      # WebRTC signaling, match queues, per-minute billing heartbeat
│   │   ├── store.ts          # State store & Haversine spatial calculations
│   │   ├── types.ts          # Multi-role domain models
│   │   └── index.ts          # Express & Socket.io server bootstrap
│   └── prisma/
│       └── schema.prisma     # Complete PostgreSQL + PostGIS schema with 5 roles
│
├── web/                      # Next.js 15 (React 19 + Tailwind CSS) Web Application
│   ├── src/app/
│   │   ├── page.tsx          # Interactive 5-Role Switcher & full WebRTC Audio/Video client
│   │   ├── globals.css       # Dark theme styling
│   │   └── layout.tsx        # Responsive viewport layout
│   └── package.json
│
├── mobile-android/           # Native Android (Kotlin + Jetpack Compose)
│   ├── app/src/main/
│   │   ├── java/com/friendsapp/
│   │   │   ├── ui/screens/   # MatchScreen, CallScreen, CelebrityScreen, EventsScreen
│   │   │   ├── webrtc/       # WebRtcManager (PeerConnection & Tracks)
│   │   │   ├── telecom/      # ConnectionService (Native incoming phone call ringing)
│   │   │   └── MainActivity.kt
│   │   └── AndroidManifest.xml # Camera, Mic, Telecom & Location permissions
│   └── build.gradle.kts
│
└── mobile-ios/               # Native iOS (Swift + SwiftUI)
    ├── FriendsApp/
    │   ├── Views/            # MatchView, ActiveCallView, CelebrityView, EventsView
    │   ├── WebRTC/           # WebRTCManager (RTCPeerConnection & Streams)
    │   ├── CallKit/          # CallKitManager (CXProvider for lock-screen incoming ringing)
    │   ├── Info.plist        # Permissions & VoIP background modes
    │   └── FriendsAppApp.swift
    └── FriendsApp.xcodeproj  # Standard Xcode Project definition
```

---

## 👥 The 5 Core Stakeholder Roles

1. **Normal User (`USER`)**:
   - Mobile OTP login.
   - 1-on-1 Random Friend Matchmaking via real-time WebRTC Audio or Video.
   - Call Celebrities using per-minute Coin Wallet deduction.
   - Location-based event discovery within GPS radius; book tickets with digital QR passes.
   - Contact 24/7 Customer Care via live audio/video.

2. **Organization / Company (`ORGANIZATION`)**:
   - Event creation studio with PostGIS GPS coordinates, multiple ticket tiers, and pricing.
   - Gate Admission QR Ticket Scanner simulator.

3. **Celebrity (`CELEBRITY`)**:
   - Availability toggle (Online, Busy, Offline, DND).
   - Custom per-minute coin rate settings for Audio vs Video.
   - Real-time earnings ledger with estimated INR payout (70% revenue share).

4. **Customer Care Support (`SUPPORT`)**:
   - Grievance ticket queue.
   - One-Click WebRTC Outbound Dialer to call user's mobile or web app directly.

5. **Super Admin (`SUPER_ADMIN`)**:
   - Live platform KPIs: Active calls, GMV, tickets sold, coin circulation.
   - User moderation: Instant account suspension/bans.

---

## 🚀 Quickstart Guide

### 1. Run Backend Server
```bash
cd backend
npm install
npm run build
npm start
# Runs on http://localhost:4000 (REST API) and ws://localhost:4000 (Signaling)
```

### 2. Run Web Application
```bash
cd web
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

### 3. Open Native Android App
- Open `mobile-android` folder in **Android Studio** (Ladybug / Iguana or later).
- Gradle sync and run on any Android Emulator or physical device (Android 8.0+ / API 26+).

### 4. Open Native iOS App
- Open `mobile-ios/FriendsApp.xcodeproj` in **Xcode 15+**.
- Select target simulator (iPhone 15 / 16) and press **Cmd + R**.
