import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Pastebin Service API',
    version: '1.0.0',
    description: 'A production-ready pastebin service for sharing code and text snippets with syntax highlighting, password protection, and expiration features',
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
      name: 'Pastes',
      description: 'Paste creation and management endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
  components: {
    schemas: {
      CreatePasteRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: {
            type: 'string',
            example: 'print("Hello World")',
            description: 'The paste content (text or code)',
          },
          title: {
            type: 'string',
            example: 'My Python Code',
            description: 'Optional title for the paste',
          },
          language: {
            type: 'string',
            example: 'python',
            description: 'Programming language for syntax highlighting (e.g., python, javascript, java)',
          },
          privacy: {
            type: 'string',
            enum: ['public', 'private', 'unlisted'],
            default: 'public',
            example: 'public',
            description: 'Privacy setting: public (anyone can view), private (requires auth), unlisted (not in public listing)',
          },
          password: {
            type: 'string',
            example: 'mySecretPassword',
            description: 'Optional password to protect the paste',
          },
          expires_in: {
            type: 'integer',
            example: 3600,
            description: 'Expiration time in seconds (e.g., 3600 = 1 hour)',
          },
          max_views: {
            type: 'integer',
            example: 100,
            description: 'Maximum number of views before paste expires',
          },
          burn_after_reading: {
            type: 'boolean',
            default: false,
            example: false,
            description: 'If true, paste will be deleted after first view',
          },
        },
      },
      CreatePasteResponse: {
        type: 'object',
        properties: {
          paste_id: {
            type: 'string',
            example: 'abc123',
            description: 'Unique paste identifier',
          },
          url: {
            type: 'string',
            format: 'uri',
            example: 'http://localhost:3000/paste/abc123',
            description: 'URL to access the paste',
          },
          expires_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-12-08T12:00:00.000Z',
            description: 'Expiration timestamp (null if no expiration)',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2024-12-07T12:00:00.000Z',
            description: 'Creation timestamp',
          },
        },
      },
      Paste: {
        type: 'object',
        properties: {
          paste_id: {
            type: 'string',
            example: 'abc123',
            description: 'Unique paste identifier',
          },
          title: {
            type: 'string',
            nullable: true,
            example: 'My Python Code',
            description: 'Paste title',
          },
          content: {
            type: 'string',
            example: 'print("Hello World")',
            description: 'Paste content',
          },
          language: {
            type: 'string',
            example: 'python',
            description: 'Programming language',
          },
          privacy: {
            type: 'string',
            example: 'public',
            description: 'Privacy setting',
          },
          view_count: {
            type: 'integer',
            example: 42,
            description: 'Number of times paste has been viewed',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2024-12-07T12:00:00.000Z',
            description: 'Creation timestamp',
          },
          expires_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-12-08T12:00:00.000Z',
            description: 'Expiration timestamp',
          },
        },
      },
      PasteStats: {
        type: 'object',
        properties: {
          paste_id: {
            type: 'string',
            example: 'abc123',
            description: 'Unique paste identifier',
          },
          view_count: {
            type: 'integer',
            example: 42,
            description: 'Total number of views',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2024-12-07T12:00:00.000Z',
            description: 'Creation timestamp',
          },
          expires_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-12-08T12:00:00.000Z',
            description: 'Expiration timestamp',
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
          status: {
            type: 'string',
            example: 'error',
          },
          message: {
            type: 'string',
            example: 'Detailed error message',
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
          redis: {
            type: 'string',
            example: 'connected',
            description: 'Redis connection status',
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
      NotFound: {
        description: 'Paste not found or expired',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Paste not found or expired',
            },
          },
        },
      },
      Unauthorized: {
        description: 'Password required or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Password required',
            },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/controllers/*.ts', './src/app.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);

