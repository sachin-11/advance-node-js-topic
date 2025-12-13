import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Instagram Service API',
    version: '1.0.0',
    description: 'A production-ready Instagram-like social media platform API',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: process.env.BASE_URL || 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User profile and follow/unfollow endpoints',
    },
    {
      name: 'Posts',
      description: 'Post creation and management endpoints',
    },
    {
      name: 'Feed',
      description: 'Feed generation endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: {
            type: 'string',
            example: 'johndoe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'password123',
          },
          bio: {
            type: 'string',
            example: 'Photography enthusiast',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            example: 'password123',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              username: { type: 'string' },
              email: { type: 'string' },
            },
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 123 },
          user_id: { type: 'integer', example: 1 },
          caption: { type: 'string', example: 'My first post!' },
          image_url: { type: 'string', format: 'uri', example: 'https://cdn.instagram.com/posts/1/123_original.jpg' },
          thumbnail_url: { type: 'string', format: 'uri', example: 'https://cdn.instagram.com/posts/1/123_thumbnail.jpg' },
          medium_url: { type: 'string', format: 'uri', example: 'https://cdn.instagram.com/posts/1/123_medium.jpg' },
          like_count: { type: 'integer', example: 42 },
          comment_count: { type: 'integer', example: 5 },
          created_at: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00.000Z' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              username: { type: 'string' },
              avatar_url: { type: 'string', format: 'uri' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'johndoe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          bio: { type: 'string', example: 'Photography enthusiast' },
          avatar_url: { type: 'string', format: 'uri' },
          follower_count: { type: 'integer', example: 150 },
          following_count: { type: 'integer', example: 200 },
          post_count: { type: 'integer', example: 50 },
          is_following: { type: 'boolean', example: false },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time' },
          redis: { type: 'string', example: 'connected' },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/controllers/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

