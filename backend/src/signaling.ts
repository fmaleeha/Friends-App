import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { store } from './store.js';
import { MediaType, CallType } from './types.js';

interface ConnectedSocketInfo {
  userId: string;
  socketId: string;
}

export function setupSignalingGateway(io: Server) {
  const userSocketMap = new Map<string, string>(); // userId -> socketId
  const socketUserMap = new Map<string, string>(); // socketId -> userId
  const activeHeartbeats = new Map<string, NodeJS.Timeout>(); // roomId -> interval

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket Connected] ID: ${socket.id}`);

    // Register active user socket
    socket.on('register', (data: { userId: string }) => {
      const user = store.users.get(data.userId);
      if (user) {
        userSocketMap.set(data.userId, socket.id);
        socketUserMap.set(socket.id, data.userId);
        socket.join(`user:${data.userId}`);
        console.log(`[User Registered] ${user.name} (${user.role}) -> ${socket.id}`);
        socket.emit('registered', { status: 'OK', user });
      }
    });

    // -------------------------------------------------------------
    // 1. RANDOM FRIEND MATCHMAKING (AUDIO & VIDEO)
    // -------------------------------------------------------------
    socket.on('match:join', (data: { userId: string; mediaType: MediaType }) => {
      const user = store.users.get(data.userId);
      if (!user) {
        socket.emit('match:error', { message: 'User not found' });
        return;
      }

      const mediaType = data.mediaType || 'AUDIO';
      const queue = mediaType === 'VIDEO' ? store.videoMatchQueue : store.audioMatchQueue;

      // Filter out stale socket entries or existing self
      const existingIdx = queue.findIndex(item => item.user.id === user.id || item.socketId === socket.id);
      if (existingIdx !== -1) {
        queue.splice(existingIdx, 1);
      }

      // If someone is waiting in the queue
      if (queue.length > 0) {
        const peer = queue.shift()!;
        const roomId = `room_match_${uuidv4()}`;

        // Join both sockets to the room
        socket.join(roomId);
        io.sockets.sockets.get(peer.socketId)?.join(roomId);

        // Store active call
        store.activeCalls.set(roomId, {
          roomId,
          callerId: peer.user.id,
          callerName: peer.user.name,
          receiverId: user.id,
          receiverName: user.name,
          callType: 'RANDOM_FRIEND',
          mediaType,
          startedAt: Date.now(),
        });

        console.log(`[Matched] ${peer.user.name} <==> ${user.name} in ${roomId} (${mediaType})`);

        // Peer 1 is the WebRTC initiator
        io.to(peer.socketId).emit('match:success', {
          roomId,
          peer: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
          mediaType,
          isInitiator: true,
        });

        // Peer 2 responds
        socket.emit('match:success', {
          roomId,
          peer: { id: peer.user.id, name: peer.user.name, avatarUrl: peer.user.avatarUrl },
          mediaType,
          isInitiator: false,
        });
      } else {
        // Enqueue current user
        queue.push({ socketId: socket.id, user });
        socket.emit('match:waiting', {
          queuePosition: queue.length,
          mediaType,
          message: `Looking for online ${mediaType.toLowerCase()} friends...`,
        });
        console.log(`[Queue Enqueued] ${user.name} waiting for ${mediaType} match (Queue size: ${queue.length})`);
      }
    });

    socket.on('match:cancel', (data: { userId: string }) => {
      store.audioMatchQueue = store.audioMatchQueue.filter(item => item.socketId !== socket.id);
      store.videoMatchQueue = store.videoMatchQueue.filter(item => item.socketId !== socket.id);
      socket.emit('match:cancelled', { message: 'Removed from matchmaking queue' });
    });

    // -------------------------------------------------------------
    // 2. WEBRTC SIGNALING (SDP Offer, Answer & ICE Candidates)
    // -------------------------------------------------------------
    socket.on('webrtc:offer', (data: { roomId: string; sdp: any; mediaType: MediaType }) => {
      socket.to(data.roomId).emit('webrtc:offer', {
        sdp: data.sdp,
        senderSocketId: socket.id,
        mediaType: data.mediaType,
      });
    });

    socket.on('webrtc:answer', (data: { roomId: string; sdp: any }) => {
      socket.to(data.roomId).emit('webrtc:answer', {
        sdp: data.sdp,
        senderSocketId: socket.id,
      });
    });

    socket.on('webrtc:ice-candidate', (data: { roomId: string; candidate: any }) => {
      socket.to(data.roomId).emit('webrtc:ice-candidate', {
        candidate: data.candidate,
        senderSocketId: socket.id,
      });
    });

    // -------------------------------------------------------------
    // 3. CELEBRITY CALLS & PER-MINUTE COIN BILLING
    // -------------------------------------------------------------
    socket.on('celebrity:call:initiate', (data: { callerId: string; celebrityUserId: string; mediaType: MediaType }) => {
      const caller = store.users.get(data.callerId);
      const celebUser = store.users.get(data.celebrityUserId);
      const celebProfile = store.celebrities.get(data.celebrityUserId);

      if (!caller || !celebUser || !celebProfile) {
        socket.emit('call:error', { message: 'Celebrity or caller profile not found' });
        return;
      }

      if (celebProfile.availability !== 'ONLINE') {
        socket.emit('call:error', { message: `Celebrity is currently ${celebProfile.availability.toLowerCase()}` });
        return;
      }

      const ratePerMin = data.mediaType === 'VIDEO' ? celebProfile.videoRatePerMinCoins : celebProfile.audioRatePerMinCoins;
      const callerWallet = store.wallets.get(caller.id);

      if (!callerWallet || callerWallet.coinBalance < ratePerMin) {
        socket.emit('call:error', {
          message: `Insufficient coins. You need at least ${ratePerMin} coins for 1 minute of ${data.mediaType.toLowerCase()} call. Current balance: ${callerWallet?.coinBalance || 0}`,
          requiredCoins: ratePerMin,
          currentCoins: callerWallet?.coinBalance || 0,
        });
        return;
      }

      const celebSocketId = userSocketMap.get(celebUser.id);
      const roomId = `room_celeb_${uuidv4()}`;
      socket.join(roomId);

      store.activeCalls.set(roomId, {
        roomId,
        callerId: caller.id,
        callerName: caller.name,
        receiverId: celebUser.id,
        receiverName: celebUser.name,
        callType: 'CELEBRITY_CALL',
        mediaType: data.mediaType,
        startedAt: Date.now(),
        ratePerMin,
      });

      if (celebSocketId && io.sockets.sockets.get(celebSocketId)) {
        io.to(celebSocketId).emit('celebrity:call:incoming', {
          roomId,
          caller: { id: caller.id, name: caller.name, avatarUrl: caller.avatarUrl },
          mediaType: data.mediaType,
          ratePerMin,
        });
        socket.emit('celebrity:call:ringing', { roomId, celebrityName: celebUser.name });
      } else {
        // Celebrity is not actively on websocket; simulate acceptance for testing prototype
        socket.emit('celebrity:call:ringing', { roomId, celebrityName: celebUser.name, simulated: true });
        setTimeout(() => {
          socket.emit('celebrity:call:accepted', {
            roomId,
            celebrity: { id: celebUser.id, name: celebUser.name, avatarUrl: celebUser.avatarUrl },
            mediaType: data.mediaType,
            ratePerMin,
            isInitiator: true,
          });
          startPerMinuteBilling(io, roomId, caller.id, celebUser.id, ratePerMin, activeHeartbeats);
        }, 1500);
      }
    });

    socket.on('celebrity:call:accept', (data: { roomId: string }) => {
      const call = store.activeCalls.get(data.roomId);
      if (!call) return;

      socket.join(data.roomId);
      socket.emit('celebrity:call:accepted', {
        roomId: data.roomId,
        peer: { id: call.callerId, name: call.callerName },
        mediaType: call.mediaType,
        ratePerMin: call.ratePerMin,
        isInitiator: false,
      });

      socket.to(data.roomId).emit('celebrity:call:connected', {
        roomId: data.roomId,
        isInitiator: true,
      });

      startPerMinuteBilling(io, data.roomId, call.callerId, call.receiverId, call.ratePerMin || 30, activeHeartbeats);
    });

    // -------------------------------------------------------------
    // 4. CUSTOMER CARE SUPPORT CALLS (INBOUND & OUTBOUND)
    // -------------------------------------------------------------
    socket.on('support:call:user', (data: { agentId: string; targetUserId: string; mediaType: MediaType; ticketId?: string }) => {
      const agent = store.users.get(data.agentId);
      const targetUser = store.users.get(data.targetUserId);

      if (!agent || !targetUser) {
        socket.emit('call:error', { message: 'Agent or target user not found' });
        return;
      }

      const roomId = `room_support_${uuidv4()}`;
      socket.join(roomId);

      store.activeCalls.set(roomId, {
        roomId,
        callerId: agent.id,
        callerName: agent.name,
        receiverId: targetUser.id,
        receiverName: targetUser.name,
        callType: 'SUPPORT_CALL',
        mediaType: data.mediaType,
        startedAt: Date.now(),
      });

      const userSocketId = userSocketMap.get(targetUser.id);
      if (userSocketId && io.sockets.sockets.get(userSocketId)) {
        io.to(userSocketId).emit('support:call:incoming', {
          roomId,
          agent: { id: agent.id, name: agent.name, role: agent.role },
          mediaType: data.mediaType,
          ticketId: data.ticketId,
        });
        socket.emit('support:call:ringing', { roomId, userName: targetUser.name });
      } else {
        // Target user not connected; simulate connection for prototype demo
        socket.emit('support:call:ringing', { roomId, userName: targetUser.name, note: 'User notified via VoIP Push' });
        setTimeout(() => {
          socket.emit('support:call:accepted', {
            roomId,
            user: { id: targetUser.id, name: targetUser.name },
            mediaType: data.mediaType,
            isInitiator: true,
          });
        }, 1500);
      }
    });

    socket.on('support:call:accept', (data: { roomId: string }) => {
      const call = store.activeCalls.get(data.roomId);
      if (!call) return;

      socket.join(data.roomId);
      socket.emit('support:call:accepted', {
        roomId: data.roomId,
        peer: { id: call.callerId, name: call.callerName },
        mediaType: call.mediaType,
        isInitiator: false,
      });
      socket.to(data.roomId).emit('support:call:connected', { roomId: data.roomId });
    });

    // -------------------------------------------------------------
    // 5. REAL-TIME TEXT MESSAGING (IN-CALL & DIRECT CHAT)
    // -------------------------------------------------------------
    socket.on('chat:room:send', (data: { roomId: string; senderId: string; senderName: string; text: string }) => {
      const newMsg = {
        id: `msg_${uuidv4()}`,
        roomId: data.roomId,
        fromUserId: data.senderId,
        fromUserName: data.senderName,
        text: data.text,
        timestamp: new Date().toISOString(),
      };
      store.chatMessages.push(newMsg);
      io.to(data.roomId).emit('chat:room:message', newMsg);
      console.log(`[Room Chat] ${data.senderName} in ${data.roomId}: "${data.text}"`);
    });

    socket.on('chat:direct:send', (data: { fromUserId: string; fromUserName: string; toUserId: string; text: string }) => {
      const newMsg = {
        id: `msg_${uuidv4()}`,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        toUserId: data.toUserId,
        text: data.text,
        timestamp: new Date().toISOString(),
      };
      store.chatMessages.push(newMsg);

      // Deliver to recipient and sender
      io.to(`user:${data.toUserId}`).emit('chat:direct:message', newMsg);
      io.to(`user:${data.fromUserId}`).emit('chat:direct:message', newMsg);
      console.log(`[Direct Chat] ${data.fromUserName} -> ${data.toUserId}: "${data.text}"`);
    });

    // -------------------------------------------------------------
    // 6. CALL TERMINATION & CLEANUP
    // -------------------------------------------------------------
    socket.on('call:end', (data: { roomId: string; reason?: string }) => {
      endCallSession(io, data.roomId, data.reason || 'User hung up', activeHeartbeats);
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        userSocketMap.delete(userId);
        socketUserMap.delete(socket.id);
      }
      store.audioMatchQueue = store.audioMatchQueue.filter(item => item.socketId !== socket.id);
      store.videoMatchQueue = store.videoMatchQueue.filter(item => item.socketId !== socket.id);
      console.log(`[Socket Disconnected] ID: ${socket.id}`);
    });
  });
}

function startPerMinuteBilling(
  io: Server,
  roomId: string,
  callerId: string,
  celebId: string,
  ratePerMin: number,
  activeHeartbeats: Map<string, NodeJS.Timeout>
) {
  // Clear any existing heartbeat
  if (activeHeartbeats.has(roomId)) {
    clearInterval(activeHeartbeats.get(roomId)!);
  }

  // Deduct first minute upfront
  deductCoinsForCall(io, roomId, callerId, celebId, ratePerMin);

  // Interval for subsequent minutes (every 60 seconds)
  const timer = setInterval(() => {
    const success = deductCoinsForCall(io, roomId, callerId, celebId, ratePerMin);
    if (!success) {
      endCallSession(io, roomId, 'Coins exhausted. Please recharge your wallet.', activeHeartbeats);
    }
  }, 60 * 1000);

  activeHeartbeats.set(roomId, timer);
}

function deductCoinsForCall(io: Server, roomId: string, callerId: string, celebId: string, rate: number): boolean {
  const callerWallet = store.wallets.get(callerId);
  const celebWallet = store.wallets.get(celebId);
  const celebProfile = store.celebrities.get(celebId);

  if (!callerWallet || callerWallet.coinBalance < rate) {
    return false;
  }

  callerWallet.coinBalance -= rate;
  callerWallet.transactions.unshift({
    id: `tx_${uuidv4()}`,
    walletId: callerWallet.id,
    coins: -rate,
    type: 'CALL_DEDUCTION',
    description: `Celebrity Call per-minute deduction (${rate} coins)`,
    createdAt: new Date().toISOString(),
  });

  if (celebWallet) {
    celebWallet.coinBalance += rate;
    celebWallet.transactions.unshift({
      id: `tx_${uuidv4()}`,
      walletId: celebWallet.id,
      coins: rate,
      type: 'CELEB_EARNING',
      description: `Earnings from user audio/video call`,
      createdAt: new Date().toISOString(),
    });
  }

  if (celebProfile) {
    celebProfile.totalEarnedCoins += rate;
  }

  // Broadcast updated balance to caller and celebrity
  io.to(`user:${callerId}`).emit('wallet:update', {
    coinBalance: callerWallet.coinBalance,
    deducted: rate,
    message: `${rate} coins deducted for active call`,
  });

  io.to(`user:${celebId}`).emit('wallet:update', {
    coinBalance: celebWallet?.coinBalance || 0,
    earned: rate,
    message: `${rate} coins received from live call`,
  });

  console.log(`[Wallet Billing] Deducted ${rate} coins from ${callerId}, remaining: ${callerWallet.coinBalance}`);
  return true;
}

function endCallSession(io: Server, roomId: string, reason: string, activeHeartbeats: Map<string, NodeJS.Timeout>) {
  if (activeHeartbeats.has(roomId)) {
    clearInterval(activeHeartbeats.get(roomId)!);
    activeHeartbeats.delete(roomId);
  }

  const call = store.activeCalls.get(roomId);
  if (call) {
    store.activeCalls.delete(roomId);
  }

  io.to(roomId).emit('call:ended', { roomId, reason });
  console.log(`[Call Ended] Room: ${roomId}, Reason: ${reason}`);
}
