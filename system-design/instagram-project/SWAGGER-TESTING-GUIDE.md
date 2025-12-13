# Swagger API Testing Guide

## Quick Start

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Open Swagger UI**:
   ```
   http://localhost:3000/api-docs
   ```

## Step-by-Step Testing Flow

### Step 1: Register a New User

1. Expand **POST /api/auth/register**
2. Click **"Try it out"**
3. Fill in the request body:
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123",
     "bio": "Test user"
   }
   ```
4. Click **"Execute"**
5. Copy the `token` from the response

### Step 2: Authorize in Swagger UI

1. Click the **"Authorize"** button at the top right
2. In the "bearerAuth" field, paste your JWT token
3. Click **"Authorize"**
4. Click **"Close"**

Now all protected endpoints will use this token automatically!

### Step 3: Create a Post (Photo Upload)

1. Expand **POST /api/posts**
2. Click **"Try it out"**
3. Fill in:
   - **image**: Click "Choose File" and select an image (JPEG, PNG, or WebP)
   - **caption**: "My first post!" (optional)
4. Click **"Execute"**
5. Note the `post_id` from the response

### Step 4: Get Your Feed

1. Expand **GET /api/feed**
2. Click **"Try it out"**
3. Optionally set:
   - **limit**: 20 (default)
   - **offset**: 0 (default)
4. Click **"Execute"**
5. You'll see posts from users you follow (empty if you haven't followed anyone yet)

### Step 5: Follow a User

1. First, register another user (or note another user's ID)
2. Expand **POST /api/users/{id}/follow**
3. Click **"Try it out"**
4. Enter the user ID you want to follow
5. Click **"Execute"**

### Step 6: Get User Profile

1. Expand **GET /api/users/{id}**
2. Click **"Try it out"**
3. Enter a user ID
4. Click **"Execute"**
5. Response includes `is_following` field

### Step 7: Get Algorithmic Feed

1. Expand **GET /api/feed/algorithmic**
2. Click **"Try it out"**
3. Click **"Execute"**
4. Posts are sorted by engagement score (likes × 2 + comments × 3 + recency)

## Testing Tips

### File Upload Testing

- **Supported formats**: JPEG, PNG, WebP
- **Max size**: 10MB
- **Rate limit**: 10 posts per hour per user

### Authentication

- Token expires in 7 days (configurable)
- If token expires, login again and update the authorization

### Rate Limits

- **API**: 100 requests/minute per IP
- **Uploads**: 10 posts/hour per user
- **Follows**: 100 follows/day per user

### Common Issues

1. **401 Unauthorized**: 
   - Make sure you've authorized with a valid token
   - Token might have expired - login again

2. **400 Bad Request**:
   - Check request body format
   - For file uploads, ensure file is valid image format

3. **404 Not Found**:
   - Check if the resource (user/post) exists
   - Verify the ID is correct

4. **429 Too Many Requests**:
   - You've hit a rate limit
   - Wait for the rate limit window to reset

## Example Test Flow

```bash
# 1. Register User 1
POST /api/auth/register
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123"
}
# Save token1

# 2. Register User 2
POST /api/auth/register
{
  "username": "bob",
  "email": "bob@example.com",
  "password": "password123"
}
# Save token2

# 3. Login as Alice (use token1)
# 4. Create post as Alice
POST /api/posts (with image file)

# 5. Login as Bob (use token2)
# 6. Follow Alice
POST /api/users/1/follow

# 7. Get feed as Bob
GET /api/feed
# Should see Alice's post!
```

## Swagger UI Features

- **Try it out**: Test any endpoint directly
- **Authorize**: Set JWT token for all requests
- **Schema**: View request/response schemas
- **Examples**: Pre-filled example values
- **Responses**: See all possible response codes

Happy Testing! 🚀

