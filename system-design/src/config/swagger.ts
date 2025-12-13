import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TinyURL Service API',
    version: '1.0.0',
    description: 'A production-ready URL shortening service with TypeScript, PostgreSQL, and Redis',
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
      name: 'URLs',
      description: 'URL shortening and management endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
  components: {
    schemas: {
      ShortenRequest: {
        type: 'object',
        required: ['longUrl'],
        properties: {
          longUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/very/long/url/path',
            description: 'The long URL to be shortened',
          },
          customAlias: {
            type: 'string',
            minLength: 3,
            maxLength: 20,
            pattern: '^[a-zA-Z0-9\\-_]+$',
            example: 'my-link',
            description: 'Optional custom alias (alphanumeric + -/_ only)',
          },
          expireAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-12-31T23:59:59Z',
            description: 'Optional expiration date in ISO 8601 format',
          },
        },
      },
      ShortenResponse: {
        type: 'object',
        properties: {
          shortUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://my.tiny/abc123',
            description: 'The generated short URL',
          },
        },
      },
      StatsResponse: {
        type: 'object',
        properties: {
          longUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/very/long/url/path',
            description: 'The original long URL',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
            description: 'Creation timestamp',
          },
          clickCount: {
            type: 'integer',
            example: 42,
            description: 'Total number of clicks',
          },
          expireAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-12-31T23:59:59.000Z',
            description: 'Expiration date (null if no expiration)',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Error message',
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'ok',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
        },
      },
    },
    responses: {
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'Too many requests',
                },
                message: {
                  type: 'string',
                  example: 'Rate limit exceeded. Maximum 100 requests per 60 seconds.',
                },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/controllers/*.ts', './src/server.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);

