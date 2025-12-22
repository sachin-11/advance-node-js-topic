# 📖 API Documentation Index

Complete API documentation and testing resources for Uber Clone Backend.

## 📄 Available Documentation Files

### 1. **openapi.yaml** ⭐
   - **Type**: OpenAPI 3.0 Specification
   - **Use For**: 
     - Swagger UI
     - RapidAPI import
     - Code generation
     - API client generation
   - **How to Use**:
     - Import in Swagger Editor: https://editor.swagger.io/
     - Or see `SWAGGER_SETUP.md` for local setup

### 2. **postman_collection.json** ⭐
   - **Type**: Postman Collection v2.1
   - **Use For**:
     - Postman testing
     - Insomnia import
     - API testing automation
   - **How to Use**:
     - Import directly in Postman
     - All endpoints pre-configured
     - See `SWAGGER_SETUP.md` for details

### 3. **API_EXAMPLES.md**
   - **Type**: Markdown documentation
   - **Contains**:
     - cURL examples
     - WebSocket examples
     - Complete flow examples
   - **Use For**: Quick reference and copy-paste examples

### 4. **SWAGGER_SETUP.md**
   - **Type**: Setup guide
   - **Contains**:
     - Swagger UI setup
     - Postman import guide
     - RapidAPI setup
     - Troubleshooting tips
   - **Use For**: Step-by-step setup instructions

### 5. **README.md**
   - **Type**: Main documentation
   - **Contains**:
     - Architecture overview
     - Installation guide
     - API endpoints
     - WebSocket events
   - **Use For**: Complete project documentation

---

## 🚀 Quick Start Guide

### Option 1: Swagger Editor (Easiest - No Setup)

1. Go to: https://editor.swagger.io/
2. File → Import File → Select `openapi.yaml`
3. Click "Try it out" on any endpoint
4. Test directly in browser!

### Option 2: Postman (Best for Testing)

1. Open Postman
2. Import → Select `postman_collection.json`
3. Create environment variable: `baseUrl` = `http://localhost:3000/api`
4. Start testing!

### Option 3: RapidAPI

1. Go to: https://rapidapi.com/
2. Add New API → Import from OpenAPI
3. Upload `openapi.yaml`
4. Test in RapidAPI dashboard

---

## 📋 API Endpoints Summary

### Health & Stats
- `GET /api/health` - Health check
- `GET /api/stats` - System statistics

### Rides
- `GET /api/rides` - Get all rides
- `GET /api/rides/active` - Get active rides
- `GET /api/rides/:id` - Get ride by ID
- `POST /api/rides/request` - Request new ride
- `POST /api/rides/estimate-fare` - Estimate fare
- `POST /api/rides/:id/accept` - Accept ride
- `POST /api/rides/:id/start` - Start ride
- `POST /api/rides/:id/complete` - Complete ride
- `POST /api/rides/:id/cancel` - Cancel ride

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/available` - Get available drivers
- `GET /api/drivers/:id` - Get driver by ID
- `GET /api/drivers/:id/history` - Get location history
- `PUT /api/drivers/:driverId/location` - Update location

---

## 🔌 WebSocket Events

See `README.md` or `API_EXAMPLES.md` for complete WebSocket documentation.

**Key Events:**
- `driver:online` - Driver goes online
- `driver:location` - Update driver location
- `ride:request` - Request a ride
- `ride:accept` - Accept ride
- `ride:start` - Start ride
- `ride:complete` - Complete ride

---

## 🛠️ Testing Tools Comparison

| Tool | Best For | Setup Time | Interactive |
|------|----------|------------|-------------|
| **Swagger Editor** | Quick testing, Documentation | ⚡ Instant | ✅ Yes |
| **Postman** | API testing, Collections | ⚡ 2 min | ✅ Yes |
| **RapidAPI** | Public API, Code generation | ⚡ 5 min | ✅ Yes |
| **Insomnia** | REST client, Teams | ⚡ 2 min | ✅ Yes |
| **cURL** | Scripts, Automation | ⚡ Instant | ❌ No |

---

## 📝 File Structure

```
uber-clone-backend/
├── openapi.yaml              # OpenAPI 3.0 spec
├── postman_collection.json   # Postman collection
├── API_EXAMPLES.md           # cURL & WebSocket examples
├── SWAGGER_SETUP.md          # Setup guide
├── API_DOCS_INDEX.md         # This file
└── README.md                 # Main documentation
```

---

## 💡 Recommended Workflow

1. **Start Server:**
   ```bash
   npm start
   ```

2. **Import to Swagger/Postman:**
   - Use `openapi.yaml` for Swagger
   - Use `postman_collection.json` for Postman

3. **Test Health Endpoint:**
   - `GET /api/health`
   - Verify server is running

4. **Test Complete Flow:**
   - See `API_EXAMPLES.md` for complete ride flow
   - Or use Postman collection (pre-configured)

5. **Use WebSocket:**
   - See `API_EXAMPLES.md` for WebSocket examples
   - Or use browser console

---

## 🆘 Need Help?

- **Setup Issues**: See `SWAGGER_SETUP.md`
- **API Examples**: See `API_EXAMPLES.md`
- **Complete Docs**: See `README.md`
- **WebSocket**: See `README.md` → Socket Events section

---

**Happy Testing! 🚕**
