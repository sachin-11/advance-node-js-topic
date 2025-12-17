# WhatsApp Service

A production-ready WhatsApp-like messaging platform backend built with Node.js, TypeScript, Express, PostgreSQL, Redis, and AWS S3.

## Features

- **User Authentication**: Register and login with phone number and JWT tokens
- **1-on-1 Chats**: Private messaging between users
- **Group Chats**: Create and manage group conversations
- **Message Types**: Support for text, images, videos, audio, documents, and location
- **Message Status**: Track sent, delivered, and read receipts
- **Contacts Management**: Add, update, and manage contacts
- **Block/Unblock Users**: Block unwanted users
- **Media Storage**: Store media files in AWS S3 or local storage
- **Real-time Ready**: Architecture ready for WebSocket integration
- **Rate Limiting**: API and message rate limiting
- **Caching**: Redis-based caching for performance

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (persistence)
- **Cache**: Redis (caching + rate limiting)
- **Storage**: AWS S3 (media storage) or Local storage
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- AWS S3 bucket (optional, for media storage)

## Setup Instructions

### 1. Install Dependencies

```bash
cd whatsapp-backend-project
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

**For Local Storage (Recommended for Development):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whatsapp_db
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_URL=redis://localhost:6379

# Use local storage (no AWS S3 needed)
USE_S3=false
UPLOADS_DIR=uploads
BASE_URL=http://localhost:3000

JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

PORT=3000
```

**For AWS S3 (Production):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whatsapp_db
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_URL=redis://localhost:6379

# Use AWS S3
USE_S3=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=whatsapp-media
S3_CDN_URL=https://cdn.whatsapp.com

JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

PORT=3000
BASE_URL=http://localhost:3000
```

**Note:** By default, the app uses **local storage** (no AWS S3 required). Set `USE_S3=true` only if you want to use AWS S3.

### 3. Create PostgreSQL Database and Run Migrations

**Option 1: Use the setup script (Recommended)**

```bash
npm run setup-db
```

**Option 2: Manual setup**

```bash
# Create database
createdb -U postgres whatsapp_db

# Run migrations
npm run migrate
# Or manually:
# psql -U postgres -d whatsapp_db -f src/db/schema.sql
```

### 4. Start Services

```bash
# PostgreSQL
# Windows:
net start postgresql-x64-15
# macOS/Linux:
brew services start postgresql@15

# Redis
# Windows: Download and run Redis
# macOS/Linux:
brew services start redis
```

### 5. Start the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Documentation (Swagger)

Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

### How to Test APIs in Swagger UI:

1. **Start the server**: `npm run dev`
2. **Open Swagger UI**: http://localhost:3000/api-docs
3. **Register a user**: Use `/api/auth/register` endpoint
4. **Login**: Use `/api/auth/login` endpoint to get JWT token
5. **Authorize**: Click the "Authorize" button at the top, paste your JWT token
6. **Test endpoints**: All protected endpoints will now work with your token

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/search` - Search users by phone numbers
- `GET /api/users/:id` - Get user profile

### Chats

- `GET /api/chats` - Get user's chats
- `GET /api/chats/:chatId/messages` - Get chat messages
- `POST /api/chats/:chatId/read` - Mark chat as read

### Messages

- `POST /api/messages/chat` - Send a chat message
- `POST /api/messages/group` - Send a group message
- `GET /api/messages/group/:groupId` - Get group messages
- `PUT /api/messages/:messageId/status` - Update message status
- `DELETE /api/messages/:messageId` - Delete a message

### Groups

- `POST /api/groups` - Create a new group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:groupId` - Get group details
- `POST /api/groups/:groupId/members` - Add member to group
- `DELETE /api/groups/:groupId/members/:userId` - Remove member from group
- `PUT /api/groups/:groupId` - Update group
- `DELETE /api/groups/:groupId` - Delete group

### Contacts

- `POST /api/contacts` - Add a contact
- `GET /api/contacts` - Get user's contacts
- `PUT /api/contacts/:phoneNumber` - Update contact
- `DELETE /api/contacts/:phoneNumber` - Delete contact
- `POST /api/contacts/block` - Block a user
- `POST /api/contacts/unblock` - Unblock a user
- `GET /api/contacts/blocked` - Get blocked users

### Health

- `GET /health` - Health check

## Example Usage

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1234567890",
    "password": "password123",
    "full_name": "John Doe",
    "username": "johndoe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1234567890",
    "password": "password123"
  }'
```

### Send Chat Message

```bash
curl -X POST http://localhost:3000/api/messages/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiver_id": 2,
    "content": "Hello!",
    "message_type": "text"
  }'
```

### Create Group

```bash
curl -X POST http://localhost:3000/api/groups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Family Group",
    "description": "Family chat",
    "member_ids": [2, 3, 4]
  }'
```

## Rate Limits

- **API Requests**: 100 requests per minute per IP
- **Messages**: 100 messages per minute per user

## Project Structure

```
whatsapp-backend-project/
├── src/
│   ├── app.ts                    # Express app
│   ├── config/
│   │   ├── database.ts           # PostgreSQL client
│   │   ├── redis.ts              # Redis client
│   │   ├── s3.ts                 # AWS S3 client
│   │   ├── localStorage.ts       # Local storage
│   │   └── swagger.ts            # Swagger config
│   ├── controllers/
│   │   ├── authController.ts     # Auth endpoints
│   │   ├── userController.ts     # User endpoints
│   │   ├── chatController.ts     # Chat endpoints
│   │   ├── messageController.ts  # Message endpoints
│   │   ├── groupController.ts    # Group endpoints
│   │   └── contactController.ts  # Contact endpoints
│   ├── services/
│   │   ├── authService.ts        # Authentication logic
│   │   ├── chatService.ts        # Chat operations
│   │   ├── messageService.ts     # Message operations
│   │   ├── groupService.ts       # Group operations
│   │   └── contactService.ts     # Contact operations
│   ├── models/
│   │   ├── userModel.ts
│   │   ├── chatModel.ts
│   │   ├── messageModel.ts
│   │   ├── groupModel.ts
│   │   ├── contactModel.ts
│   │   └── types.ts
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   └── errorHandler.ts       # Error handling
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── chatRoutes.ts
│   │   ├── messageRoutes.ts
│   │   ├── groupRoutes.ts
│   │   └── contactRoutes.ts
│   └── db/
│       └── schema.sql            # Database schema
├── scripts/
│   └── setup-db.js               # Database setup script
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

The database includes the following main tables:

- **users**: User accounts with phone numbers
- **chats**: 1-on-1 chat conversations
- **groups**: Group chat conversations
- **group_members**: Group membership
- **messages**: Messages (both chat and group)
- **message_status**: Message delivery/read status
- **group_message_status**: Group message status
- **contacts**: User contacts
- **blocked_users**: Blocked users

## Future Enhancements

- WebSocket integration for real-time messaging
- Push notifications
- Message encryption
- Voice/video call support
- Status updates (like WhatsApp Status)
- Message forwarding
- Message search
- Media compression and optimization

## License

MIT
