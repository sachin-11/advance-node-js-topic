# 🚕 API Usage Examples

Complete examples for testing the Uber Clone Backend API.

## Prerequisites

1. Start the server:
```bash
npm start
```

2. Server runs on `http://localhost:3000`

---

## REST API Examples

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "success": true,
  "status": "ok",
  "service": "uber-clone-backend",
  "timestamp": "2024-12-21T14:30:00.000Z"
}
```

### 2. Get System Stats

```bash
curl http://localhost:3000/api/stats
```

### 3. Request a Ride

```bash
curl -X POST http://localhost:3000/api/rides/request \
  -H "Content-Type: application/json" \
  -d '{
    "riderId": "rider_1",
    "riderName": "Alice Smith",
    "pickup": { "lat": 28.7041, "lng": 77.1025 },
    "dropoff": { "lat": 28.6139, "lng": 77.2090 },
    "rideType": "uberx",
    "zone": "downtown",
    "paymentMethod": "card"
  }'
```

**Note:** Make sure at least one driver is online (via WebSocket) before requesting a ride.

### 4. Estimate Fare

```bash
curl -X POST http://localhost:3000/api/rides/estimate-fare \
  -H "Content-Type: application/json" \
  -d '{
    "pickup": { "lat": 28.7041, "lng": 77.1025 },
    "dropoff": { "lat": 28.6139, "lng": 77.2090 },
    "zone": "downtown"
  }'
```

### 5. Get All Rides

```bash
curl http://localhost:3000/api/rides
```

### 6. Get Active Rides

```bash
curl http://localhost:3000/api/rides/active
```

### 7. Get Ride by ID

```bash
curl http://localhost:3000/api/rides/ride_1234567890_abc123
```

### 8. Accept Ride (Driver)

```bash
curl -X POST http://localhost:3000/api/rides/ride_1234567890_abc123/accept \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "driver_1"
  }'
```

### 9. Start Ride

```bash
curl -X POST http://localhost:3000/api/rides/ride_1234567890_abc123/start
```

### 10. Complete Ride

```bash
curl -X POST http://localhost:3000/api/rides/ride_1234567890_abc123/complete
```

### 11. Cancel Ride

```bash
curl -X POST http://localhost:3000/api/rides/ride_1234567890_abc123/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Changed my mind"
  }'
```

### 12. Get All Drivers

```bash
curl http://localhost:3000/api/drivers
```

### 13. Get Available Drivers

```bash
curl http://localhost:3000/api/drivers/available
```

### 14. Get Driver by ID

```bash
curl http://localhost:3000/api/drivers/driver_1
```

### 15. Get Driver Location History

```bash
curl http://localhost:3000/api/drivers/driver_1/history
```

### 16. Update Driver Location

```bash
curl -X PUT http://localhost:3000/api/drivers/driver_1/location \
  -H "Content-Type: application/json" \
  -d '{
    "location": { "lat": 28.7041, "lng": 77.1025 }
  }'
```

---

## WebSocket Examples

### Using Browser Console

Open browser console and run:

```javascript
// Connect to server
const socket = io('http://localhost:3000');

// Driver goes online
socket.emit('driver:online', {
  driverId: 'driver_1',
  name: 'John Doe',
  location: { lat: 28.7041, lng: 77.1025 },
  vehicleType: 'uberx',
  zone: 'downtown'
});

// Listen for driver status
socket.on('driver:status', (data) => {
  console.log('Driver status:', data);
});

// Rider requests ride
socket.emit('ride:request', {
  riderId: 'rider_1',
  name: 'Alice Smith',
  pickup: { lat: 28.7041, lng: 77.1025 },
  dropoff: { lat: 28.6139, lng: 77.2090 },
  rideType: 'uberx',
  zone: 'downtown'
});

// Listen for ride matched
socket.on('ride:matched', (data) => {
  console.log('Ride matched!', data);
});

// Driver accepts ride
socket.emit('ride:accept', {
  rideId: 'ride_123'
});

// Driver updates location
socket.emit('driver:location', {
  driverId: 'driver_1',
  location: { lat: 28.7050, lng: 77.1030 },
  rideId: 'ride_123'
});

// Listen for location updates
socket.on('driver:location_update', (data) => {
  console.log('Driver location:', data);
});

// Start ride
socket.emit('ride:start', {
  rideId: 'ride_123'
});

// Complete ride
socket.emit('ride:complete', {
  rideId: 'ride_123'
});
```

---

## Complete Flow Example

### Step 1: Driver Goes Online (WebSocket)
```javascript
socket.emit('driver:online', {
  driverId: 'driver_1',
  name: 'John Doe',
  location: { lat: 28.7041, lng: 77.1025 },
  vehicleType: 'uberx',
  zone: 'downtown'
});
```

### Step 2: Request Ride (REST API or WebSocket)
```bash
curl -X POST http://localhost:3000/api/rides/request \
  -H "Content-Type: application/json" \
  -d '{
    "riderId": "rider_1",
    "riderName": "Alice",
    "pickup": { "lat": 28.7041, "lng": 77.1025 },
    "dropoff": { "lat": 28.6139, "lng": 77.2090 }
  }'
```

### Step 3: Driver Accepts (REST API or WebSocket)
```bash
curl -X POST http://localhost:3000/api/rides/ride_123/accept \
  -H "Content-Type: application/json" \
  -d '{"driverId": "driver_1"}'
```

### Step 4: Driver Updates Location (WebSocket)
```javascript
socket.emit('driver:location', {
  driverId: 'driver_1',
  location: { lat: 28.7045, lng: 77.1028 },
  rideId: 'ride_123'
});
```

### Step 5: Start Ride (REST API or WebSocket)
```bash
curl -X POST http://localhost:3000/api/rides/ride_123/start
```

### Step 6: Complete Ride (REST API or WebSocket)
```bash
curl -X POST http://localhost:3000/api/rides/ride_123/complete
```

---

## Testing with Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set Base URL**: `http://localhost:3000`
3. **For WebSocket**: Use Postman's WebSocket feature
   - Connect to: `ws://localhost:3000`
   - Send JSON events as shown in WebSocket examples above

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (no drivers available)

---

**Happy Testing! 🚕**
