# Swagger API Documentation Guide

## 📚 Overview

Quick Commerce Backend uses Swagger/OpenAPI for interactive API documentation. This allows you to test all API endpoints directly from your browser.

## 🚀 Access Swagger UI

Once your application is running, access Swagger documentation at:

**Local Development:**
```
http://localhost:3000/api-docs
```

**Production:**
```
https://api.quickcommerce.com/api-docs
```

## 🎯 Features

### 1. Interactive API Testing
- Test all endpoints directly from the browser
- See request/response examples
- Try different parameters and payloads

### 2. Complete API Documentation
- All endpoints are documented with:
  - Description
  - Request parameters
  - Request body schemas
  - Response schemas
  - Status codes

### 3. Authentication Support
- JWT Bearer token authentication
- Token persistence across sessions
- Easy token management

## 📖 Available Endpoints

### Root Endpoints
- **GET /** - API information and available endpoints

### Health Endpoints
- **GET /health** - Health check (memory, disk usage)

### API Endpoints
- **GET /api** - Welcome message

## 🔐 Authentication

### Using JWT Authentication

1. Click the **"Authorize"** button at the top of Swagger UI
2. Enter your JWT token in the format: `Bearer <your-token>`
3. Click **"Authorize"**
4. All protected endpoints will now use this token

### Example Token Format
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Testing Endpoints

### Step-by-Step Guide

1. **Open Swagger UI**
   ```
   http://localhost:3000/api-docs
   ```

2. **Expand an endpoint**
   - Click on any endpoint to expand it
   - See detailed information about the endpoint

3. **Try it out**
   - Click the **"Try it out"** button
   - Fill in any required parameters
   - Click **"Execute"**

4. **View Response**
   - See the response status code
   - View response body
   - Check response headers

### Example: Testing Health Endpoint

1. Navigate to `GET /health` endpoint
2. Click **"Try it out"**
3. Click **"Execute"**
4. View the response:
   ```json
   {
     "status": "ok",
     "info": {
       "memory_heap": { "status": "up" },
       "memory_rss": { "status": "up" },
       "storage": { "status": "up" }
     }
   }
   ```

## 📝 API Tags

Endpoints are organized by tags:

- **Root** - Root endpoint and API information
- **Health** - Health check endpoints
- **API** - Main API endpoints

## 🔧 Configuration

Swagger is configured in `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Quick Commerce Backend API')
  .setDescription('RESTful API for Quick Commerce Platform')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
```

## 🎨 Customization

### Change Swagger Path

To change the Swagger UI path from `/api-docs` to something else:

```typescript
SwaggerModule.setup('your-custom-path', app, document);
```

### Disable Swagger in Production

```typescript
if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('api-docs', app, document);
}
```

## 📊 Export OpenAPI Spec

You can export the OpenAPI specification:

**JSON Format:**
```
http://localhost:3000/api-docs-json
```

**YAML Format:**
```
http://localhost:3000/api-docs-yaml
```

Use this spec to:
- Import into Postman
- Generate client SDKs
- Use with other API tools

## 🛠️ Troubleshooting

### Swagger UI Not Loading

1. Check if the application is running
2. Verify the port (default: 3000)
3. Check browser console for errors
4. Ensure Swagger dependencies are installed:
   ```bash
   npm install @nestjs/swagger swagger-ui-express
   ```

### Endpoints Not Showing

1. Ensure controllers have `@ApiTags()` decorator
2. Check that routes are properly configured
3. Verify global prefix settings

### Authentication Not Working

1. Ensure token format is correct: `Bearer <token>`
2. Check if token is expired
3. Verify JWT configuration

## 📚 Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

## 🎯 Best Practices

1. **Always document new endpoints** with Swagger decorators
2. **Use descriptive summaries** for each endpoint
3. **Include example responses** in documentation
4. **Tag endpoints properly** for better organization
5. **Use DTOs** for request/response validation

## 📝 Example: Adding Swagger to New Endpoint

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
}
```

---

**Happy Testing! 🚀**

