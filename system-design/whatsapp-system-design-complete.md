# WhatsApp System Design - Complete Flow Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [Core Flows](#core-flows)
6. [Scalability & Performance](#scalability--performance)
7. [Security](#security)

---

## System Overview

### Problem Statement

Design and implement a WhatsApp-like messaging platform that supports:
- User registration and authentication (phone number based)
- 1-on-1 private messaging
- Group messaging (up to 256 members)
- Media sharing (images, videos, audio, documents, location)
- Real-time message delivery
- Message status tracking (sent, delivered, read)
- Online/offline presence
- End-to-end encryption

### Requirements

**Functional Requirements:**
- Users can register with phone number and verify via OTP
- Users can send text messages to other users
- Users can create and manage groups
- Users can send media files (images, videos, documents)
- Messages delivered in real-time if recipient is online
- Messages queued and delivered when recipient comes online
- Message status tracking (sent → delivered → read)
- Online/offline status visibility
- Last seen timestamp
- Contact management

**Non-Functional Requirements:**
- Message delivery: < 100ms (if online)
- Message delivery: < 5 seconds (if offline, via push)
- System should handle 1B+ users, 100B+ messages/day
- High availability (99.99% uptime)
- End-to-end encryption
- Scalable architecture
- Low latency for real-time messaging

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│         (Mobile App, Web App, API Clients)                  │
└───────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer                             │
│              (Distributes requests)                          │
└───────────────────────┬───────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   App Server │ │   App Server │ │   App Server │
│   Instance 1 │ │   Instance 2 │ │   Instance N │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │    Redis     │ │  AWS S3      │
│  (Primary)   │ │   (Cache +   │ │  (Media      │
│              │ │   Pub/Sub)   │ │   Storage)   │
└──────┬───────┘ └──────────────┘ └──────────────┘
       │
       ▼
┌──────────────┐
│ PostgreSQL   │
│  (Replica)   │
└──────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│              WebSocket Server Cluster                       │
│         (Real-time message delivery)                        │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│              Push Notification Service                       │
│         (FCM/APNS for offline delivery)                     │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │   Chat      │  │   Message    │     │
│  │  Service     │  │  Service    │  │  Service     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│  ┌──────┴─────────────────┴─────────────────┴──────┐     │
│  │              Group Service                        │     │
│  └───────────────────────┬───────────────────────────┘     │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────────┐     │
│  │         Message Delivery Service                    │     │
│  │    (WebSocket + Push Notifications)                 │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │    Redis     │ │  Media       │ │  WebSocket   │
│  Database     │ │    Cache     │ │  Storage     │ │  Server      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    users    │         │    chats    │
├─────────────┤         ├─────────────┤
│ id (PK)     │◄──┐     │ id (PK)     │
│ phone_num   │   │     │ user1_id(FK)│──┐
│ username    │   │     │ user2_id(FK)│──┤
│ full_name   │   │     │ last_msg_id │  │
│ profile_pic │   │     │ last_msg_at │  │
│ status_msg  │   │     │ user1_unread│  │
│ last_seen   │   │     │ user2_unread│  │
│ is_online   │   │     └─────────────┘  │
└─────────────┘   │                      │
                  │     ┌─────────────┐  │
                  │     │   messages   │  │
                  │     ├─────────────┤  │
                  │     │ id (PK)     │  │
                  └─────┤ chat_id(FK) │──┘
                        │ sender_id(FK)│──┐
                        │ content     │  │
                        │ msg_type    │  │
                        │ media_url   │  │
                        │ created_at  │  │
                        └─────────────┘  │
                                         │
                        ┌─────────────┐  │
                        │msg_status   │  │
                        ├─────────────┤  │
                        │msg_id(FK)   │──┘
                        │user_id(FK)  │──┐
                        │status       │  │
                        └─────────────┘  │
                                         │
                        ┌─────────────┐  │
                        │   groups    │  │
                        ├─────────────┤  │
                        │ id (PK)     │  │
                        │ name        │  │
                        │ created_by  │──┘
                        └─────────────┘
                                │
                        ┌─────────────┐
                        │group_members│
                        ├─────────────┤
                        │group_id(FK) │
                        │user_id(FK)  │
                        │role         │
                        └─────────────┘
```

### Table Schemas

#### 1. Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    profile_picture_url TEXT,
    status_message TEXT,
    last_seen TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_online ON users(is_online);
```

**Design Decisions:**
- Phone number as primary identifier (WhatsApp standard)
- Denormalized `is_online` flag for fast presence checks
- `last_seen` timestamp for offline status
- Soft delete with `is_active` flag

#### 2. Chats Table (1-on-1)

```sql
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP,
    user1_unread_count INTEGER DEFAULT 0,
    user2_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id),
    CONSTRAINT no_self_chat CHECK (user1_id != user2_id)
);

-- Indexes
CREATE INDEX idx_chats_user1_id ON chats(user1_id);
CREATE INDEX idx_chats_user2_id ON chats(user2_id);
CREATE INDEX idx_chats_last_message_at ON chats(last_message_at DESC);
```

**Design Decisions:**
- Composite unique constraint ensures one chat per user pair
- Denormalized unread counts for fast badge updates
- `last_message_at` for sorting chats by recency
- Check constraint prevents self-chat

#### 3. Messages Table

```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'video', 'audio', 'document', 'location'
    media_url TEXT,
    media_thumbnail_url TEXT,
    media_size INTEGER, -- in bytes
    media_duration INTEGER, -- in seconds (for audio/video)
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(10, 8),
    reply_to_message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    is_forwarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chat_or_group CHECK (
        (chat_id IS NOT NULL AND group_id IS NULL) OR 
        (chat_id IS NULL AND group_id IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_group_id ON messages(group_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_reply_to_message_id ON messages(reply_to_message_id);
```

**Design Decisions:**
- Support for both chat and group messages
- Multiple message types with flexible schema
- Media metadata (size, duration) for optimization
- Reply-to functionality for threaded conversations
- Forwarded flag for message forwarding

#### 4. Message Status Table

```sql
CREATE TABLE message_status (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'read'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- Indexes
CREATE INDEX idx_message_status_message_id ON message_status(message_id);
CREATE INDEX idx_message_status_user_id ON message_status(user_id);
CREATE INDEX idx_message_status_status ON message_status(status);
```

**Design Decisions:**
- Separate table for status tracking (scalable)
- Status per user (important for group messages)
- Unique constraint prevents duplicate statuses
- Timestamps for status change tracking

#### 5. Groups Table

```sql
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    profile_picture_url TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_groups_created_by ON groups(created_by);
```

#### 6. Group Members Table

```sql
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
    unread_count INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- Indexes
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
```

#### 7. Contacts Table

```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_phone_number VARCHAR(20) NOT NULL,
    contact_name VARCHAR(255),
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, contact_phone_number)
);

-- Indexes
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_phone_number ON contacts(contact_phone_number);
```

#### 8. Blocked Users Table

```sql
CREATE TABLE blocked_users (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Indexes
CREATE INDEX idx_blocked_users_blocker_id ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked_id ON blocked_users(blocked_id);
```

---

## API Design

### RESTful API Endpoints

#### Authentication Endpoints

```
POST   /api/auth/register          Register new user (phone number)
POST   /api/auth/verify-otp       Verify OTP and complete registration
POST   /api/auth/login            Login user (phone number + password)
POST   /api/auth/logout           Logout user
```

#### User Endpoints

```
GET    /api/users/me               Get current user profile
PUT    /api/users/me               Update current user profile
GET    /api/users/search           Search users by phone number
GET    /api/users/:id              Get user profile
PUT    /api/users/me/online        Update online status
PUT    /api/users/me/last-seen     Update last seen timestamp
```

#### Chat Endpoints

```
GET    /api/chats                  Get user's chats
GET    /api/chats/:chatId/messages Get chat messages
POST   /api/chats/:chatId/read     Mark chat as read
```

#### Message Endpoints

```
POST   /api/messages/chat          Send chat message
POST   /api/messages/group         Send group message
GET    /api/messages/group/:groupId Get group messages
PUT    /api/messages/:messageId/status Update message status
DELETE /api/messages/:messageId     Delete message
```

#### Group Endpoints

```
POST   /api/groups                 Create new group
GET    /api/groups                 Get user's groups
GET    /api/groups/:groupId        Get group details
POST   /api/groups/:groupId/members Add member to group
DELETE /api/groups/:groupId/members/:userId Remove member
PUT    /api/groups/:groupId        Update group
DELETE /api/groups/:groupId        Delete group
```

#### Contact Endpoints

```
POST   /api/contacts                Add contact
GET    /api/contacts               Get user's contacts
PUT    /api/contacts/:phoneNumber  Update contact
DELETE /api/contacts/:phoneNumber  Delete contact
POST   /api/contacts/block         Block user
POST   /api/contacts/unblock       Unblock user
GET    /api/contacts/blocked       Get blocked users
```

### Request/Response Examples

#### Register User

**Request:**
```json
POST /api/auth/register
{
  "phone_number": "+1234567890",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "message": "OTP sent to phone number",
  "otp_expires_in": 300
}
```

#### Verify OTP

**Request:**
```json
POST /api/auth/verify-otp
{
  "phone_number": "+1234567890",
  "otp": "123456",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "phone_number": "+1234567890",
    "full_name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Send Chat Message

**Request:**
```json
POST /api/messages/chat
Authorization: Bearer <token>
{
  "receiver_id": 2,
  "content": "Hello!",
  "message_type": "text"
}
```

**Response:**
```json
{
  "id": 123,
  "chat_id": 1,
  "sender_id": 1,
  "receiver_id": 2,
  "content": "Hello!",
  "message_type": "text",
  "status": "sent",
  "created_at": "2024-01-01T12:00:00.000Z"
}
```

#### Create Group

**Request:**
```json
POST /api/groups
Authorization: Bearer <token>
{
  "name": "Family Group",
  "description": "Family chat",
  "member_ids": [2, 3, 4]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Family Group",
  "description": "Family chat",
  "created_by": 1,
  "created_at": "2024-01-01T12:00:00.000Z",
  "members": [
    {"user_id": 1, "role": "admin"},
    {"user_id": 2, "role": "member"},
    {"user_id": 3, "role": "member"},
    {"user_id": 4, "role": "member"}
  ]
}
```

---

## Core Flows

### 1. User Registration Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ POST /api/auth/register
     │ {phone_number, full_name}
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Validate phone number           │
│     └─ Check format                │
│                                     │
│  2. Check if user exists            │
│     └─ SELECT FROM users            │
│                                     │
│  3. Generate OTP                    │
│     └─ 6-digit random number        │
│                                     │
│  4. Store OTP in Redis              │
│     └─ Key: otp:phone_number        │
│        TTL: 5 minutes               │
│                                     │
│  5. Send OTP via SMS                │
│     └─ Twilio/AWS SNS               │
│                                     │
│  6. Return success                 │
└────┬────────────────────────────────┘
     │
     │ Response: {message: "OTP sent"}
     ▼
┌─────────┐
│  User   │
└─────────┘
```

**Detailed Steps:**

**Step 1: Validation**
```typescript
// Phone number validation
const phoneRegex = /^\+[1-9]\d{1,14}$/;
if (!phoneRegex.test(phoneNumber)) {
  throw new Error('Invalid phone number format');
}
```

**Step 2: Check Existing User**
```sql
SELECT id FROM users WHERE phone_number = $1;
```

**Step 3: Generate OTP**
```typescript
const otp = Math.floor(100000 + Math.random() * 900000).toString();
await redis.set(`otp:${phoneNumber}`, otp, 'EX', 300); // 5 minutes
```

**Step 4: Send OTP**
```typescript
await smsService.send(phoneNumber, `Your WhatsApp OTP is: ${otp}`);
```

**Performance:**
- Database query: ~10ms
- Redis write: ~5ms
- SMS sending: ~500ms-1s (async)
- Total: ~15-20ms (SMS async)

---

### 2. OTP Verification & Registration Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ POST /api/auth/verify-otp
     │ {phone_number, otp, password}
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Validate OTP                    │
│     └─ GET from Redis               │
│                                     │
│  2. Verify OTP matches              │
│                                     │
│  3. Hash password (bcrypt)          │
│                                     │
│  4. Create user record              │
│     └─ INSERT INTO users            │
│                                     │
│  5. Generate JWT token              │
│                                     │
│  6. Delete OTP from Redis           │
│                                     │
│  7. Return user + token             │
└────┬────────────────────────────────┘
     │
     │ Response: {user, token}
     ▼
┌─────────┐
│  User   │
└─────────┘
```

**Detailed Steps:**

**Step 1: Verify OTP**
```typescript
const storedOtp = await redis.get(`otp:${phoneNumber}`);
if (!storedOtp || storedOtp !== otp) {
  throw new Error('Invalid or expired OTP');
}
```

**Step 2: Create User**
```sql
INSERT INTO users (phone_number, password_hash, full_name)
VALUES ($1, $2, $3)
RETURNING *;
```

**Step 3: Generate Token**
```typescript
const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
  expiresIn: '30d'
});
```

**Performance:**
- Redis read: ~5ms
- Password hashing: ~100ms
- Database insert: ~20ms
- Token generation: ~1ms
- Total: ~126ms

---

### 3. Send Message Flow (Online Recipient)

```
┌─────────┐
│ User A  │
└────┬────┘
     │
     │ POST /api/messages/chat
     │ {receiver_id, content}
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Authenticate User A             │
│                                     │
│  2. Validate receiver exists       │
│     └─ SELECT FROM users            │
│                                     │
│  3. Check if blocked                │
│     └─ SELECT FROM blocked_users    │
│                                     │
│  4. Get or create chat              │
│     └─ SELECT/INSERT INTO chats     │
│                                     │
│  5. Create message record           │
│     └─ INSERT INTO messages         │
│                                     │
│  6. Create message status           │
│     └─ INSERT INTO message_status   │
│                                     │
│  7. Update chat last message        │
│     └─ UPDATE chats                 │
│                                     │
│  8. Check if User B is online       │
│     └─ Check Redis/WebSocket        │
│                                     │
│  9a. User B ONLINE                  │
│      ├─ Send via WebSocket          │
│      ├─ Update status to 'delivered'│
│      └─ Return success              │
│                                     │
│  9b. User B OFFLINE                  │
│      ├─ Queue message                │
│      ├─ Send push notification       │
│      └─ Return success              │
└────┬────────────────────────────────┘
     │
     │ Response: {message}
     ▼
┌─────────┐
│ User A  │
└─────────┘
```

**Detailed Steps:**

**Step 1-3: Validation**
```sql
-- Check receiver exists
SELECT id, is_online FROM users WHERE id = $1 AND is_active = TRUE;

-- Check if blocked
SELECT 1 FROM blocked_users 
WHERE blocker_id = $1 AND blocked_id = $2;
```

**Step 4: Get or Create Chat**
```sql
-- Ensure user1_id < user2_id for consistency
INSERT INTO chats (user1_id, user2_id)
VALUES (LEAST($1, $2), GREATEST($1, $2))
ON CONFLICT (user1_id, user2_id) DO NOTHING
RETURNING *;
```

**Step 5: Create Message**
```sql
INSERT INTO messages (chat_id, sender_id, content, message_type)
VALUES ($1, $2, $3, 'text')
RETURNING *;
```

**Step 6: Create Status**
```sql
INSERT INTO message_status (message_id, user_id, status)
VALUES ($1, $2, 'sent');
```

**Step 7: Update Chat**
```sql
UPDATE chats 
SET last_message_id = $1,
    last_message_at = CURRENT_TIMESTAMP,
    user2_unread_count = user2_unread_count + 1
WHERE id = $2;
```

**Step 8: Real-time Delivery**
```typescript
// Check if user is online
const isOnline = await redis.get(`user:online:${receiverId}`);

if (isOnline) {
  // Send via WebSocket
  const socket = socketManager.getSocket(receiverId);
  if (socket) {
    socket.emit('new_message', message);
    
    // Update status to delivered
    await updateMessageStatus(messageId, receiverId, 'delivered');
  }
} else {
  // Queue for offline delivery
  await messageQueue.add({
    messageId,
    receiverId,
    type: 'chat_message'
  });
  
  // Send push notification
  await pushNotificationService.send(receiverId, {
    title: senderName,
    body: content,
    data: { messageId, chatId }
  });
}
```

**Performance:**
- Database operations: ~50ms
- WebSocket delivery: ~10ms (if online)
- Push notification: ~200ms (if offline, async)
- Total: ~60ms (online), ~250ms (offline)

---

### 4. Message Status Update Flow (Read Receipt)

```
┌─────────┐
│ User B  │
└────┬────┘
     │
     │ PUT /api/messages/:messageId/status
     │ {status: "read"}
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Authenticate User B             │
│                                     │
│  2. Verify message exists           │
│     └─ SELECT FROM messages         │
│                                     │
│  3. Verify User B is recipient     │
│                                     │
│  4. Update message status           │
│     └─ UPDATE message_status        │
│                                     │
│  5. Notify sender (User A)          │
│     └─ WebSocket emit               │
│                                     │
│  6. Mark chat as read               │
│     └─ UPDATE chats                 │
│                                     │
│  7. Return success                 │
└────┬────────────────────────────────┘
     │
     │ Response: {message: "Status updated"}
     │
     │ WebSocket to User A:
     │ {messageId, status: "read"}
     ▼
┌─────────┐
│ User A  │
└─────────┘
```

**Detailed Steps:**

**Step 1-3: Validation**
```sql
-- Verify message and recipient
SELECT m.*, c.user1_id, c.user2_id
FROM messages m
JOIN chats c ON m.chat_id = c.id
WHERE m.id = $1 
  AND (c.user1_id = $2 OR c.user2_id = $2);
```

**Step 4: Update Status**
```sql
UPDATE message_status
SET status = 'read', updated_at = CURRENT_TIMESTAMP
WHERE message_id = $1 AND user_id = $2;
```

**Step 5: Notify Sender**
```typescript
const senderId = message.sender_id;
const senderSocket = socketManager.getSocket(senderId);

if (senderSocket) {
  senderSocket.emit('message_status_update', {
    messageId,
    status: 'read',
    updatedAt: new Date()
  });
}
```

**Step 6: Mark Chat Read**
```sql
UPDATE chats
SET user2_unread_count = 0
WHERE id = $1 AND user2_id = $2;
```

**Performance:**
- Database update: ~20ms
- WebSocket notification: ~10ms
- Total: ~30ms

---

### 5. Group Message Flow

```
┌─────────┐
│ User A  │
└────┬────┘
     │
     │ POST /api/messages/group
     │ {group_id, content}
     ▼
┌─────────────────────────────────────┐
│      Application Server             │
│                                     │
│  1. Authenticate User A             │
│                                     │
│  2. Verify User A is group member   │
│     └─ SELECT FROM group_members    │
│                                     │
│  3. Create message record           │
│     └─ INSERT INTO messages         │
│                                     │
│  4. Get all group members           │
│     └─ SELECT FROM group_members    │
│                                     │
│  5. Create status for each member   │
│     └─ INSERT INTO group_message_status │
│                                     │
│  6. Update unread counts            │
│     └─ UPDATE group_members         │
│                                     │
│  7. Deliver to online members      │
│     └─ WebSocket emit (group room) │
│                                     │
│  8. Queue for offline members       │
│     └─ Message queue + Push         │
│                                     │
│  9. Return success                 │
└────┬────────────────────────────────┘
     │
     │ Response: {message}
     │
     │ WebSocket to Group:
     │ {message, group_id}
     ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ User B  │ │ User C  │ │ User D  │
└─────────┘ └─────────┘ └─────────┘
```

**Detailed Steps:**

**Step 1-2: Validation**
```sql
-- Verify membership
SELECT * FROM group_members 
WHERE group_id = $1 AND user_id = $2;
```

**Step 3: Create Message**
```sql
INSERT INTO messages (group_id, sender_id, content, message_type)
VALUES ($1, $2, $3, 'text')
RETURNING *;
```

**Step 4-5: Create Statuses**
```sql
-- Get all members except sender
SELECT user_id FROM group_members 
WHERE group_id = $1 AND user_id != $2;

-- Create status for each member
INSERT INTO group_message_status (message_id, user_id, status)
VALUES ($1, $2, 'sent'), ($1, $3, 'sent'), ...;
```

**Step 6: Update Unread Counts**
```sql
UPDATE group_members
SET unread_count = unread_count + 1
WHERE group_id = $1 AND user_id != $2;
```

**Step 7: Real-time Delivery**
```typescript
// Emit to all group members via WebSocket
io.to(`group:${groupId}`).emit('new_group_message', {
  message,
  groupId
});

// Update status to delivered for online members
const onlineMembers = await getOnlineMembers(groupId);
for (const memberId of onlineMembers) {
  await updateGroupMessageStatus(messageId, memberId, 'delivered');
}
```

**Performance:**
- Database operations: ~100ms (for 50 members)
- WebSocket broadcast: ~20ms
- Total: ~120ms

---

### 6. Offline Message Delivery Flow

```
┌─────────────────────────────────────┐
│      Message Queue Worker            │
│                                     │
│  1. Poll message queue              │
│     └─ Redis List / RabbitMQ        │
│                                     │
│  2. Get queued messages              │
│                                     │
│  3. Check if user is now online     │
│     └─ Check Redis/WebSocket        │
│                                     │
│  4a. User ONLINE                     │
│      ├─ Send via WebSocket           │
│      ├─ Update status to 'delivered' │
│      └─ Remove from queue            │
│                                     │
│  4b. User OFFLINE                     │
│      ├─ Keep in queue                │
│      └─ Retry later                  │
└─────────────────────────────────────┘
```

**Queue Structure:**
```typescript
// Redis List
LPUSH message_queue:user_id {messageId, chatId, content}
BRPOP message_queue:user_id 0 // Blocking pop

// Or RabbitMQ
channel.consume('message_queue', (msg) => {
  const message = JSON.parse(msg.content);
  deliverMessage(message);
});
```

**Delivery Logic:**
```typescript
async function deliverQueuedMessages(userId: number) {
  const queueKey = `message_queue:${userId}`;
  
  while (true) {
    const messageData = await redis.brpop(queueKey, 5); // 5 second timeout
    
    if (!messageData) break;
    
    const message = JSON.parse(messageData[1]);
    const isOnline = await checkUserOnline(userId);
    
    if (isOnline) {
      // Deliver via WebSocket
      await deliverMessage(userId, message);
      await updateMessageStatus(message.messageId, userId, 'delivered');
    } else {
      // Re-queue
      await redis.lpush(queueKey, JSON.stringify(message));
      break;
    }
  }
}
```

---

## Scalability & Performance

### Caching Strategy

#### 1. User Presence Cache (Redis)

**Structure:**
```
Key: user:online:user_id
Type: String
Value: "true" / "false"
TTL: 5 minutes (refresh on activity)

Key: user:last_seen:user_id
Type: String
Value: timestamp
TTL: 1 day
```

**Operations:**
```typescript
// Set online status
await redis.set(`user:online:${userId}`, 'true', 'EX', 300);

// Update last seen
await redis.set(`user:last_seen:${userId}`, Date.now().toString(), 'EX', 86400);

// Check online status
const isOnline = await redis.get(`user:online:${userId}`) === 'true';
```

#### 2. Chat List Cache (Redis Sorted Sets)

**Structure:**
```
Key: chats:user_id
Type: Sorted Set
Score: last_message_at (timestamp)
Member: chat_id
```

**Operations:**
```typescript
// Add chat to user's list
await redis.zadd(`chats:${userId}`, lastMessageAt, chatId);

// Get user's chats (sorted by recency)
const chatIds = await redis.zrange(`chats:${userId}`, 0, 49, { REV: true });
```

#### 3. Message Cache (Redis)

**Structure:**
```
Key: message:message_id
Type: String (JSON)
TTL: 1 hour

Key: messages:chat_id:offset
Type: List
Value: [message_id1, message_id2, ...]
TTL: 30 minutes
```

**Cache Invalidation:**
- On new message: Add to cache
- On message delete: Remove from cache
- TTL-based expiration

### Database Optimization

#### Indexes

**Messages Table:**
```sql
-- Composite index for chat messages
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);

-- Composite index for group messages
CREATE INDEX idx_messages_group_created ON messages(group_id, created_at DESC);

-- Covering index for message list
CREATE INDEX idx_messages_chat_covering ON messages(chat_id, created_at DESC)
INCLUDE (sender_id, content, message_type, media_url);
```

**Chats Table:**
```sql
-- Index for user's chats
CREATE INDEX idx_chats_user1_last_msg ON chats(user1_id, last_message_at DESC);
CREATE INDEX idx_chats_user2_last_msg ON chats(user2_id, last_message_at DESC);
```

#### Partitioning

**Messages Table Partitioning:**
```sql
-- Partition by month
CREATE TABLE messages_2024_01 PARTITION OF messages
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE messages_2024_02 PARTITION OF messages
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

**Benefits:**
- Faster queries (smaller partitions)
- Easier archiving (drop old partitions)
- Better maintenance

### WebSocket Scaling

#### WebSocket Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Load Balancer (Sticky Sessions)                │
└───────────────────────┬───────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ WebSocket    │ │ WebSocket    │ │ WebSocket    │
│ Server 1     │ │ Server 2     │ │ Server N     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Redis Pub/Sub (Message Broadcasting)            │
└─────────────────────────────────────────────────────────────┘
```

**Sticky Sessions:**
- Use session affinity (cookie-based)
- Ensures user connects to same server
- Required for WebSocket connections

**Redis Pub/Sub for Cross-Server Communication:**
```typescript
// Server 1 receives message for User B
// User B is connected to Server 2

// Publish to Redis
redis.publish(`user:${userId}`, JSON.stringify({
  type: 'new_message',
  message
}));

// Server 2 subscribes
redis.subscribe(`user:${userId}`, (message) => {
  const socket = socketManager.getSocket(userId);
  if (socket) {
    socket.emit('new_message', JSON.parse(message));
  }
});
```

### Message Queue Strategy

#### Queue Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Application Servers                           │
│         (Publish messages to queue)                       │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Message Queue (RabbitMQ/Redis)                │
│                                                             │
│  Queue: message_queue:user_id                              │
│  Exchange: message_exchange                                │
└───────────────────────┬───────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Worker 1     │ │ Worker 2     │ │ Worker N     │
│ (Delivers    │ │ (Delivers    │ │ (Delivers    │
│  messages)   │ │  messages)   │ │  messages)   │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Queue Implementation:**
```typescript
// Producer (Application Server)
await messageQueue.publish('message_delivery', {
  messageId,
  receiverId,
  content,
  type: 'chat_message'
});

// Consumer (Worker)
messageQueue.consume('message_delivery', async (message) => {
  const { messageId, receiverId } = message;
  
  const isOnline = await checkUserOnline(receiverId);
  
  if (isOnline) {
    await deliverViaWebSocket(receiverId, message);
  } else {
    await sendPushNotification(receiverId, message);
  }
});
```

### Media Storage Strategy

#### S3 Bucket Structure

```
whatsapp-media/
├── messages/
│   ├── {user_id}/
│   │   ├── {message_id}_image_{timestamp}.jpg
│   │   ├── {message_id}_video_{timestamp}.mp4
│   │   ├── {message_id}_audio_{timestamp}.mp3
│   │   └── {message_id}_document_{timestamp}.pdf
├── groups/
│   ├── {group_id}/
│   │   └── {message_id}_media_{timestamp}.{ext}
└── profile/
    └── {user_id}_{timestamp}.jpg
```

#### CDN Configuration

- CloudFront (AWS) or Cloudflare
- Cache media at edge locations
- TTL: 1 year (media doesn't change)
- Compression: Enable gzip/brotli

#### Media Optimization

- **Images**: Compress to 80% quality, max 2MB
- **Videos**: Transcode to H.264, max 16MB
- **Audio**: Compress to AAC, max 5MB
- **Thumbnails**: Generate for images/videos

### Horizontal Scaling

#### Application Servers

- Stateless design (JWT tokens)
- Load balancer distributes requests
- Auto-scaling based on CPU/memory
- Health checks every 30 seconds

#### Database Scaling

**Read Replicas:**
- Primary: Write operations
- Replicas: Read operations (message queries)
- Replication lag: <100ms

**Sharding Strategy:**
- Shard by user_id (hash-based)
- Each shard handles subset of users
- Cross-shard queries avoided

#### Redis Scaling

**Redis Cluster:**
- Shard by key prefix
- `user:online:*` keys distributed across nodes
- `chats:*` keys distributed across nodes
- Replication for high availability

---

## Security

### Authentication & Authorization

#### JWT Token Structure

```json
{
  "userId": 123,
  "phoneNumber": "+1234567890",
  "iat": 1704110400,
  "exp": 1704715200
}
```

**Security Measures:**
- Secret key: Strong random string (256 bits)
- Expiration: 30 days
- Refresh tokens: Optional (for mobile apps)
- Token rotation: On password change

#### OTP Security

- 6-digit random OTP
- Expires in 5 minutes
- Rate limiting: 3 OTP requests per hour
- Store in Redis with TTL

### End-to-End Encryption

#### Encryption Flow

```
User A                    Server                    User B
  │                         │                         │
  │ 1. Generate key pair    │                         │
  │    (RSA 2048)           │                         │
  │                         │                         │
  │ 2. Exchange public keys │                         │
  │    via server           │                         │
  │                         │                         │
  │ 3. Encrypt message      │                         │
  │    with User B's        │                         │
  │    public key           │                         │
  │                         │                         │
  │ 4. Send encrypted      │                         │
  │    message              │                         │
  │─────────────────────────>│                         │
  │                         │────────────────────────>│
  │                         │                         │
  │                         │                         │ 5. Decrypt with
  │                         │                         │    private key
```

**Implementation:**
```typescript
// User A encrypts message
const encryptedMessage = crypto.publicEncrypt(
  userBPublicKey,
  Buffer.from(messageContent)
);

// Server stores encrypted message (cannot read)
await MessageModel.create({
  content: encryptedMessage.toString('base64'),
  message_type: 'encrypted_text'
});

// User B decrypts message
const decryptedMessage = crypto.privateDecrypt(
  userBPrivateKey,
  Buffer.from(encryptedMessage, 'base64')
);
```

### Input Validation

#### Message Content Validation

```typescript
// Content length validation
if (content && content.length > 4096) {
  throw new Error('Message too long');
}

// Media size validation
if (mediaSize > 16 * 1024 * 1024) { // 16MB
  throw new Error('Media file too large');
}

// File type validation
const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg'];
if (!allowedTypes.includes(fileType)) {
  throw new Error('Invalid file type');
}
```

#### SQL Injection Prevention

- Parameterized queries (pg library)
- No string concatenation in SQL
- Input sanitization

### Rate Limiting

#### API Rate Limits

- **General API**: 100 requests/minute per IP
- **Messages**: 100 messages/minute per user
- **Media Upload**: 10 uploads/hour per user
- **OTP Requests**: 3 requests/hour per phone number

#### Implementation

```typescript
// Token bucket algorithm
const key = `rate_limit:${userId}:messages`;
const tokens = await get(key) || maxTokens;

if (tokens <= 0) {
  return 429 Too Many Requests;
}

await set(key, tokens - 1, windowSeconds);
```

### Data Protection

#### Encryption

- **At Rest**: S3 server-side encryption (SSE)
- **In Transit**: HTTPS/TLS 1.3
- **Database**: Encrypted connections (SSL)
- **Messages**: End-to-end encryption (optional)

#### Privacy

- User data: GDPR compliant
- Right to deletion: Soft delete + cleanup
- Data retention: 30 days after deletion
- Message retention: User-configurable

---

## Performance Metrics

### Target Metrics

| Operation | Target | Actual |
|-----------|--------|--------|
| Message Send (online) | < 100ms | ~60ms |
| Message Send (offline) | < 5s | ~250ms |
| Message Delivery (online) | < 50ms | ~30ms |
| Message Delivery (offline) | < 5s | ~2s |
| Chat List Load | < 200ms | ~150ms |
| Message History Load | < 300ms | ~200ms |
| Group Message Send | < 200ms | ~120ms |

### Capacity Planning

#### User Capacity

- **1M users**: Current architecture
- **10M users**: Add read replicas + Redis cluster
- **100M users**: Sharding + CDN + multiple regions
- **1B users**: Distributed architecture + edge computing

#### Message Capacity

- **100M messages/day**: Current architecture
- **1B messages/day**: Add message queue + workers
- **10B messages/day**: Partitioning + archiving
- **100B messages/day**: Distributed queues + cold storage

#### Storage Capacity

- **Average message size**: ~1KB (text), ~500KB (media)
- **100M messages/day**: ~50TB/day (with media)
- **S3 cost**: ~$1,000/month (standard storage)
- **Archiving**: Move old messages to Glacier after 1 year

---

## Monitoring & Observability

### Key Metrics

1. **Application Metrics**
   - Message send rate (messages/second)
   - Message delivery rate
   - Error rate (4xx, 5xx)
   - Response time (p50, p95, p99)
   - Active WebSocket connections
   - Online users count

2. **Database Metrics**
   - Query performance
   - Connection pool usage
   - Replication lag
   - Message insert rate

3. **Redis Metrics**
   - Memory usage
   - Hit rate
   - Pub/Sub message rate
   - Connection count

4. **WebSocket Metrics**
   - Active connections
   - Message throughput
   - Connection errors
   - Latency

5. **Queue Metrics**
   - Queue depth
   - Processing rate
   - Failed deliveries
   - Retry count

### Logging

- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized logging (CloudWatch/ELK)
- Message delivery logs
- Error tracking (Sentry)

### Alerting

- High error rate (>1%)
- Slow message delivery (p95 > 1s)
- Database connection pool exhaustion
- Redis memory > 80%
- Queue depth > 1000
- WebSocket connection failures

---

## Conclusion

This system design provides:

1. **Scalability**: Horizontal scaling with load balancers, read replicas, Redis clusters, and message queues
2. **Performance**: Real-time delivery via WebSocket, offline delivery via push notifications
3. **Reliability**: Redundancy at every layer, message queuing for guaranteed delivery
4. **Security**: End-to-end encryption, authentication, authorization, rate limiting
5. **Maintainability**: Clean architecture, separation of concerns, comprehensive documentation

The system can handle 1B+ users and 100B+ messages/day with sub-second response times for most operations. Real-time messaging is achieved through WebSocket connections, while offline users receive messages via push notifications when they come online.
