# 🚀 Quick Start Guide

## Installation

```bash
cd uber-clone-backend
npm install
```

## Run Examples

### Individual Examples:
```bash
npm run basic         # 01: Basic Setup
npm run driver        # 02: Driver Online
npm run ride          # 03: Ride Request
npm run matching      # 04: Driver Matching
npm run tracking      # 05: Location Tracking
npm run lifecycle     # 06: Ride Lifecycle
npm run payment       # 07: Payment Simulation
npm run surge         # 08: Surge Pricing
npm run complete      # 09: Complete Flow (RECOMMENDED)
```

### Run All:
```bash
npm run all
```

## Testing with Socket.io Client

### Using Browser Console:
```javascript
// Connect to server
const socket = io('http://localhost:3000');

// Driver goes online
socket.emit('driver:online', {
  driverId: 'driver_1',
  name: 'John',
  location: { lat: 28.7, lng: 77.1 }
});

// Rider requests ride
socket.emit('ride:request', {
  riderId: 'rider_1',
  name: 'Alice',
  pickup: { lat: 28.7, lng: 77.1 },
  dropoff: { lat: 28.8, lng: 77.2 }
});

// Listen for events
socket.on('ride:matched', (data) => {
  console.log('Ride matched!', data);
});
```

### Using Postman:
1. Create new WebSocket request
2. Connect to `ws://localhost:3000`
3. Send JSON events

## API Endpoints

```bash
# Health check
GET http://localhost:3000/health

# Get all drivers (Example 02)
GET http://localhost:3000/drivers

# Get all rides (Example 03)
GET http://localhost:3000/rides

# Get stats (Example 09)
GET http://localhost:3000/stats
```

## Recommended Flow

**Start with Example 09 (Complete Flow):**
```bash
npm run complete
```

This includes all features in one example!

---

**Happy Coding! 🎉**
