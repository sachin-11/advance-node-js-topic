# 🚕 Uber Clone Backend - Production-Grade System Design

Complete production-ready backend implementation of Uber system design with real-time capabilities.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Testing & API Tools](#testing--api-tools)
- [Socket Events](#socket-events)
- [Complete Flows](#complete-flows)

---

## 🏗️ Architecture Overview

```
┌─────────────┐                    ┌─────────────┐
│   Rider     │                    │   Driver    │
│  (Mobile)   │                    │  (Mobile)   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ HTTP + WebSocket                 │ HTTP + WebSocket
       ▼                                  ▼
┌─────────────────────────────────────────────────────┐
│         Express.js + Socket.io Server               │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Controllers │  │   Services   │  │  Models   │ │
│  │             │  │              │  │           │ │
│  │ - Ride      │  │ - Matching   │  │ - Driver  │ │
│  │ - Driver    │  │ - Payment    │  │ - Ride    │ │
│  │ - Stats     │  │ - Location   │  │           │ │
│  │             │  │ - Surge      │  │           │ │
│  └─────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│         In-Memory Storage (Maps)                    │
│  - Drivers (location, availability)                 │
│  - Rides (status, fare, history)                    │
│  - Location History                                 │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Core Features
- ✅ **Real-Time Driver Matching** - Nearest driver algorithm with distance calculation
- ✅ **Live Location Tracking** - GPS updates every 5 seconds with ETA calculation
- ✅ **Dynamic Pricing** - Surge pricing based on demand/supply ratio
- ✅ **Payment Processing** - Automatic fare calculation (base + distance + time + surge)
- ✅ **Ride Lifecycle** - Complete state management (PENDING → COMPLETED)
- ✅ **WebSocket Communication** - Real-time bidirectional events
- ✅ **REST API** - Complete HTTP endpoints for all operations

### Advanced Features
- ✅ **Haversine Distance Calculation** - Accurate GPS distance
- ✅ **ETA Estimation** - Real-time arrival time calculation
- ✅ **Automatic Driver Release** - Driver becomes available after ride completion
- ✅ **Location History** - Track driver movement history
- ✅ **Surge Zones** - Multiple geographic zones with independent pricing
- ✅ **Graceful Shutdown** - Proper cleanup on server stop

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-Time**: Socket.io
- **Storage**: In-Memory (Maps) - Production: Redis/PostgreSQL
- **Language**: JavaScript (ES6+)

---

## 📁 Project Structure

```
uber-clone-backend/
├── src/
│   ├── config/
│   │   └── index.js              # Configuration (fare, surge, cors)
│   ├── models/
│   │   ├── Driver.js             # Driver storage & operations
│   │   └── Ride.js               # Ride storage & state management
│   ├── services/
│   │   ├── MatchingService.js    # Driver matching algorithm
│   │   ├── PaymentService.js     # Fare calculation & payment
│   │   ├── LocationService.js    # GPS tracking & ETA
│   │   └── SurgePricingService.js # Dynamic pricing
│   ├── controllers/
│   │   ├── RideController.js     # Ride HTTP handlers
│   │   ├── DriverController.js   # Driver HTTP handlers
│   │   └── StatsController.js    # System stats
│   ├── routes/
│   │   └── index.js              # API route definitions
│   ├── socket/
│   │   └── index.js              # WebSocket event handlers
│   ├── utils/
│   │   └── distance.js           # Haversine formula
│   ├── app.js                    # Express app setup
│   └── server.js                 # Server entry point
├── .env                          # Environment variables
├── package.json
└── README.md
```

---

## 🚀 Installation

### 1. Install Dependencies
```bash
cd uber-clone-backend
npm install
```

### 2. Configure Environment
Copy `env.example.txt` to `.env` and configure:
```bash
# Copy the example file
cp env.example.txt .env
```

Edit `.env` file:
```env
PORT=3000
BASE_FARE=50
PER_KM_RATE=12
PER_MINUTE_RATE=2
SERVICE_FEE=10
GST_RATE=0.05
SURGE_ENABLED=true
```

### 3. Start Server
```bash
npm start
```

Server will run on `http://localhost:3000`

---

## 📡 API Documentation

### Health & Stats

#### GET /api/health
Health check endpoint
```json
{
  "status": "ok",
  "service": "uber-clone-backend",
  "timestamp": "2024-12-21T14:30:00.000Z"
}
```

#### GET /api/stats
System statistics
```json
{
  "drivers": { "total": 5, "available": 3, "busy": 2 },
  "rides": { "total": 10, "active": 2, "completed": 8 },
  "surge": [...]
}
```

### Rides

#### GET /api/rides
Get all rides
```json
{
  "success": true,
  "total": 10,
  "rides": [...]
}
```

#### GET /api/rides/active
Get active rides only
```json
{
  "success": true,
  "total": 2,
  "rides": [...]
}
```

#### GET /api/rides/:id
Get specific ride by ID
```json
{
  "success": true,
  "ride": {
    "id": "ride_123",
    "status": "MATCHED",
    "riderId": "rider_1",
    "driverId": "driver_1",
    ...
  }
}
```

#### POST /api/rides/request
Request a new ride (REST API)
```json
{
  "riderId": "rider_1",
  "riderName": "Alice Smith",
  "pickup": { "lat": 28.7, "lng": 77.1 },
  "dropoff": { "lat": 28.8, "lng": 77.2 },
  "rideType": "uberx",
  "zone": "downtown",
  "paymentMethod": "card"
}
```
Response:
```json
{
  "success": true,
  "message": "Ride requested successfully",
  "ride": {...},
  "driver": {...},
  "fare": {...}
}
```

#### POST /api/rides/estimate-fare
Estimate fare for a ride
```json
{
  "pickup": { "lat": 28.7, "lng": 77.1 },
  "dropoff": { "lat": 28.8, "lng": 77.2 },
  "surgeMultiplier": 1.5,
  "zone": "downtown"
}
```
Response:
```json
{
  "success": true,
  "estimate": {
    "distance": 5.2,
    "estimatedDuration": 10,
    "baseFare": 50,
    "total": 150
  }
}
```

#### POST /api/rides/:id/accept
Driver accepts a ride
```json
{
  "driverId": "driver_1"
}
```

#### POST /api/rides/:id/start
Start the ride (after driver arrives)

#### POST /api/rides/:id/complete
Complete the ride
Response includes receipt:
```json
{
  "success": true,
  "message": "Ride completed successfully",
  "ride": {...},
  "receipt": {
    "rideId": "ride_123",
    "fareBreakdown": {...},
    "total": 150
  }
}
```

#### POST /api/rides/:id/cancel
Cancel a ride
```json
{
  "reason": "Changed my mind"
}
```

### Drivers

#### GET /api/drivers
Get all drivers
```json
{
  "success": true,
  "total": 5,
  "available": 3,
  "busy": 2,
  "drivers": [...]
}
```

#### GET /api/drivers/available
Get available drivers only
```json
{
  "success": true,
  "total": 3,
  "drivers": [...]
}
```

#### GET /api/drivers/:id
Get specific driver
```json
{
  "success": true,
  "driver": {
    "id": "driver_1",
    "name": "John Doe",
    "isAvailable": true,
    "location": {...}
  }
}
```

#### GET /api/drivers/:id/history
Get driver's location history
```json
{
  "success": true,
  "driverId": "driver_1",
  "totalPoints": 50,
  "history": [
    {
      "location": { "lat": 28.7, "lng": 77.1 },
      "timestamp": "2024-12-21T14:30:00.000Z"
    }
  ]
}
```

#### PUT /api/drivers/:driverId/location
Update driver location (REST API)
```json
{
  "location": { "lat": 28.701, "lng": 77.102 }
}
```

---

## 🧪 Testing & API Tools

### OpenAPI/Swagger Documentation

The API includes a complete OpenAPI 3.0 specification:

**File**: `openapi.yaml`

**View Online:**
- Import `openapi.yaml` into [Swagger Editor](https://editor.swagger.io/)
- Or use [Swagger UI](https://swagger.io/tools/swagger-ui/) locally

**Features:**
- Complete API schema
- Request/response examples
- Parameter descriptions
- Error response documentation

### Postman Collection

**File**: `postman_collection.json`

**Import Steps:**
1. Open Postman
2. Click **Import** button
3. Select `postman_collection.json`
4. Collection will be imported with all endpoints pre-configured

**Collection Includes:**
- ✅ All REST API endpoints
- ✅ Pre-filled example requests
- ✅ Environment variables (`baseUrl`)
- ✅ Organized folders (Health, Stats, Rides, Drivers)

**Setup Environment Variable:**
- Create a new environment in Postman
- Add variable: `baseUrl` = `http://localhost:3000/api`

### RapidAPI / Insomnia

**For RapidAPI:**
1. Import `openapi.yaml` into RapidAPI
2. All endpoints will be automatically generated

**For Insomnia:**
1. Import `openapi.yaml` or `postman_collection.json`
2. Configure base URL: `http://localhost:3000/api`

### Quick Test Commands

**Using cURL:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get stats
curl http://localhost:3000/api/stats

# Request ride
curl -X POST http://localhost:3000/api/rides/request \
  -H "Content-Type: application/json" \
  -d '{
    "riderId": "rider_1",
    "pickup": {"lat": 28.7041, "lng": 77.1025},
    "dropoff": {"lat": 28.6139, "lng": 77.2090}
  }'
```

**See `API_EXAMPLES.md` for complete examples.**

---

## 🔌 Socket Events

### Driver Events

#### `driver:online`
Driver goes online
```javascript
socket.emit('driver:online', {
  driverId: 'driver_1',
  name: 'John Doe',
  location: { lat: 28.7, lng: 77.1 },
  vehicleType: 'uberx',
  zone: 'downtown'
});
```

#### `driver:location`
Update driver location (every 5s)
```javascript
socket.emit('driver:location', {
  driverId: 'driver_1',
  location: { lat: 28.701, lng: 77.102 },
  rideId: 'ride_123' // if on a ride
});
```

#### `driver:offline`
Driver goes offline
```javascript
socket.emit('driver:offline', {
  driverId: 'driver_1'
});
```

### Rider Events

#### `ride:request`
Request a ride
```javascript
socket.emit('ride:request', {
  riderId: 'rider_1',
  name: 'Alice Smith',
  pickup: { lat: 28.7, lng: 77.1 },
  dropoff: { lat: 28.8, lng: 77.2 },
  rideType: 'uberx',
  zone: 'downtown'
});
```

#### `rider:track`
Join ride tracking room
```javascript
socket.emit('rider:track', {
  rideId: 'ride_123'
});
```

### Ride Lifecycle Events

#### `ride:accept`
Driver accepts ride
```javascript
socket.emit('ride:accept', {
  rideId: 'ride_123'
});
```

#### `ride:start`
Start the ride
```javascript
socket.emit('ride:start', {
  rideId: 'ride_123'
});
```

#### `ride:complete`
Complete the ride
```javascript
socket.emit('ride:complete', {
  rideId: 'ride_123'
});
```

#### `ride:cancel`
Cancel the ride
```javascript
socket.emit('ride:cancel', {
  rideId: 'ride_123',
  reason: 'Rider cancelled'
});
```

### Server Events (Received)

#### `ride:matched`
Ride matched with driver
```javascript
socket.on('ride:matched', (data) => {
  // data.driver, data.fare, data.eta
});
```

#### `driver:location_update`
Real-time location update
```javascript
socket.on('driver:location_update', (data) => {
  // data.location, data.distance, data.eta
});
```

#### `ride:status_changed`
Ride status changed
```javascript
socket.on('ride:status_changed', (data) => {
  // data.status, data.message
});
```

#### `ride:completed`
Ride completed with receipt
```javascript
socket.on('ride:completed', (data) => {
  // data.receipt
});
```

---

## 🔄 Complete Flows

### 1. Ride Request Flow

```
1. Driver goes online
   → driver:online

2. Rider requests ride
   → ride:request
   
3. System finds nearest driver
   → Matching algorithm runs
   
4. Rider receives match
   ← ride:matched
   
5. Driver receives request
   ← ride:new_request
```

### 2. Real-Time Tracking Flow

```
1. Driver accepts ride
   → ride:accept
   
2. Driver updates location (every 5s)
   → driver:location
   
3. Rider receives updates
   ← driver:location_update (with ETA)
   
4. System detects arrival
   ← ride:status_changed (ARRIVED)
```

### 3. Ride Completion Flow

```
1. Driver starts ride
   → ride:start
   
2. Driver completes ride
   → ride:complete
   
3. System calculates fare
   → Payment service processes
   
4. Receipt generated
   ← ride:completed (with receipt)
   
5. Driver becomes available again
```

---

## 💡 Testing the Backend

### Using Browser Console

```javascript
// Connect
const socket = io('http://localhost:3000');

// Driver goes online
socket.emit('driver:online', {
  driverId: 'driver_1',
  name: 'John',
  location: { lat: 28.7, lng: 77.1 }
});

// Request ride
socket.emit('ride:request', {
  riderId: 'rider_1',
  name: 'Alice',
  pickup: { lat: 28.7, lng: 77.1 },
  dropoff: { lat: 28.8, lng: 77.2 }
});

// Listen for match
socket.on('ride:matched', (data) => {
  console.log('Matched!', data);
});
```

### Using Postman

1. Create WebSocket request
2. Connect to `ws://localhost:3000`
3. Send JSON events

---

## 🎯 Key Algorithms

### Haversine Distance Formula
```javascript
// Calculate distance between two GPS coordinates
const distance = calculateDistance(lat1, lng1, lat2, lng2);
// Returns distance in kilometers
```

### Surge Pricing Algorithm
```javascript
const ratio = activeRides / availableDrivers;

if (ratio >= 4.0) multiplier = 2.5;
else if (ratio >= 3.0) multiplier = 2.0;
else if (ratio >= 2.0) multiplier = 1.5;
else multiplier = 1.0;
```

### Fare Calculation
```javascript
const fare = baseFare + (distance × perKm) + (duration × perMinute);
const total = (fare × surgeMultiplier) + serviceFee + GST;
```

---

## 🚀 Production Deployment

For production, replace in-memory storage with:
- **Redis** - Driver locations (GeoIndex), active rides
- **PostgreSQL** - Rides, users, payments (persistent data)
- **MongoDB** - Ride history, analytics

Add:
- **Authentication** (JWT)
- **Rate Limiting**
- **Logging** (Winston)
- **Monitoring** (Prometheus)
- **Load Balancer** (Nginx)

---

**Built with ❤️ following Uber System Design principles**
