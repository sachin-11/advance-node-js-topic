import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'WhatsApp Service API',
    version: '1.0.0',
    description: 'A production-ready WhatsApp-like messaging platform API',
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
      description: 'User profile endpoints',
    },
    {
      name: 'Chats',
      description: 'Chat management endpoints',
    },
    {
      name: 'Messages',
      description: 'Message endpoints',
    },
    {
      name: 'Groups',
      description: 'Group management endpoints',
    },
    {
      name: 'Contacts',
      description: 'Contact management endpoints',
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
        required: ['phone_number', 'password'],
        properties: {
          phone_number: {
            type: 'string',
            example: '+1234567890',
          },
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
          full_name: {
            type: 'string',
            example: 'John Doe',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['phone_number', 'password'],
        properties: {
          phone_number: {
            type: 'string',
            example: '+1234567890',
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
              phone_number: { type: 'string' },
              username: { type: 'string' },
              full_name: { type: 'string' },
            },
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 123 },
          chat_id: { type: 'integer', example: 1 },
          group_id: { type: 'integer', example: null },
          sender_id: { type: 'integer', example: 1 },
          content: { type: 'string', example: 'Hello!' },
          message_type: { type: 'string', example: 'text' },
          media_url: { type: 'string', format: 'uri' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Chat: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user1_id: { type: 'integer', example: 1 },
          user2_id: { type: 'integer', example: 2 },
          last_message_at: { type: 'string', format: 'date-time' },
          unread_count: { type: 'integer', example: 5 },
        },
      },
      Group: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Family Group' },
          description: { type: 'string', example: 'Family chat' },
          created_by: { type: 'integer', example: 1 },
          created_at: { type: 'string', format: 'date-time' },
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
