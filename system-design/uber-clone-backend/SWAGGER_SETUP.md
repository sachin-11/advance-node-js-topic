# 📚 Swagger/OpenAPI Setup Guide

Complete guide to set up and use Swagger UI for API documentation and testing.

## Option 1: Swagger Editor (Online - Easiest)

1. **Go to Swagger Editor:**
   - Visit: https://editor.swagger.io/

2. **Import OpenAPI File:**
   - Click **File** → **Import File**
   - Select `openapi.yaml` from this project
   - Or paste the contents directly

3. **View Documentation:**
   - Left panel: OpenAPI specification
   - Right panel: Interactive API documentation
   - Click "Try it out" to test endpoints

## Option 2: Swagger UI (Local Setup)

### Install Swagger UI

```bash
# Using Docker (Recommended)
docker run -p 8080:8080 -e SWAGGER_JSON=/openapi.yaml -v $(pwd)/openapi.yaml:/openapi.yaml swaggerapi/swagger-ui

# Or using npm
npm install -g swagger-ui-serve
swagger-ui-serve openapi.yaml
```

### Access Swagger UI
- Open browser: http://localhost:8080
- All endpoints will be visible and testable

## Option 3: Add Swagger to Express App

### Install Dependencies

```bash
npm install swagger-ui-express swagger-jsdoc
```

### Add to `src/app.js`

```javascript
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const YAML = require('yamljs');
const path = require('path');

// Load OpenAPI spec
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Uber Clone Backend API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

### Access Swagger UI
- URL: http://localhost:3000/api-docs
- Interactive API documentation with "Try it out" feature

## Option 4: Postman (Recommended for Testing)

### Import Collection

1. **Open Postman**
2. **Click Import** button (top left)
3. **Select File** → Choose `postman_collection.json`
4. **Collection imported!**

### Setup Environment

1. Click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Add variable:
   - **Variable**: `baseUrl`
   - **Initial Value**: `http://localhost:3000/api`
   - **Current Value**: `http://localhost:3000/api`
4. Click **Save**

### Use Collection

1. Select the environment you created
2. Navigate to **Uber Clone Backend API** collection
3. All endpoints are ready to use!
4. Click **Send** to test any endpoint

## Option 5: RapidAPI Testing

### Import to RapidAPI

1. **Go to RapidAPI:**
   - Visit: https://rapidapi.com/
   - Sign up / Login

2. **Create New API:**
   - Click **Add New API**
   - Select **Import from OpenAPI**
   - Upload `openapi.yaml` file

3. **Test Endpoints:**
   - All endpoints available in RapidAPI dashboard
   - Test directly from browser
   - Generate code snippets in multiple languages

## Option 6: Insomnia

### Import Collection

1. **Open Insomnia**
2. **Application** → **Preferences** → **Data** → **Import Data**
3. Select **Postman Collection** or **OpenAPI**
4. Choose `postman_collection.json` or `openapi.yaml`
5. Collection imported!

### Setup Environment

1. Click **Manage Environments**
2. Create new environment: `Local`
3. Add variable:
   - `baseUrl` = `http://localhost:3000/api`
4. Select environment from dropdown

## Testing Tips

### 1. Start Server First
```bash
npm start
```

### 2. Test Health Endpoint First
Always start with `/api/health` to verify server is running.

### 3. Request Ride Flow
1. **Driver Online** (via WebSocket or REST API)
2. **Request Ride** → Get ride ID
3. **Accept Ride** → Use ride ID from step 2
4. **Start Ride** → Use same ride ID
5. **Complete Ride** → Get receipt

### 4. Use Variables
In Postman/Insomnia, use variables:
- `{{baseUrl}}` for base URL
- `{{rideId}}` for ride ID (save from response)

### 5. WebSocket Testing
For WebSocket events, use:
- Browser console (see `API_EXAMPLES.md`)
- Postman WebSocket feature
- Socket.io client tools

## Quick Reference

| Tool | File | URL |
|------|------|-----|
| Swagger Editor | `openapi.yaml` | https://editor.swagger.io/ |
| Postman | `postman_collection.json` | Import in Postman |
| RapidAPI | `openapi.yaml` | https://rapidapi.com/ |
| Insomnia | `postman_collection.json` | Import in Insomnia |

## Troubleshooting

### Swagger UI Not Loading
- Check file path is correct
- Verify YAML syntax is valid
- Try online Swagger Editor first

### Postman Import Fails
- Ensure JSON is valid
- Try importing `openapi.yaml` instead
- Check Postman version (use latest)

### CORS Errors
- Server CORS is configured for `*`
- If testing from browser, ensure server is running
- Check `src/config/index.js` for CORS settings

---

**Happy Testing! 🚀**
