# WhatsApp System Design - Complete Guide

## 📋 Table of Contents
1. [Problem Statement](#problem-statement)
2. [Requirements Gathering](#requirements-gathering)
3. [Capacity Estimation](#capacity-estimation)
4. [High-Level Design](#high-level-design)
5. [Detailed Design](#detailed-design)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Message Delivery Flow](#message-delivery-flow)
9. [Scalability & Performance](#scalability--performance)
10. [Security Considerations](#security-considerations)
11. [Monitoring & Analytics](#monitoring--analytics)

---

## 🎯 Problem Statement

**WhatsApp** ek real-time messaging platform hai jo users ko instant messaging, group chats, media sharing, aur voice/video calls ki facility deta hai. System ko low latency, high availability, aur massive scale handle karna hota hai.

**Use Cases:**
- 1:1 private messaging between users
- Group chats with multiple participants
- Media sharing (images, videos, documents, audio)
- Voice and video calls
- Status updates (stories)
- Message delivery status (sent, delivered, read)
- Last seen / online presence
- End-to-end encryption

**Example:**
- User A sends message to User B
- Message instantly delivered if B is online
- If B is offline, message queued and delivered via push notification
- B receives message, reads it
- A gets read receipt

---

## 📝 Requirements Gathering

### Functional Requirements

#### 1. **1:1 Messaging**
   - Users can send text messages to each other
   - Real-time message delivery
   - Message delivery status (sent, delivered, read)
   - Message timestamps
   - Message threading/conversation view
   - Message search functionality

#### 2. **Group Messaging**
   - Create groups with multiple members (up to 256 members)
   - Send messages to all group members
   - Group admin management
   - Add/remove members
   - Group settings (description, photo, etc.)
   - Group message delivery status per member

#### 3. **Media Sharing**
   - Send images (with compression)
   - Send videos (with compression)
   - Send audio files (voice messages)
   - Send documents (PDF, DOCX, etc.)
   - Send location
   - Send contacts
   - Media preview generation
   - Media storage and retrieval

#### 4. **Message Status**
   - Single tick (✓): Sent to server
   - Double tick (✓✓): Delivered to recipient device
   - Blue double tick (✓✓): Read by recipient
   - Real-time status updates

#### 5. **Presence & Last Seen**
   - Online/offline status
   - Last seen timestamp
   - Privacy controls (who can see last seen)
   - Typing indicators

#### 6. **Voice & Video Calls**
   - 1:1 voice calls
   - 1:1 video calls
   - Group voice calls
   - Group video calls
   - Call quality management
   - Call history

#### 7. **Status Updates (Stories)**
   - Share status updates (text, image, video)
   - Status visible for 24 hours
   - View who saw your status
   - Privacy controls

#### 8. **User Management**
   - User registration (phone number based)
   - User authentication (OTP verification)
   - Profile management (name, photo, bio)
   - Block/unblock users
   - Privacy settings

#### 9. **Notifications**
   - Push notifications for offline messages
   - Notification settings per chat/group
   - Silent hours
   - Notification badges

#### 10. **Message Features**
   - Reply to specific messages
   - Forward messages
   - Delete messages (for everyone)
   - Star/favorite messages
   - Message reactions (emoji)
   - Message search

### Non-Functional Requirements

1. **Low Latency**: 
   - Message delivery: < 100ms (online users)
   - Typing indicators: < 50ms
   - Status updates: < 200ms

2. **High Availability**: 
   - 99.99% uptime
   - No single point of failure
   - Graceful degradation

3. **Scalability**: 
   - Support 2+ billion users
   - Handle 100+ billion messages per day
   - Support millions of concurrent connections
   - Handle peak traffic (10x normal)

4. **Consistency**: 
   - Message ordering guaranteed
   - No duplicate messages
   - Eventual consistency acceptable for presence

5. **Durability**: 
   - No message loss
   - Backup and replication
   - Disaster recovery

6. **Security**: 
   - End-to-end encryption
   - Secure authentication
   - Rate limiting
   - Spam prevention
   - Data privacy compliance

7. **Performance**: 
   - Support large group chats (256 members)
   - Efficient media compression
   - CDN for media delivery
   - Efficient database queries

---

## 📊 Capacity Estimation

### Traffic Estimates

**Assumptions:**
- 2 billion active users
- Average 50 messages per user per day
- 100 billion messages per day
- 10:1 read/write ratio (users read more than they send)
- Average message size: 100 bytes (text)
- Average media message size: 500 KB
- 20% of messages are media
- Peak traffic: 10x average (during festivals, events)

### Storage Estimates

**Per Message (Text Only):**
- Message content: 100 bytes average
- Metadata (messageId, senderId, receiverId, timestamp, status, etc.): 200 bytes
- Total: ~300 bytes per text message

**Per Message (With Media):**
- Message metadata: 200 bytes
- Media file: 500 KB average
- Thumbnail: 50 KB
- Total: ~550 KB per media message

**For 5 years:**
- 100B messages/day × 365 days × 5 years = 182.5 trillion messages
- Text only (80%): 182.5T × 0.8 × 300 bytes = ~44 PB
- With media (20%): 182.5T × 0.2 × 550 KB = ~20,000 PB
- **Total storage: ~20,044 PB**

### Bandwidth Estimates

**Write requests (messages sent):**
- 100B messages/day = 1.16M messages/second
- Average: 1.16M × 300 bytes = ~348 MB/s (text only)
- With media: 1.16M × 0.2 × 550 KB = ~127 GB/s
- **Total write bandwidth: ~127 GB/s**

**Read requests (messages received):**
- 1 trillion reads/day = 11.6M reads/second
- Average: 11.6M × 300 bytes = ~3.5 GB/s (text)
- With media: 11.6M × 0.2 × 550 KB = ~1.3 TB/s
- **Total read bandwidth: ~1.3 TB/s**

### Server Requirements

**Application Servers:**
- Write QPS: 1.16M/second
- Read QPS: 11.6M/second
- Each server can handle: ~10,000 concurrent WebSocket connections
- Each server can handle: ~50,000 QPS
- **Need: ~250-300 application servers**

**Database:**
- Write: 1.16M writes/second
- Read: 11.6M reads/second (mostly from cache)
- Database reads: ~1.16M/second (90% cache hit rate)
- **Need: Distributed database with sharding**

**Cache:**
- Active conversations: Top 20% = 40B conversations
- Average conversation size: 100 messages × 300 bytes = 30 KB
- **Cache size needed: ~1.2 PB**

**Media Storage:**
- 20B media messages/day × 550 KB = 11 PB/day
- **Need: Object storage (S3-like) with CDN**

---

## 🏗️ High-Level Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  (Mobile Apps: iOS, Android, Web App)                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ WebSocket / HTTP
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Load Balancer                             │
│            (Nginx/HAProxy/AWS ELB)                         │
└───────────┬───────────────────────────────┬────────────────┘
            │                               │
            │ Round-robin / Least-conn      │
            ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   WebSocket Server 1 │      │   WebSocket Server 2 │
│   (Node.js/Socket.io)│      │   (Node.js/Socket.io)│
└──────────┬───────────┘      └──────────┬───────────┘
            │                             │
            └──────────────┬───────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Server Layer                       │
│                                                             │
│  - Message Service                                          │
│  - Group Service                                            │
│  - Media Service                                            │
│  - Presence Service                                         │
│  - Notification Service                                     │
│  - User Service                                             │
└───────────┬───────────────────────────────┬────────────────┘
            │                               │
            │                               │
    ┌───────┴───────┐           ┌──────────┴──────────┐
    │               │           │                     │
    ▼               ▼           ▼                     ▼
┌─────────┐  ┌─────────┐  ┌──────────┐      ┌──────────────┐
│  Redis  │  │Cassandra │  │Object    │      │   CDN        │
│  Cache  │  │Database  │  │Storage   │      │  (CloudFront)│
│         │  │          │  │(S3-like) │      │              │
│ Active  │  │Messages  │  │Media     │      │Media Files   │
│ Users   │  │Metadata  │  │Files     │      │Cached Content│
│ Presence│  │Groups    │  │Thumbnails│      │              │
│ Pub/Sub │  │Users     │  │          │      │              │
└─────────┘  └─────────┘  └──────────┘      └──────────────┘
```

### Components

1. **Load Balancer**
   - Traffic distribute karta hai multiple WebSocket servers mein
   - Sticky sessions for WebSocket connections
   - Health checks
   - SSL termination

2. **WebSocket Servers**
   - Persistent connections maintain karte hain
   - Real-time message delivery
   - Connection management
   - Heartbeat/ping-pong for connection health

3. **Message Service**
   - Message routing logic
   - Message persistence
   - Message delivery status management
   - Message ordering

4. **Group Service**
   - Group creation and management
   - Member management
   - Group metadata
   - Group message fan-out

5. **Media Service**
   - Media upload handling
   - Media compression
   - Thumbnail generation
   - Media storage management

6. **Presence Service**
   - Online/offline status
   - Last seen tracking
   - Typing indicators
   - Real-time presence updates

7. **Notification Service**
   - Push notification management
   - Offline message queuing
   - Notification preferences

8. **Database (Cassandra)**
   - Messages storage (sharded by chatId)
   - User metadata
   - Group metadata
   - Message indexes

9. **Cache (Redis)**
   - Active user sessions
   - Recent messages (hot data)
   - Presence information
   - Pub/Sub for cross-server communication

10. **Object Storage (S3-like)**
    - Media files (images, videos, documents)
    - Thumbnails
    - Profile pictures
    - Status updates

11. **CDN**
    - Media file delivery
    - Global distribution
    - Reduced latency

---

## 🔧 Detailed Design

> **📝 Interview Note:** Yahan flows interview ke liye optimize kiye gaye hain - concise, clear, aur easy-to-explain format mein. Har flow mein key decision points, trade-offs, aur scalability considerations highlight kiye gaye hain.

### Interview Flow: Message Delivery (1:1 Chat) - Most Important

**Scenario:** User A sends message "Hello" to User B

```
Step 1: Client → Server
├─ User A types message and hits send
├─ Client encrypts message (E2E encryption)
├─ WebSocket sends: {to: userId_B, content: "Hello", type: "text"}
└─ Load balancer routes to WebSocket server (sticky session)

Step 2: Server Validation
├─ Authenticate User A (JWT token)
├─ Validate User B exists
├─ Check if B has blocked A
└─ Generate unique messageId

Step 3: Persist Message
├─ Store in Cassandra (sharded by chatId = userId_A_userId_B)
├─ Status: "SENT"
├─ Timestamp: NOW()
└─ Cache recent message in Redis (TTL: 1 hour)

Step 4: Send ACK to Sender
├─ Emit to User A: message_sent_ack {messageId, status: "SENT"}
└─ UI shows single tick (✓)

Step 5: Check Recipient Status
├─ Query Redis: user:{userId_B}:status
├─ If ONLINE: Get connection info (server_id, socket_id)
└─ If OFFLINE: Queue message (Step 7)

Step 6: Deliver to Online User
├─ Find User B's WebSocket connection
├─ If same server: Direct emit
├─ If different server: Redis Pub/Sub → Server 2 → Emit
├─ Emit: receive_message {from: userId_A, content, messageId}
└─ Update status to "DELIVERED" in DB

Step 7: Queue for Offline User
├─ LPUSH offline_queue:{userId_B} message_data
├─ Send push notification (FCM/APNS)
└─ When B comes online: Deliver queued messages

Step 8: Delivery ACK
├─ User B receives message
├─ Client sends: message_delivered_ack {messageId}
├─ Server updates status: "DELIVERED"
└─ Notify User A: double tick (✓✓)

Step 9: Read Receipt
├─ User B opens chat and reads message
├─ Client sends: message_read_ack {messageId}
├─ Server updates status: "READ"
└─ Notify User A: blue double tick (✓✓)

Key Design Decisions:
✓ Why WebSocket? Real-time bidirectional communication
✓ Why Cassandra? Horizontal scaling, write-heavy workload
✓ Why Redis? Fast presence lookup, pub/sub for cross-server
✓ Why shard by chatId? Even distribution, maintain ordering
✓ Trade-off: Eventual consistency for presence (acceptable)
```

### Interview Flow: Group Message Delivery

**Scenario:** User A sends message to Group with 100 members

```
Step 1: Message Received
├─ User A sends group message
├─ Server validates A is group member
└─ Generate messageId

Step 2: Store Message
├─ Insert into messages table (1 record)
├─ Insert into group_messages table (100 records - one per member)
├─ Status: "SENT" for all members
└─ Batch insert for efficiency

Step 3: Fan-out Strategy
├─ Get group members from cache (Redis) or DB
├─ For each member:
│  ├─ Check online status (Redis lookup - O(1))
│  ├─ If online: Add to delivery queue
│  └─ If offline: Queue message
└─ Parallel processing (async/await)

Step 4: Cross-Server Delivery
├─ Group members on different servers
├─ Use Redis Pub/Sub:
│  ├─ Publish to channel: server:{serverId}:messages
│  └─ Each server subscribes to its channel
└─ Server delivers to its connected users

Step 5: Status Tracking
├─ Track delivered/read per member (async)
├─ Update group_messages table
└─ Notify sender of delivery status

Key Design Decisions:
✓ Why batch insert? Reduce DB round trips
✓ Why Redis Pub/Sub? Decouple servers, scalable fan-out
✓ Why async status updates? Don't block message delivery
✓ Trade-off: More storage (group_messages table) for faster queries
```

### Interview Flow: User Registration & OTP

**Scenario:** New user registers with phone number

```
Step 1: Registration Request
├─ POST /api/auth/register
├─ Payload: {phoneNumber: "+1234567890", name: "John"}
└─ Rate limiting: 3 requests/hour per IP

Step 2: Validate & Generate OTP
├─ Validate phone format (E.164)
├─ Check if already registered
├─ Generate 6-digit OTP
├─ Store in Redis: otp:{phoneNumber} = "123456"
└─ TTL: 5 minutes, max 3 attempts

Step 3: Send OTP
├─ Call SMS service (Twilio/AWS SNS)
├─ SMS: "Your WhatsApp code: 123456"
└─ Log delivery status

Step 4: Verify OTP
├─ POST /api/auth/verify-otp
├─ Compare OTP from Redis
├─ Check expiration & attempts
└─ If valid: Create user account

Step 5: Create Account
├─ Insert into users table
├─ Generate userId
├─ Create JWT token (7 days expiry)
└─ Return token to client

Key Design Decisions:
✓ Why Redis for OTP? Fast lookup, auto-expiration
✓ Why 5 min TTL? Balance security and UX
✓ Why rate limiting? Prevent abuse, SMS cost control
✓ Trade-off: SMS cost vs security (OTP is industry standard)
```

### Interview Flow: WebSocket Connection & Presence

**Scenario:** User opens app and comes online

```
Step 1: Establish Connection
├─ Client connects: wss://whatsapp.com/ws
├─ Authenticate with JWT token
└─ Server validates token

Step 2: Register Presence
├─ Redis SET: user:{userId}:status = "online"
├─ Redis SET: user:{userId}:server_id = "server_1"
├─ Redis SET: user:{userId}:connection_id = "socket_123"
├─ Redis SET: user:{userId}:last_seen = timestamp
└─ TTL: 5 minutes (heartbeat)

Step 3: Join Rooms
├─ Get user's chats from DB
├─ socket.join(`chat:${chatId}`) for each chat
├─ Get user's groups
└─ socket.join(`group:${groupId}`) for each group

Step 4: Load Offline Messages
├─ Check Redis: offline_queue:{userId}
├─ Deliver queued messages via WebSocket
└─ Delete from queue after delivery

Step 5: Notify Contacts
├─ Get contact list
├─ For each contact: Check if online
├─ If online: Emit presence_update via Pub/Sub
└─ Cross-server notification via Redis Pub/Sub

Step 6: Heartbeat
├─ Client sends ping every 30 seconds
├─ Server responds pong
├─ Update last_seen, reset TTL
└─ If no ping for 5 min: Mark offline

Key Design Decisions:
✓ Why WebSocket? Persistent connection, low latency
✓ Why Redis for presence? Fast lookup, TTL for auto-cleanup
✓ Why heartbeat? Detect dead connections
✓ Why Pub/Sub? Cross-server presence updates
✓ Trade-off: Memory usage vs real-time updates
```

### Interview Flow: Media Upload & Delivery

**Scenario:** User sends image to another user

```
Step 1: Upload Media
├─ POST /api/media/upload
├─ Multipart form: {file: image.jpg, chatId: userId_B}
├─ Validate: size < 16MB, type whitelist
└─ Rate limiting

Step 2: Process Media
├─ Compress image (if > 1MB)
├─ Generate thumbnail (200x200)
├─ Extract metadata (dimensions, size)
└─ Optimize for mobile

Step 3: Upload to Storage
├─ Upload original to S3: media/{userId}/{mediaId}.jpg
├─ Upload thumbnail to S3: thumbnails/{userId}/{mediaId}.jpg
├─ Get CDN URLs
└─ Store metadata in DB

Step 4: Create Message
├─ Insert into messages table
├─ message_type: "IMAGE"
├─ media_url: CDN URL
├─ thumbnail_url: CDN URL
└─ status: "SENT"

Step 5: Deliver Message
├─ Check recipient online status
├─ If online: Emit via WebSocket (include thumbnail_url)
├─ If offline: Queue + push notification
└─ Client shows thumbnail immediately, lazy loads full image

Key Design Decisions:
✓ Why S3? Scalable, durable, cost-effective
✓ Why CDN? Global distribution, low latency
✓ Why thumbnail? Fast preview, reduce bandwidth
✓ Why lazy loading? Better UX, save bandwidth
✓ Trade-off: Storage cost vs user experience
```

### Interview Flow: Group Creation

**Scenario:** User creates group with 10 members

```
Step 1: Create Group
├─ POST /api/groups
├─ Payload: {name: "Family", members: [id1...id10]}
└─ Validate: user is authenticated, members exist

Step 2: Store Group
├─ Insert into groups table
│  ├─ group_id (UUID)
│  ├─ name, description
│  └─ created_by
└─ Return group_id

Step 3: Add Members
├─ Batch insert into group_members table
├─ Creator as admin, others as members
└─ Update Redis cache: group:{groupId}:members

Step 4: Create Chat Room
├─ Create Redis room: group:{groupId}
├─ Add all members to room
└─ Cache group metadata

Step 5: Notify Members
├─ For each member:
│  ├─ Check online status
│  ├─ If online: Emit group_created event
│  └─ If offline: Push notification
└─ Use Pub/Sub for cross-server

Key Design Decisions:
✓ Why batch insert? Reduce DB round trips
✓ Why Redis room? Fast message fan-out
✓ Why Pub/Sub? Cross-server notifications
✓ Trade-off: Immediate notification vs eventual consistency
```

### Interview Flow: Offline Message Queue

**Scenario:** User B is offline when message arrives

```
Step 1: Detect Offline User
├─ Check Redis: user:{userId_B}:status = "offline"
└─ Message cannot be delivered immediately

Step 2: Queue Message
├─ LPUSH offline_queue:{userId_B} message_data
├─ Store message in DB (already done)
├─ Set expiration: 30 days
└─ Message queued for delivery

Step 3: Send Push Notification
├─ Get user's device tokens (FCM/APNS)
├─ Send push: "User A: Hello"
├─ Include message preview (if privacy allows)
└─ User gets notification

Step 4: User Comes Online
├─ WebSocket connection established
├─ Client requests: get_offline_messages
└─ Server processes queue

Step 5: Deliver Queued Messages
├─ Get all from offline_queue:{userId_B}
├─ Deliver via WebSocket in order
├─ Delete from queue after delivery
└─ Update delivery status in DB

Key Design Decisions:
✓ Why Redis queue? Fast, supports expiration
✓ Why 30 days TTL? Balance storage and delivery guarantee
✓ Why push notification? Alert user even when offline
✓ Trade-off: Storage cost vs message delivery guarantee
```

---

## 📋 Interview Flow Summary (Quick Reference)

### Core Flows to Remember:

1. **Message Delivery (1:1)**
   - WebSocket → Validate → Store → Check Presence → Deliver/Queue → ACK → Read Receipt

2. **Group Message**
   - Validate → Store (batch) → Fan-out (Pub/Sub) → Deliver → Track Status

3. **User Registration**
   - Validate → Generate OTP → Send SMS → Verify → Create Account → Return Token

4. **WebSocket Connection**
   - Authenticate → Register Presence → Join Rooms → Load Offline → Heartbeat

5. **Media Upload**
   - Validate → Process → Upload S3 → Create Message → Deliver

### Key Technologies:
- **WebSocket**: Real-time communication
- **Cassandra**: Message storage (sharded)
- **Redis**: Presence, cache, pub/sub, queues
- **S3 + CDN**: Media storage and delivery
- **Pub/Sub**: Cross-server communication

### Scalability Considerations:
- Shard by chatId for even distribution
- Use Redis for hot data (presence, cache)
- Batch operations for groups
- Async processing for non-critical updates
- CDN for global media delivery

---

## 🎤 Interview Preparation Guide

### Common Interview Questions & Answers

#### Q1: How will you handle 1:1 message delivery?

**Answer:**
```
1. User A sends message via WebSocket
2. Server validates and stores in Cassandra (sharded by chatId)
3. Check User B's presence in Redis
4. If online: Deliver via WebSocket (same server or Pub/Sub if different server)
5. If offline: Queue in Redis + send push notification
6. When B comes online: Deliver queued messages
7. Track delivery status: SENT → DELIVERED → READ
```

**Key Points:**
- WebSocket for real-time delivery
- Redis for presence lookup (O(1))
- Cassandra for message storage (sharded)
- Redis Pub/Sub for cross-server communication
- Offline queue for reliability

#### Q2: How will you handle group messages with 256 members?

**Answer:**
```
1. Store message once in messages table
2. Batch insert into group_messages table (one row per member)
3. Get group members from cache (Redis) or DB
4. Fan-out using Redis Pub/Sub:
   - Publish to each server's channel
   - Each server delivers to its connected users
5. Parallel processing for efficiency
6. Async status updates (don't block delivery)
```

**Key Points:**
- Batch operations for efficiency
- Redis Pub/Sub for scalable fan-out
- Parallel processing
- Async status tracking
- Trade-off: More storage for faster queries

#### Q3: How will you ensure message ordering?

**Answer:**
```
1. Use sequence numbers per chat
2. Shard by chatId (same chat → same shard)
3. Client sorts by sequence number
4. Server ensures sequential writes within shard
5. For cross-shard: Use distributed locks or timestamps
```

**Key Points:**
- Sequence numbers per chat
- Sharding by chatId maintains ordering
- Client-side sorting as fallback
- Timestamps for cross-shard ordering

#### Q4: How will you handle offline users?

**Answer:**
```
1. Check presence in Redis before delivery
2. If offline:
   - Queue message in Redis list (LPUSH)
   - Set expiration: 30 days
   - Send push notification
3. When user comes online:
   - Check offline_queue:{userId}
   - Deliver all queued messages
   - Delete from queue after delivery
```

**Key Points:**
- Redis list for queue (fast, supports expiration)
- Push notifications for alerts
- Batch delivery when online
- 30-day TTL for storage management

#### Q5: How will you scale to 2 billion users?

**Answer:**
```
1. Horizontal Scaling:
   - Multiple WebSocket servers (load balanced)
   - Sharded database (Cassandra)
   - Redis cluster for caching

2. Sharding Strategy:
   - Messages: Shard by chatId (consistent hashing)
   - Users: Shard by userId
   - Groups: Shard by groupId

3. Caching:
   - Redis for hot data (presence, recent messages)
   - CDN for media files
   - Multi-level caching

4. Database:
   - Cassandra for messages (write-heavy, scalable)
   - PostgreSQL for metadata (users, groups)
   - Read replicas for read scaling
```

**Key Points:**
- Horizontal scaling (add more servers)
- Sharding for distribution
- Caching for performance
- Right database for right use case

#### Q6: How will you handle media files?

**Answer:**
```
1. Upload: Client → Server → S3
2. Process: Compress, generate thumbnail
3. Store: Original + thumbnail in S3
4. CDN: Serve via CloudFront/CDN
5. Delivery: Send thumbnail URL first (fast preview)
6. Lazy loading: Client downloads full image on demand
```

**Key Points:**
- S3 for storage (scalable, durable)
- CDN for global delivery
- Thumbnails for fast preview
- Lazy loading for bandwidth savings

#### Q7: How will you handle presence (online/offline)?

**Answer:**
```
1. On connection: Set Redis key user:{userId}:status = "online"
2. Store: server_id, connection_id, last_seen
3. TTL: 5 minutes (heartbeat)
4. Heartbeat: Client pings every 30 seconds, reset TTL
5. On disconnect: Set status = "offline", update last_seen in DB
6. Notify contacts via Redis Pub/Sub
```

**Key Points:**
- Redis for fast lookup (O(1))
- TTL for auto-cleanup
- Heartbeat for connection health
- Pub/Sub for cross-server updates

#### Q8: How will you ensure no message loss?

**Answer:**
```
1. Store message in DB BEFORE delivery (write-through)
2. At-least-once delivery guarantee
3. Retry mechanism for failed deliveries
4. Offline queue with 30-day TTL
5. Idempotent message processing (check messageId)
6. Database replication for durability
```

**Key Points:**
- Write-through pattern (DB first)
- Retry mechanism
- Offline queue
- Idempotency checks
- Database replication

#### Q9: How will you handle read receipts?

**Answer:**
```
1. User B reads message
2. Client sends: message_read_ack {messageId}
3. Server updates: status = "READ", read_at = NOW()
4. Batch updates for multiple messages
5. Notify sender (User A) via WebSocket/Pub/Sub
6. Update UI: Show blue double tick
```

**Key Points:**
- Client-initiated (when message visible)
- Batch updates for efficiency
- Async notification to sender
- Throttled (max once per 3 seconds)

#### Q10: How will you handle group member addition?

**Answer:**
```
1. Validate: User is admin, group exists, member not already added
2. Insert into group_members table
3. Update Redis cache: group:{groupId}:members
4. Add member to WebSocket room: group:{groupId}
5. Notify all group members via Pub/Sub
6. Send recent messages to new member
```

**Key Points:**
- Validation before adding
- Update cache and DB
- WebSocket room for real-time delivery
- Notify existing members
- Sync recent messages

### Interview Flow Explanation Template

When explaining a flow in interview:

1. **Start with scenario:** "Let's say User A sends a message to User B..."

2. **Break into steps:**
   - Step 1: What happens first?
   - Step 2: What's the next action?
   - Continue step by step...

3. **Mention technologies:**
   - "We use WebSocket for..."
   - "Redis is used for..."
   - "Cassandra stores..."

4. **Highlight decisions:**
   - "We chose X because..."
   - "The trade-off is..."
   - "For scalability, we..."

5. **Discuss edge cases:**
   - "What if user is offline?"
   - "What if server crashes?"
   - "How do we handle failures?"

### Key Numbers to Remember

- **Users:** 2 billion active users
- **Messages:** 100 billion messages/day
- **Storage:** ~20 PB (5 years)
- **Servers:** 250-300 WebSocket servers
- **Latency:** < 100ms for message delivery
- **Availability:** 99.99% uptime
- **Group size:** Max 256 members
- **Media size:** Max 16MB (images), 100MB (videos)

### Technology Stack Summary

- **Real-time:** WebSocket (Socket.io)
- **Database:** Cassandra (messages), PostgreSQL (metadata)
- **Cache:** Redis (presence, cache, pub/sub, queues)
- **Storage:** S3 (media files)
- **CDN:** CloudFront (media delivery)
- **Load Balancer:** Nginx/HAProxy
- **Message Queue:** Redis Pub/Sub / Kafka

---

## 🔧 Detailed Design (Complete Flows)

### 1. User Registration & OTP Verification Flow

```
User wants to register
    │
    ▼
1. User enters phone number
   ├─ Client sends: POST /api/auth/register
   ├─ Payload: {phoneNumber: "+1234567890", name: "John"}
   └─ Server receives request
    │
    ▼
2. Validate Phone Number
   ├─ Check format (E.164 format)
   ├─ Check if already registered
   ├─ Rate limiting (max 3 requests per hour per IP)
   └─ If valid: Continue
    │
    ▼
3. Generate OTP
   ├─ Generate 6-digit random OTP
   ├─ Store OTP in Redis with key: otp:{phoneNumber}
   ├─ Set expiration: 5 minutes
   └─ Store attempt count (max 3 attempts)
    │
    ▼
4. Send OTP via SMS Service
   ├─ Call SMS provider API (Twilio/AWS SNS)
   ├─ SMS: "Your WhatsApp verification code is: 123456"
   └─ Log SMS delivery status
    │
    ▼
5. Return Response to Client
   ├─ Response: {otpSent: true, expiresIn: 300}
   └─ Client shows OTP input screen
    │
    ▼
6. User enters OTP
   ├─ Client sends: POST /api/auth/verify-otp
   ├─ Payload: {phoneNumber: "+1234567890", otp: "123456"}
   └─ Server receives verification request
    │
    ▼
7. Verify OTP
   ├─ Get OTP from Redis: otp:{phoneNumber}
   ├─ Compare entered OTP with stored OTP
   ├─ Check expiration time
   ├─ Check attempt count (< 3)
   └─ If valid: Continue to step 8
   └─ If invalid: Increment attempt count, return error
    │
    ▼
8. Create User Account
   ├─ Insert into users table
   │  ├─ phone_number: "+1234567890"
   │  ├─ name: "John"
   │  ├─ created_at: NOW()
   │  └─ is_verified: true
   ├─ Generate user_id (UUID or auto-increment)
   └─ Create default privacy settings
    │
    ▼
9. Generate Authentication Token
   ├─ Create JWT token
   │  ├─ Payload: {userId, phoneNumber, iat, exp}
   │  ├─ Expiration: 7 days
   │  └─ Secret: JWT_SECRET
   ├─ Store refresh token in Redis
   └─ Set TTL: 30 days
    │
    ▼
10. Return Success Response
    ├─ Response: {token: "jwt_token", user: {...}}
    └─ Client stores token and navigates to home screen
```

### 2. User Login & WebSocket Connection Flow

```
User opens app (already registered)
    │
    ▼
1. Check for Stored Token
   ├─ Client checks local storage for JWT token
   ├─ If token exists: Validate token
   └─ If no token: Show login screen
    │
    ▼
2. Validate Token
   ├─ Decode JWT token
   ├─ Check expiration
   ├─ Verify signature
   └─ If valid: Continue to step 3
   └─ If invalid: Show login screen
    │
    ▼
3. Establish WebSocket Connection
   ├─ Client connects to: wss://whatsapp.com/ws
   ├─ Send authentication: {token: "jwt_token"}
   └─ Server receives connection request
    │
    ▼
4. Authenticate WebSocket Connection
   ├─ Validate JWT token
   ├─ Extract userId from token
   ├─ Check if user exists in database
   ├─ Check if account is active
   └─ If valid: Continue to step 5
   └─ If invalid: Reject connection
    │
    ▼
5. Register Connection in Redis
   ├─ Set: user:{userId}:status = "online"
   ├─ Set: user:{userId}:connection_id = socket_id
   ├─ Set: user:{userId}:server_id = current_server_id
   ├─ Set: user:{userId}:last_seen = current_timestamp
   └─ Set TTL: 5 minutes (heartbeat)
    │
    ▼
6. Join User's Chat Rooms
   ├─ Get user's active chats (from database)
   ├─ For each chat: socket.join(`chat:${chatId}`)
   ├─ Get user's groups
   └─ For each group: socket.join(`group:${groupId}`)
    │
    ▼
7. Load Offline Messages
   ├─ Check Redis: offline_queue:{userId}
   ├─ If messages exist:
   │  ├─ Get all queued messages
   │  ├─ Deliver via WebSocket
   │  └─ Delete from queue after delivery
   └─ Update delivery status in database
    │
    ▼
8. Notify Contacts of Online Status
   ├─ Get user's contact list
   ├─ For each contact who has user in their list:
   │  ├─ Check if contact is online
   │  └─ If online: Emit presence_update event
   └─ Use Redis Pub/Sub for cross-server notification
    │
    ▼
9. Start Heartbeat Mechanism
   ├─ Client sends ping every 30 seconds
   ├─ Server responds with pong
   ├─ Server updates: user:{userId}:last_seen
   └─ Reset TTL: 5 minutes
    │
    ▼
10. Connection Established
    ├─ Server emits: {event: "connected", userId}
    └─ Client ready to send/receive messages
```

### 3. Message Delivery Flow (1:1 Chat)

```
User A sends message to User B
    │
    ▼
1. Client A sends message via WebSocket
   ├─ Message: {to: userId_B, content: "Hello", type: "text"}
   └─ WebSocket Server receives message
    │
    ▼
2. Validate & Process Message
   ├─ Validate sender authentication
   ├─ Validate receiver exists
   ├─ Check if B has blocked A
   └─ Generate messageId
    │
    ▼
3. Store Message in Database
   ├─ Insert into messages table (sharded by chatId)
   ├─ Set status: "SENT"
   ├─ Store timestamp
   └─ Return messageId
    │
    ▼
4. Send ACK to User A
   ├─ Emit: message_sent_ack {messageId, status: "SENT"}
   └─ Update UI with single tick (✓)
    │
    ▼
5. Check User B's Connection Status
   ├─ Query Redis for B's active session
   ├─ If ONLINE: Continue to step 6
   └─ If OFFLINE: Queue message (step 7)
    │
    ▼
6. Deliver to User B (Online)
   ├─ Find B's WebSocket connection
   ├─ Emit: receive_message {from: userId_A, content, messageId}
   └─ Update status to "DELIVERED" in DB
    │
    ▼
7. Queue for Offline User
   ├─ Store in offline_message_queue (Redis)
   ├─ Send push notification
   └─ When B comes online: Deliver queued messages
    │
    ▼
8. User B Receives Message
   ├─ Client B sends: message_delivered_ack {messageId}
   └─ Server updates status to "DELIVERED"
    │
    ▼
9. Notify User A of Delivery
   ├─ Emit to A: message_status_update {messageId, status: "DELIVERED"}
   └─ Update UI with double tick (✓✓)
    │
    ▼
10. User B Reads Message
    ├─ Client B sends: message_read_ack {messageId}
    └─ Server updates status to "READ"
     │
     ▼
11. Notify User A of Read
    ├─ Emit to A: message_status_update {messageId, status: "READ"}
    └─ Update UI with blue double tick (✓✓)
```

### 2. Group Message Delivery Flow

```
User A sends message to Group
    │
    ▼
1. Client A sends group message
   ├─ Message: {to: groupId, content: "Hello Group", type: "group"}
   └─ WebSocket Server receives
    │
    ▼
2. Validate & Process
   ├─ Validate A is group member
   ├─ Get group members list (from cache/DB)
   └─ Generate messageId
    │
    ▼
3. Store Message in Database
   ├─ Insert into messages table
   ├─ Insert into group_messages table
   ├─ Set status: "SENT" for all members
   └─ Store delivery status per member
    │
    ▼
4. Fan-out to Group Members
   ├─ For each member (B, C, D...):
   │  ├─ Check if online (Redis)
   │  ├─ If online: Emit via WebSocket
   │  └─ If offline: Queue message
   ├─ Use Redis Pub/Sub for cross-server fan-out
   └─ Parallel processing for efficiency
    │
    ▼
5. Delivery Status Tracking
   ├─ Track delivered status per member
   ├─ Track read status per member
   └─ Update database asynchronously
    │
    ▼
6. Notify Sender (User A)
   ├─ Show delivery status per member
   └─ Real-time updates as members read
```

### 3. Media Upload Flow

```
User uploads media file
    │
    ▼
1. Client uploads file
   ├─ POST /api/media/upload
   ├─ Multipart form data
   └─ File: image.jpg (2MB)
    │
    ▼
2. Validate File
   ├─ Check file size (< 16MB for images, < 100MB for videos)
   ├─ Check file type (whitelist)
   ├─ Virus scan (optional)
   └─ Rate limiting
    │
    ▼
3. Process Media
   ├─ Compress image (if > 1MB)
   ├─ Generate thumbnail (for images/videos)
   ├─ Extract metadata (dimensions, duration)
   └─ Optimize for mobile
    │
    ▼
4. Upload to Object Storage
   ├─ Upload original file to S3
   ├─ Upload thumbnail to S3
   ├─ Get URLs for both
   └─ Store metadata in database
    │
    ▼
5. Create Message Record
   ├─ Insert into messages table
   ├─ Store media URLs
   ├─ Store thumbnail URL
   └─ Set message type: "IMAGE" / "VIDEO" / "DOCUMENT"
    │
    ▼
6. Deliver Message
   ├─ Send message with media URLs
   ├─ Client downloads media on demand
   └─ Show thumbnail immediately
```

### 4. Presence & Last Seen Flow

```
User A comes online
    │
    ▼
1. WebSocket Connection Established
   ├─ Client connects to WebSocket server
   ├─ Authenticate user (JWT token)
   └─ Register connection in Redis
    │
    ▼
2. Update Presence in Redis
   ├─ Set: user:{userId}:status = "online"
   ├─ Set: user:{userId}:last_seen = current_timestamp
   ├─ Set: user:{userId}:connection_id = socket_id
   └─ Set TTL: 5 minutes (heartbeat)
    │
    ▼
3. Notify Contacts
   ├─ Get user's contact list
   ├─ For each contact who has A in their list:
   │  ├─ Check if contact is online
   │  └─ If online: Emit presence_update event
   └─ Use Redis Pub/Sub for cross-server notification
    │
    ▼
4. Heartbeat Mechanism
   ├─ Client sends ping every 30 seconds
   ├─ Server updates last_seen timestamp
   └─ If no ping for 5 minutes: Mark as offline
    │
    ▼
5. User Goes Offline
   ├─ WebSocket disconnects
   ├─ Update Redis: status = "offline"
   ├─ Update database: last_seen = current_timestamp
   └─ Notify contacts via Pub/Sub
```

### 5. Typing Indicator Flow

```
User A starts typing
    │
    ▼
1. Client A sends typing event
   ├─ Emit: typing_start {chatId: userId_B}
   └─ Throttle: Max once per 3 seconds
    │
    ▼
2. Server Receives Event
   ├─ Validate sender authentication
   ├─ Check if B is online
   └─ If online: Forward to B
    │
    ▼
3. Notify User B
   ├─ Emit to B: typing_indicator {from: userId_A, status: "typing"}
   └─ Show "A is typing..." in B's UI
    │
    ▼
4. User A Stops Typing
   ├─ After 3 seconds of inactivity: Emit typing_stop
   └─ Notify B: typing_indicator {status: "stopped"}
```

### 6. Offline Message Queue Flow

```
User B is offline when message arrives
    │
    ▼
1. Message Arrives for Offline User
   ├─ Check Redis: user:{userId_B}:status = "offline"
   └─ Queue message in Redis list
    │
    ▼
2. Store in Offline Queue
   ├─ LPUSH offline_queue:{userId_B} message_data
   ├─ Set expiration: 30 days
   └─ Store message in database
    │
    ▼
3. Send Push Notification
   ├─ Get user's device tokens
   ├─ Send push notification via FCM/APNS
   └─ Include message preview (if allowed)
    │
    ▼
4. User B Comes Online
   ├─ WebSocket connection established
   ├─ Client requests: get_offline_messages
   └─ Server processes queued messages
    │
    ▼
5. Deliver Queued Messages
   ├─ Get all messages from offline_queue:{userId_B}
   ├─ Deliver via WebSocket in order
   ├─ Delete from queue after delivery
   └─ Update delivery status
```

### 7. Group Creation Flow

```
User A wants to create a group
    │
    ▼
1. User A initiates group creation
   ├─ Client sends: POST /api/groups
   ├─ Payload: {name: "Family", members: ["userId2", "userId3"], description: "Family chat"}
   └─ Server receives request
    │
    ▼
2. Validate Request
   ├─ Validate user authentication
   ├─ Validate group name (not empty, < 255 chars)
   ├─ Validate members list (not empty, max 255 members)
   ├─ Check if all members exist
   ├─ Check if user has permission to create group
   └─ Rate limiting (max 10 groups per day)
    │
    ▼
3. Create Group Record
   ├─ Insert into groups table
   │  ├─ group_id: Generate UUID or auto-increment
   │  ├─ name: "Family"
   │  ├─ description: "Family chat"
   │  ├─ created_by: userId_A
   │  ├─ created_at: NOW()
   │  └─ is_broadcast: false
   └─ Return group_id
    │
    ▼
4. Add Group Members
   ├─ Insert creator as admin
   │  └─ Insert into group_members: {group_id, user_id: userId_A, role: "admin"}
   ├─ Insert other members
   │  └─ For each member: Insert into group_members: {group_id, user_id, role: "member"}
   └─ Batch insert for efficiency
    │
    ▼
5. Create Group Chat Room
   ├─ Create Redis room: group:{groupId}
   ├─ Add all members to room
   └─ Store group metadata in Redis cache
    │
    ▼
6. Send Group Creation Notification
   ├─ For each member (except creator):
   │  ├─ Check if member is online
   │  ├─ If online: Emit via WebSocket: group_created event
   │  └─ If offline: Send push notification
   └─ Use Redis Pub/Sub for cross-server notification
    │
    ▼
7. Update User's Group List
   ├─ Add group to each member's group list (cache)
   ├─ Update Redis: user:{userId}:groups = [groupId1, groupId2, ...]
   └─ Set TTL: 1 hour
    │
    ▼
8. Return Success Response
   ├─ Response: {groupId, name, members: [...], createdAt}
   └─ Client updates UI with new group
```

### 8. Status Update (Story) Flow

```
User A wants to post a status update
    │
    ▼
1. User A creates status
   ├─ Client sends: POST /api/status
   ├─ Payload: {contentType: "IMAGE", mediaUrl: "...", text: "Having fun!", privacy: "contacts"}
   └─ Server receives request
    │
    ▼
2. Validate Request
   ├─ Validate user authentication
   ├─ Validate content type (TEXT, IMAGE, VIDEO)
   ├─ Validate media file (if media status)
   ├─ Check file size limits
   ├─ Rate limiting (max 5 status updates per day)
   └─ Check if user has active status (max 1 active status)
    │
    ▼
3. Process Media (if applicable)
   ├─ If IMAGE/VIDEO:
   │  ├─ Compress image/video
   │  ├─ Generate thumbnail
   │  ├─ Upload to object storage (S3)
   │  └─ Get media URLs
   └─ If TEXT: Store text content directly
    │
    ▼
4. Create Status Record
   ├─ Insert into status_updates table
   │  ├─ status_id: Generate UUID
   │  ├─ user_id: userId_A
   │  ├─ content_type: "IMAGE"
   │  ├─ media_url: "https://cdn.whatsapp.com/status/image.jpg"
   │  ├─ text: "Having fun!"
   │  ├─ privacy: "contacts"
   │  ├─ expires_at: NOW() + 24 hours
   │  └─ created_at: NOW()
   └─ Return status_id
    │
    ▼
5. Determine Viewers List
   ├─ Based on privacy setting:
   │  ├─ "everyone": All contacts
   │  ├─ "contacts": User's contact list
   │  └─ "exclude": Contacts except excluded users
   ├─ Get contact list from database
   └─ Filter based on privacy settings
    │
    ▼
6. Notify Viewers
   ├─ For each viewer:
   │  ├─ Check if viewer is online
   │  ├─ If online: Emit via WebSocket: new_status event
   │  └─ If offline: Send push notification (optional)
   └─ Use Redis Pub/Sub for cross-server notification
    │
    ▼
7. Cache Status
   ├─ Store in Redis: status:{statusId} = status_data
   ├─ Add to user's status list: user:{userId}:statuses = [statusId]
   └─ Set TTL: 24 hours (matches expiration)
    │
    ▼
8. Return Success Response
   ├─ Response: {statusId, expiresAt, createdAt}
   └─ Client shows status in UI
```

### 9. Status View Flow

```
User B views User A's status
    │
    ▼
1. User B opens status
   ├─ Client sends: GET /api/status/:statusId
   └─ Server receives request
    │
    ▼
2. Validate Access
   ├─ Validate user authentication
   ├─ Get status from database/cache
   ├─ Check if status exists
   ├─ Check if status expired (expires_at < NOW())
   ├─ Check privacy settings:
   │  ├─ If "everyone": Allow
   │  ├─ If "contacts": Check if B is in A's contacts
   │  └─ If "exclude": Check if B is not excluded
   └─ If access denied: Return 403
    │
    ▼
3. Record View
   ├─ Check if already viewed (status_views table)
   ├─ If not viewed:
   │  ├─ Insert into status_views table
   │  │  ├─ status_id: statusId
   │  │  ├─ viewer_id: userId_B
   │  │  └─ viewed_at: NOW()
   │  └─ Increment view_count in status_updates table
   └─ If already viewed: Skip
    │
    ▼
4. Return Status Content
   ├─ Response: {statusId, contentType, mediaUrl, text, viewCount, createdAt}
   └─ Client displays status
    │
    ▼
5. Notify Status Owner (User A)
   ├─ Check if A is online
   ├─ If online: Emit via WebSocket: status_viewed event
   │  └─ Payload: {statusId, viewerId: userId_B, viewerName}
   └─ Update A's status view list
```

### 10. Message Search Flow

```
User searches for messages
    │
    ▼
1. User enters search query
   ├─ Client sends: GET /api/messages/search?q=hello&chatId=123
   ├─ Query parameters:
   │  ├─ q: Search query string
   │  ├─ chatId: Specific chat (optional)
   │  ├─ limit: Results per page (default: 20)
   │  └─ offset: Pagination offset
   └─ Server receives request
    │
    ▼
2. Validate Request
   ├─ Validate user authentication
   ├─ Validate search query (min 2 characters)
   ├─ Check if user has access to chatId (if specified)
   └─ Rate limiting (max 100 searches per minute)
    │
    ▼
3. Determine Search Scope
   ├─ If chatId provided: Search in specific chat
   └─ If no chatId: Search across all user's chats
    │
    ▼
4. Execute Search Query
   ├─ If chatId provided:
   │  └─ Query: SELECT * FROM messages 
   │      WHERE chat_id = ? AND content LIKE ? 
   │      AND sender_id = ? OR receiver_id = ?
   │      ORDER BY created_at DESC LIMIT ?
   ├─ If no chatId:
   │  └─ Query: SELECT * FROM messages 
   │      WHERE (sender_id = ? OR receiver_id = ? OR group_id IN (?))
   │      AND content LIKE ? 
   │      ORDER BY created_at DESC LIMIT ?
   └─ Use full-text search index for performance
    │
    ▼
5. Filter Results
   ├─ Filter out deleted messages
   ├─ Filter out messages from blocked users
   ├─ Check privacy settings
   └─ Limit results based on pagination
    │
    ▼
6. Format Results
   ├─ Include message metadata:
   │  ├─ messageId, senderId, content
   │  ├─ timestamp, chatId
   │  └─ Highlight search terms in content
   └─ Group results by chatId (if searching all chats)
    │
    ▼
7. Return Search Results
   ├─ Response: {results: [...], totalCount, hasMore}
   └─ Client displays results with highlights
```

### 11. Block/Unblock User Flow

```
User A wants to block User B
    │
    ▼
1. User A initiates block action
   ├─ Client sends: POST /api/users/:userId/block
   ├─ Payload: {userId: userId_B}
   └─ Server receives request
    │
    ▼
2. Validate Request
   ├─ Validate user authentication
   ├─ Validate target user exists
   ├─ Check if already blocked
   └─ Prevent self-block
    │
    ▼
3. Update Contacts Table
   ├─ Update contacts table:
   │  └─ SET is_blocked = true 
   │      WHERE user_id = userId_A AND contact_user_id = userId_B
   ├─ If contact doesn't exist: Insert new record
   └─ Update cache: user:{userId_A}:blocked_users = [userId_B, ...]
    │
    ▼
4. Handle Active Chats
   ├─ Stop delivering messages from B to A
   ├─ Stop delivering messages from A to B
   ├─ Mark chat as blocked in UI
   └─ Optionally: Archive chat
    │
    ▼
5. Notify User B (Optional)
   ├─ Check if B is online
   ├─ If online: Emit via WebSocket: user_blocked event
   └─ B's messages to A will fail silently
    │
    ▼
6. Update Message Delivery Logic
   ├─ Add check in message delivery:
   │  └─ If receiver has blocked sender: Skip delivery
   └─ Update existing queued messages
    │
    ▼
7. Return Success Response
   ├─ Response: {blocked: true, userId: userId_B}
   └─ Client updates UI (hide chat, show blocked status)
```

### 12. System Architecture Flow (End-to-End Message Delivery)

```
Complete System Flow: User A sends message to User B
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Client Layer                                    │
│ User A's Mobile App                                      │
│  - User types message                                    │
│  - Client encrypts message (E2E encryption)              │
│  - Client sends via WebSocket                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ WebSocket (WSS)
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Load Balancer                                   │
│ Nginx/HAProxy                                           │
│  - SSL termination                                       │
│  - Route to WebSocket server (sticky session)           │
│  - Health check                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Route based on userId hash
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: WebSocket Server (Server 1)                    │
│ Node.js + Socket.io                                      │
│  - Receives message from User A                         │
│  - Authenticates connection                             │
│  - Validates message                                    │
│  - Generates messageId                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Async message processing
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Message Service                                │
│  - Stores message in Cassandra (sharded by chatId)      │
│  - Updates Redis cache (recent messages)                │
│  - Sets status: "SENT"                                  │
│  - Returns messageId                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Check presence
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 5: Presence Service                               │
│ Redis Cache                                              │
│  - Check: user:{userId_B}:status                        │
│  - Get: user:{userId_B}:connection_id                   │
│  - Get: user:{userId_B}:server_id                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ If ONLINE: Same server
                     │ If ONLINE: Different server
                     │ If OFFLINE: Queue message
                     ▼
        ┌────────────┴────────────┬──────────────┐
        │                         │              │
        ▼                         ▼              ▼
┌───────────────┐    ┌──────────────┐  ┌──────────────┐
│ Same Server   │    │ Different    │  │ Offline      │
│ (Server 1)    │    │ Server       │  │ Queue        │
│               │    │ (Server 2)    │  │              │
│ Direct emit   │    │ Redis Pub/Sub │  │ Redis Queue  │
│ to socket     │    │ to Server 2   │  │ + Push       │
│               │    │               │  │ Notification │
└───────┬───────┘    └───────┬──────┘  └──────────────┘
        │                    │
        │                    │
        └────────┬───────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 6: Delivery to User B                             │
│ WebSocket Server (Server 1 or 2)                       │
│  - Emit: receive_message event                          │
│  - User B's client receives message                     │
│  - Client decrypts message                              │
│  - Client displays message                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ ACK from User B
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 7: Status Update                                  │
│  - User B sends: message_delivered_ack                  │
│  - Message Service updates status to "DELIVERED"         │
│  - Redis Pub/Sub notifies User A                        │
│  - User A sees double tick (✓✓)                         │
│                                                          │
│  - User B reads message                                 │
│  - User B sends: message_read_ack                       │
│  - Message Service updates status to "READ"             │
│  - Redis Pub/Sub notifies User A                        │
│  - User A sees blue double tick (✓✓)                    │
└─────────────────────────────────────────────────────────┘
```

### 13. Media Message Flow (Complete)

```
User A sends image to User B
    │
    ▼
1. User A selects image
   ├─ Client compresses image (if > 1MB)
   ├─ Client generates thumbnail
   └─ Client shows preview
    │
    ▼
2. Upload Media File
   ├─ Client sends: POST /api/media/upload
   ├─ Multipart form data: {file: image.jpg, chatId: userId_B}
   └─ Media Service receives request
    │
    ▼
3. Validate & Process
   ├─ Validate file size (< 16MB)
   ├─ Validate file type (image/jpeg, image/png, etc.)
   ├─ Virus scan (optional)
   ├─ Further compress if needed
   ├─ Generate thumbnail (if not provided)
   └─ Extract metadata (dimensions, size)
    │
    ▼
4. Upload to Object Storage
   ├─ Upload original to S3: media/{userId}/{mediaId}.jpg
   ├─ Upload thumbnail to S3: thumbnails/{userId}/{mediaId}.jpg
   ├─ Get CDN URLs for both
   └─ Store metadata in database
    │
    ▼
5. Create Message Record
   ├─ Insert into messages table:
   │  ├─ message_id: Generate UUID
   │  ├─ chat_id: userId_A_userId_B
   │  ├─ sender_id: userId_A
   │  ├─ receiver_id: userId_B
   │  ├─ message_type: "IMAGE"
   │  ├─ media_url: "https://cdn.whatsapp.com/media/..."
   │  ├─ thumbnail_url: "https://cdn.whatsapp.com/thumb/..."
   │  ├─ media_size: 2048000
   │  └─ status: "SENT"
   └─ Return messageId
    │
    ▼
6. Deliver Message
   ├─ Check if User B is online
   ├─ If online:
   │  ├─ Emit via WebSocket: receive_message
   │  └─ Payload includes thumbnail_url (fast preview)
   └─ If offline:
      ├─ Queue message
      └─ Send push notification with thumbnail
    │
    ▼
7. User B Receives Message
   ├─ Client shows thumbnail immediately
   ├─ Client downloads full image on demand (lazy loading)
   ├─ Client sends: message_delivered_ack
   └─ Server updates status to "DELIVERED"
    │
    ▼
8. User B Views Full Image
   ├─ Client requests full image from CDN
   ├─ CDN serves cached image (if available)
   └─ Client displays full image
```

### 14. Group Member Management Flow

```
User A (admin) adds member to group
    │
    ▼
1. User A initiates add member
   ├─ Client sends: POST /api/groups/:groupId/members
   ├─ Payload: {userId: userId_C}
   └─ Server receives request
    │
    ▼
2. Validate Request
   ├─ Validate user authentication
   ├─ Validate A is group admin
   ├─ Validate group exists
   ├─ Check if C is already member
   ├─ Check group size limit (max 256 members)
   └─ Rate limiting
    │
    ▼
3. Add Member to Group
   ├─ Insert into group_members table:
   │  ├─ group_id: groupId
   │  ├─ user_id: userId_C
   │  ├─ role: "member"
   │  └─ joined_at: NOW()
   └─ Update group member count
    │
    ▼
4. Update Cache
   ├─ Add to Redis: group:{groupId}:members = [userId1, userId2, ...]
   ├─ Add to user's group list: user:{userId_C}:groups = [groupId, ...]
   └─ Invalidate group metadata cache
    │
    ▼
5. Notify Group Members
   ├─ Get all group members
   ├─ For each member:
   │  ├─ If online: Emit via WebSocket: member_added event
   │  └─ If offline: Send push notification
   └─ Use Redis Pub/Sub for cross-server notification
    │
    ▼
6. Notify New Member
   ├─ If User C is online:
   │  ├─ Emit: group_invited event
   │  └─ Include group details
   └─ If offline: Send push notification
    │
    ▼
7. Add to Group Chat Room
   ├─ Add User C to WebSocket room: group:{groupId}
   ├─ Send recent group messages to User C
   └─ Update group member list in UI
```

### 15. Message Deletion Flow (Delete for Everyone)

```
User A wants to delete message for everyone
    │
    ▼
1. User A initiates delete
   ├─ Client sends: DELETE /api/messages/:messageId
   ├─ Payload: {deleteForEveryone: true}
   └─ Server receives request
    │
    ▼
2. Validate Request
   ├─ Validate user authentication
   ├─ Validate message exists
   ├─ Check if A is message sender
   ├─ Check time limit (delete within 1 hour of sending)
   └─ Check if already deleted
    │
    ▼
3. Update Message in Database
   ├─ Update messages table:
   │  ├─ SET is_deleted = true
   │  ├─ SET deleted_at = NOW()
   │  └─ SET content = "[This message was deleted]"
   └─ Update cache: message:{messageId} = deleted
    │
    ▼
4. Determine Recipients
   ├─ If 1:1 chat: Recipient is receiver_id
   └─ If group chat: All group members except sender
    │
    ▼
5. Notify Recipients
   ├─ For each recipient:
   │  ├─ Check if online
   │  ├─ If online: Emit via WebSocket: message_deleted event
   │  └─ If offline: Update will sync when they come online
   └─ Use Redis Pub/Sub for cross-server notification
    │
    ▼
6. Update Client UI
   ├─ Recipients see "[This message was deleted]"
   ├─ Message cannot be recovered
   └─ Media files also deleted from storage
```

### 16. Read Receipt Flow (Detailed)

```
User B reads messages from User A
    │
    ▼
1. User B opens chat with User A
   ├─ Client loads chat messages
   ├─ Client displays unread messages
   └─ Client tracks which messages are visible
    │
    ▼
2. Messages Become Visible
   ├─ Client detects messages in viewport
   ├─ Client tracks last read message ID
   └─ Client sends batch read receipt
    │
    ▼
3. Client Sends Read Receipt
   ├─ Client sends: message_read_ack
   ├─ Payload: {messageIds: [msg1, msg2, msg3], chatId: userId_A}
   └─ Throttled: Max once per 3 seconds
    │
    ▼
4. Server Processes Read Receipt
   ├─ Validate user authentication
   ├─ Validate message ownership (B is receiver)
   ├─ Update messages table:
   │  └─ SET status = "READ", read_at = NOW()
   │      WHERE message_id IN (msg1, msg2, msg3)
   └─ Batch update for efficiency
    │
    ▼
5. Notify Sender (User A)
   ├─ Check if User A is online
   ├─ If online:
   │  ├─ Emit via WebSocket: message_status_update
   │  └─ Payload: {messageIds: [...], status: "READ"}
   └─ If offline: Will sync when A comes online
    │
    ▼
6. Update UI
   ├─ User A sees blue double ticks (✓✓) for read messages
   ├─ User A sees read timestamp (if enabled)
   └─ User B's unread count decreases
```

### 17. Cross-Server Communication Flow (Redis Pub/Sub)

```
User A on Server 1 sends message to User B on Server 2
    │
    ▼
1. Message Arrives at Server 1
   ├─ Server 1 receives message from User A
   ├─ Server 1 stores message in database
   └─ Server 1 checks User B's location
    │
    ▼
2. Server 1 Discovers User B is on Server 2
   ├─ Query Redis: user:{userId_B}:server_id = "server_2"
   ├─ Server 1 cannot directly communicate with Server 2
   └─ Use Redis Pub/Sub for inter-server communication
    │
    ▼
3. Publish to Redis Channel
   ├─ Server 1 publishes to channel: server:server_2:messages
   ├─ Payload: {
   │     event: "receive_message",
   │     userId: userId_B,
   │     messageData: {...}
   │   }
   └─ Redis broadcasts to all subscribers
    │
    ▼
4. Server 2 Receives Message
   ├─ Server 2 is subscribed to: server:server_2:messages
   ├─ Server 2 receives published message
   └─ Server 2 processes message
    │
    ▼
5. Server 2 Delivers to User B
   ├─ Server 2 finds User B's WebSocket connection
   ├─ Server 2 emits: receive_message event
   └─ User B receives message
    │
    ▼
6. User B Sends ACK
   ├─ User B sends: message_delivered_ack
   ├─ Server 2 publishes to: server:server_1:acks
   └─ Server 1 receives ACK and notifies User A
```

### 18. Heartbeat & Connection Health Flow

```
Maintain WebSocket connection health
    │
    ▼
1. Client Sends Ping
   ├─ Every 30 seconds: Client sends ping
   ├─ Payload: {type: "ping", timestamp: NOW()}
   └─ Server receives ping
    │
    ▼
2. Server Updates Presence
   ├─ Update Redis: user:{userId}:last_seen = current_timestamp
   ├─ Reset TTL: 5 minutes
   └─ Server responds with pong
    │
    ▼
3. Server Sends Pong
   ├─ Payload: {type: "pong", timestamp: NOW()}
   └─ Client receives pong
    │
    ▼
4. Connection Health Check
   ├─ If no ping received for 5 minutes:
   │  ├─ Mark user as offline
   │  ├─ Update Redis: user:{userId}:status = "offline"
   │  └─ Notify contacts
   └─ If ping received: Connection is healthy
    │
    ▼
5. Reconnection Handling
   ├─ If connection drops:
   │  ├─ Client attempts reconnection
   │  ├─ Client sends stored messages (if any)
   │  └─ Server validates and re-establishes connection
   └─ Seamless reconnection without message loss
```

---

## 🗄️ Database Design

### Tables

#### 1. `users` Table

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_picture_url TEXT,
    bio TEXT,
    status_message VARCHAR(255),
    
    -- Authentication
    password_hash VARCHAR(255),  -- For backup authentication
    otp_secret VARCHAR(255),  -- For OTP verification
    
    -- Privacy Settings
    last_seen_privacy VARCHAR(20) DEFAULT 'everyone',  -- 'everyone', 'contacts', 'nobody'
    profile_picture_privacy VARCHAR(20) DEFAULT 'everyone',
    status_privacy VARCHAR(20) DEFAULT 'everyone',
    
    -- Account Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP,
    
    -- Indexes
    INDEX idx_phone_number (phone_number),
    INDEX idx_last_seen (last_seen)
);
```

#### 2. `messages` Table (Sharded by chatId)

```sql
CREATE TABLE messages (
    message_id BIGINT PRIMARY KEY,
    chat_id VARCHAR(100) NOT NULL,  -- userId_userId for 1:1, groupId for groups
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT,  -- NULL for group messages
    group_id BIGINT,  -- NULL for 1:1 messages
    
    -- Message Content
    content TEXT,  -- For text messages
    message_type VARCHAR(20) NOT NULL,  -- 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LOCATION', 'CONTACT'
    
    -- Media URLs (if media message)
    media_url TEXT,
    thumbnail_url TEXT,
    media_size BIGINT,  -- Size in bytes
    media_duration INTEGER,  -- For audio/video (seconds)
    
    -- Message Metadata
    reply_to_message_id BIGINT,  -- If replying to another message
    forwarded_from BIGINT,  -- If forwarded from another user
    is_starred BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    
    -- Delivery Status (for 1:1)
    status VARCHAR(20) DEFAULT 'SENT',  -- 'SENT', 'DELIVERED', 'READ'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_chat_id_created_at (chat_id, created_at),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_group_id (group_id),
    INDEX idx_created_at (created_at)
) PARTITION BY HASH(chat_id);  -- Shard by chatId
```

#### 3. `group_messages` Table (For group message delivery status)

```sql
CREATE TABLE group_messages (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    
    -- Delivery Status per member
    status VARCHAR(20) DEFAULT 'SENT',  -- 'SENT', 'DELIVERED', 'READ'
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_message_id (message_id),
    INDEX idx_group_id_member_id (group_id, member_id),
    INDEX idx_status (status),
    
    -- Unique constraint
    UNIQUE(message_id, member_id)
);
```

#### 4. `groups` Table

```sql
CREATE TABLE groups (
    group_id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    group_picture_url TEXT,
    
    -- Group Settings
    created_by BIGINT NOT NULL,
    is_broadcast BOOLEAN DEFAULT FALSE,  -- Only admins can send
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);
```

#### 5. `group_members` Table

```sql
CREATE TABLE group_members (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    
    -- Member Role
    role VARCHAR(20) DEFAULT 'member',  -- 'admin', 'member'
    
    -- Member Settings
    is_muted BOOLEAN DEFAULT FALSE,
    notification_settings VARCHAR(20) DEFAULT 'all',  -- 'all', 'mentions', 'none'
    
    -- Timestamps
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id),
    INDEX idx_group_user (group_id, user_id),
    
    -- Unique constraint
    UNIQUE(group_id, user_id)
);
```

#### 6. `contacts` Table

```sql
CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    contact_user_id BIGINT NOT NULL,
    
    -- Contact Info
    contact_name VARCHAR(255),  -- Custom name for contact
    is_blocked BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_contact_user_id (contact_user_id),
    INDEX idx_user_contact (user_id, contact_user_id),
    
    -- Unique constraint
    UNIQUE(user_id, contact_user_id)
);
```

#### 7. `status_updates` Table

```sql
CREATE TABLE status_updates (
    status_id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    -- Status Content
    content_type VARCHAR(20) NOT NULL,  -- 'TEXT', 'IMAGE', 'VIDEO'
    text_content TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    
    -- Privacy
    privacy VARCHAR(20) DEFAULT 'contacts',  -- 'everyone', 'contacts', 'exclude'
    excluded_users TEXT,  -- JSON array of user IDs
    
    -- View Tracking
    view_count INTEGER DEFAULT 0,
    
    -- Expiration
    expires_at TIMESTAMP NOT NULL,  -- 24 hours from creation
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_at (created_at)
);
```

#### 8. `status_views` Table

```sql
CREATE TABLE status_views (
    id BIGSERIAL PRIMARY KEY,
    status_id BIGINT NOT NULL,
    viewer_id BIGINT NOT NULL,
    
    -- Timestamps
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_status_id (status_id),
    INDEX idx_viewer_id (viewer_id),
    
    -- Unique constraint
    UNIQUE(status_id, viewer_id)
);
```

### Database Sharding Strategy

**Messages Table Sharding:**
- Shard by `chatId` using consistent hashing
- Each shard handles messages for specific chat IDs
- Enables horizontal scaling
- Maintains message ordering within each chat

**Shard Key Calculation:**
```typescript
function getShardId(chatId: string, totalShards: number): number {
  const hash = hashFunction(chatId);
  return hash % totalShards;
}
```

**Read Strategy:**
- For 1:1 chats: Query single shard
- For group messages: Query shard where message was stored
- Use read replicas for better read performance

---

## 🔌 API Design

### WebSocket Events

#### Connection Events

**connect**
- Client connects to WebSocket server
- Authentication via JWT token
- Response: `{status: "connected", userId: "123"}`

**disconnect**
- Client disconnects
- Server cleans up connection state

#### Message Events (Client → Server)

**send_message**
```json
{
  "event": "send_message",
  "data": {
    "to": "userId_or_groupId",
    "content": "Hello!",
    "type": "TEXT",
    "chatType": "private" | "group",
    "replyTo": "messageId" // optional
  }
}
```

**message_delivered_ack**
```json
{
  "event": "message_delivered_ack",
  "data": {
    "messageId": "123456"
  }
}
```

**message_read_ack**
```json
{
  "event": "message_read_ack",
  "data": {
    "messageId": "123456"
  }
}
```

**typing_start**
```json
{
  "event": "typing_start",
  "data": {
    "chatId": "userId_or_groupId"
  }
}
```

**typing_stop**
```json
{
  "event": "typing_stop",
  "data": {
    "chatId": "userId_or_groupId"
  }
}
```

#### Message Events (Server → Client)

**receive_message**
```json
{
  "event": "receive_message",
  "data": {
    "messageId": "123456",
    "from": "userId",
    "to": "userId_or_groupId",
    "content": "Hello!",
    "type": "TEXT",
    "timestamp": "2024-12-07T12:00:00Z",
    "chatType": "private" | "group"
  }
}
```

**message_status_update**
```json
{
  "event": "message_status_update",
  "data": {
    "messageId": "123456",
    "status": "DELIVERED" | "READ",
    "timestamp": "2024-12-07T12:00:00Z"
  }
}
```

**presence_update**
```json
{
  "event": "presence_update",
  "data": {
    "userId": "123",
    "status": "online" | "offline",
    "lastSeen": "2024-12-07T12:00:00Z"
  }
}
```

**typing_indicator**
```json
{
  "event": "typing_indicator",
  "data": {
    "from": "userId",
    "chatId": "userId_or_groupId",
    "status": "typing" | "stopped"
  }
}
```

### REST API Endpoints

#### Authentication

**POST /api/auth/register**
Register new user with phone number

Request:
```json
{
  "phoneNumber": "+1234567890",
  "name": "John Doe"
}
```

Response:
```json
{
  "userId": "123",
  "otpSent": true,
  "expiresIn": 300
}
```

**POST /api/auth/verify-otp**
Verify OTP and complete registration

Request:
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "userId": "123",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  }
}
```

#### Messages

**GET /api/messages/:chatId**
Get messages for a chat

Query Parameters:
- `limit`: Number of messages (default: 50)
- `before`: Message ID to fetch messages before this
- `after`: Message ID to fetch messages after this

Response:
```json
{
  "messages": [
    {
      "messageId": "123",
      "senderId": "456",
      "content": "Hello!",
      "type": "TEXT",
      "status": "READ",
      "timestamp": "2024-12-07T12:00:00Z"
    }
  ],
  "hasMore": true,
  "nextCursor": "messageId"
}
```

**DELETE /api/messages/:messageId**
Delete a message

Request:
```json
{
  "deleteForEveryone": true
}
```

#### Groups

**POST /api/groups**
Create a new group

Request:
```json
{
  "name": "Family Group",
  "members": ["userId1", "userId2", "userId3"],
  "description": "Family chat"
}
```

Response:
```json
{
  "groupId": "789",
  "name": "Family Group",
  "members": ["userId1", "userId2", "userId3"],
  "createdAt": "2024-12-07T12:00:00Z"
}
```

**POST /api/groups/:groupId/members**
Add members to group

**DELETE /api/groups/:groupId/members/:userId**
Remove member from group

**PUT /api/groups/:groupId**
Update group settings

#### Media

**POST /api/media/upload**
Upload media file

Request: Multipart form data
- `file`: File to upload
- `type`: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT"
- `chatId`: Target chat ID

Response:
```json
{
  "mediaId": "media123",
  "mediaUrl": "https://cdn.whatsapp.com/media/media123.jpg",
  "thumbnailUrl": "https://cdn.whatsapp.com/thumb/media123.jpg",
  "size": 1024000,
  "type": "IMAGE"
}
```

#### Status

**POST /api/status**
Create status update

Request:
```json
{
  "contentType": "IMAGE",
  "mediaUrl": "https://cdn.whatsapp.com/status/image.jpg",
  "text": "Having fun!",
  "privacy": "contacts"
}
```

**GET /api/status/contacts**
Get status updates from contacts

**POST /api/status/:statusId/view**
Mark status as viewed

---

## 📨 Message Delivery Flow

### Reliable Message Delivery

**At-Least-Once Delivery:**
- Messages are stored in database before delivery
- Retry mechanism for failed deliveries
- Idempotent message processing

**Message Ordering:**
- Use sequence numbers per chat
- Client sorts messages by sequence number
- Server ensures sequential delivery

**Duplicate Prevention:**
- Unique messageId per message
- Client checks for duplicate messageIds
- Server rejects duplicate messageIds

### Delivery Guarantees

1. **SENT**: Message stored in database
2. **DELIVERED**: Message delivered to recipient device
3. **READ**: Message read by recipient

### Retry Strategy

- Exponential backoff for failed deliveries
- Max retries: 5
- Dead letter queue for permanently failed messages

---

## ⚡ Scalability & Performance

### Caching Strategy

**Multi-Level Caching:**

1. **L1: Application Memory Cache**
   - Active user sessions
   - Recent messages (last 100 per chat)
   - Size: 500MB per server
   - TTL: 5 minutes

2. **L2: Redis Cache**
   - Active conversations (top 20%)
   - User presence information
   - Group metadata
   - Size: 100GB total
   - TTL: 1 hour

3. **L3: CDN Cache**
   - Media files
   - Profile pictures
   - Static assets
   - TTL: 24 hours

4. **L4: Database**
   - All messages
   - Historical data
   - Fallback if cache miss

### Database Optimization

**Indexing:**
- Index on `chat_id, created_at` for message queries
- Index on `sender_id` for user queries
- Index on `group_id` for group queries
- Composite indexes for common query patterns

**Partitioning:**
- Partition messages table by `chat_id` hash
- Partition by date for archival
- Archive old messages (> 1 year) to cold storage

**Read Replicas:**
- Master for writes
- Multiple read replicas for reads
- Read from replicas for analytics

### Load Balancing

**WebSocket Load Balancing:**
- Sticky sessions (same user → same server)
- Health checks every 30 seconds
- Auto-scaling based on connection count
- Graceful shutdown for zero-downtime deployments

**Application Server Load Balancing:**
- Round-robin or least-connections
- Health checks
- Auto-scaling based on CPU/memory

### Message Fan-out Optimization

**For Group Messages:**
- Parallel processing for member delivery
- Batch database updates
- Use Redis Pub/Sub for cross-server fan-out
- Async status updates

**Optimization Techniques:**
- Batch inserts for group message status
- Lazy loading of group members
- Cache group member lists
- Pre-compute delivery status

### Media Optimization

**Compression:**
- Image compression (WebP format)
- Video compression (H.264/H.265)
- Audio compression (Opus codec)
- Adaptive quality based on network

**CDN Strategy:**
- Global CDN distribution
- Edge caching
- Lazy loading
- Progressive download

---

## 🔒 Security Considerations

### 1. End-to-End Encryption

**Implementation:**
- Messages encrypted on client before sending
- Server cannot read message content
- Use Signal Protocol or similar
- Key exchange via secure channel

**Key Management:**
- Each chat has unique encryption keys
- Key rotation mechanism
- Secure key storage on client

### 2. Authentication & Authorization

**Phone Number Verification:**
- OTP-based verification
- Rate limiting on OTP requests
- OTP expiration (5 minutes)
- Secure OTP storage

**JWT Tokens:**
- Short-lived access tokens (1 hour)
- Refresh tokens (7 days)
- Token rotation on refresh
- Secure token storage

### 3. Rate Limiting

**Per User:**
- 100 messages/minute
- 50 media uploads/hour
- 10 group creations/day

**Per IP:**
- 1000 requests/minute
- 100 registrations/hour

**Implementation:**
- Redis-based token bucket algorithm
- Sliding window rate limiting
- Different limits for authenticated vs anonymous

### 4. Input Validation

**Message Content:**
- Sanitize HTML content
- Validate message length (< 64KB)
- Validate media file types
- File size limits

**SQL Injection Prevention:**
- Parameterized queries
- Input sanitization
- ORM usage

### 5. Spam Prevention

**Mechanisms:**
- Rate limiting
- Content filtering
- User reporting system
- Automated spam detection
- Block suspicious accounts

### 6. Privacy Controls

**Last Seen Privacy:**
- Everyone can see
- Only contacts can see
- Nobody can see

**Profile Picture Privacy:**
- Everyone can see
- Only contacts can see

**Status Privacy:**
- Everyone can see
- Only contacts can see
- Exclude specific contacts

### 7. Data Protection

**Encryption at Rest:**
- Encrypt database backups
- Encrypt media files
- Use encryption keys (AWS KMS)

**Encryption in Transit:**
- TLS 1.3 for all connections
- Certificate pinning on mobile apps
- Secure WebSocket (WSS)

### 8. Compliance

**GDPR Compliance:**
- User data export
- Right to deletion
- Data portability
- Privacy by design

**Data Retention:**
- Message retention policies
- Automatic deletion of old messages
- User-controlled data retention

---

## 📈 Monitoring & Analytics

### Key Metrics

1. **Performance Metrics**
   - Message delivery latency (p50, p95, p99)
   - WebSocket connection count
   - Active users per server
   - Cache hit rate
   - Database query time

2. **Business Metrics**
   - Messages sent per day
   - Active users per day
   - Group chats created per day
   - Media uploads per day
   - Average messages per user

3. **System Metrics**
   - CPU/Memory usage per server
   - Database connections
   - Redis memory usage
   - CDN bandwidth
   - Error rates

4. **User Engagement Metrics**
   - Daily active users (DAU)
   - Monthly active users (MAU)
   - Average session duration
   - Messages per session
   - Retention rate

### Alerting

**Critical Alerts:**
- High error rate (> 1%)
- High latency (p95 > 500ms)
- Database connection pool exhaustion
- Cache hit rate < 80%
- Server downtime
- High message delivery failure rate

**Warning Alerts:**
- CPU usage > 80%
- Memory usage > 85%
- Disk usage > 90%
- Unusual traffic spikes

### Logging

**Structured Logging:**
- JSON format logs
- Include request ID for tracing
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized log aggregation (ELK stack)

**What to Log:**
- Message delivery events
- Authentication events
- Error events
- Performance metrics
- User actions (anonymized)

### Distributed Tracing

- Trace requests across services
- Identify bottlenecks
- Debug production issues
- Use tools like Jaeger or Zipkin

---

## 🎯 Summary

### Key Design Decisions

1. **Real-time Communication**: WebSocket for persistent connections
2. **Message Storage**: Cassandra for scalable message storage (sharded by chatId)
3. **Caching**: Multi-level caching (Memory → Redis → CDN → Database)
4. **Media Storage**: Object storage (S3) with CDN for global delivery
5. **Presence**: Redis for real-time presence tracking
6. **Scalability**: Horizontal scaling with load balancer and sharding
7. **Security**: End-to-end encryption, rate limiting, input validation
8. **Reliability**: At-least-once delivery, retry mechanism, offline queuing

### Scalability Numbers

- **2 billion active users**
- **100 billion messages/day**
- **~20,044 PB storage** (5 years)
- **~1.3 TB/s read bandwidth**
- **~127 GB/s write bandwidth**
- **250-300 application servers**
- **Distributed database** with sharding
- **Multi-level caching** for performance

### Technology Stack

- **Backend**: Node.js/Express (TypeScript)
- **Real-time**: Socket.io / WebSocket
- **Database**: Apache Cassandra (for messages)
- **Cache**: Redis (for presence, sessions, hot data)
- **Object Storage**: AWS S3 / MinIO (for media)
- **CDN**: CloudFront / Cloudflare (for media delivery)
- **Load Balancer**: Nginx / HAProxy / AWS ELB
- **Message Queue**: Redis Pub/Sub / Apache Kafka
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

### Architecture Highlights

- **Microservices**: Separate services for messages, groups, media, presence
- **Event-Driven**: Pub/Sub for cross-service communication
- **Sharding**: Horizontal partitioning for scalability
- **Caching**: Aggressive caching for low latency
- **CDN**: Global content delivery for media
- **Auto-scaling**: Dynamic scaling based on load
- **High Availability**: No single point of failure

---

*Complete system design for WhatsApp-like messaging service - ready for implementation!*
