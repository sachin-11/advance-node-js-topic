import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Netflix Streaming Platform API',
      version: '1.0.0',
      description: 'A comprehensive video streaming platform API similar to Netflix. Complete API documentation for all endpoints.',
      contact: {
        name: 'API Support',
        email: 'support@netflix-platform.com'
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://api.netflix-platform.com'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login'
        },
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone: { type: 'string' },
            country: { type: 'string' },
            account_status: {
              type: 'string',
              enum: ['active', 'suspended', 'inactive', 'pending_verification']
            },
            subscription_plan: {
              type: 'string',
              enum: ['basic', 'standard', 'premium', 'ultra']
            },
            email_verified: { type: 'boolean' },
            max_profiles: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            avatar_url: { type: 'string' },
            is_kids_profile: { type: 'boolean' },
            language: { type: 'string' },
            autoplay: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateProfileRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 50 },
            avatar_url: { type: 'string' },
            is_kids_profile: { type: 'boolean', default: false },
            pin_code: { type: 'string', minLength: 4, maxLength: 6 },
            language: { type: 'string', default: 'en' },
            autoplay: { type: 'boolean', default: true },
          },
        },
        // Content Schemas
        Content: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            original_title: { type: 'string' },
            description: { type: 'string' },
            content_type: {
              type: 'string',
              enum: ['movie', 'tv_show', 'episode', 'trailer', 'clip']
            },
            release_date: { type: 'string', format: 'date' },
            duration_minutes: { type: 'integer' },
            language: { type: 'string' },
            country_of_origin: { type: 'string' },
            imdb_rating: { type: 'number', format: 'float' },
            rotten_tomatoes_score: { type: 'integer' },
            poster_url: { type: 'string' },
            backdrop_url: { type: 'string' },
            trailer_url: { type: 'string' },
            age_rating: { type: 'string' },
            production_year: { type: 'integer' },
            director: { type: 'string' },
            cast: { type: 'array', items: { type: 'string' } },
            genres: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            avg_rating: { type: 'number' },
            rating_count: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            image_url: { type: 'string' },
            display_order: { type: 'integer' },
            is_active: { type: 'boolean' },
          },
        },
        TVShow: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            total_seasons: { type: 'integer' },
            total_episodes: { type: 'integer' },
            network: { type: 'string' },
            status: { type: 'string', enum: ['ongoing', 'ended', 'cancelled'] },
            first_air_date: { type: 'string', format: 'date' },
            last_air_date: { type: 'string', format: 'date' },
            episode_runtime: { type: 'integer' },
          },
        },
        Episode: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tv_show_id: { type: 'string', format: 'uuid' },
            season_number: { type: 'integer' },
            episode_number: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            duration_minutes: { type: 'integer' },
            air_date: { type: 'string', format: 'date' },
            thumbnail_url: { type: 'string' },
          },
        },
        VideoFile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            content_id: { type: 'string', format: 'uuid' },
            episode_id: { type: 'string', format: 'uuid' },
            quality: {
              type: 'string',
              enum: ['240p', '360p', '480p', '720p', '1080p', '4k', '8k']
            },
            protocol: {
              type: 'string',
              enum: ['hls', 'dash', 'mp4']
            },
            manifest_url: { type: 'string' },
            file_path: { type: 'string' },
            duration_seconds: { type: 'integer' },
            bitrate_kbps: { type: 'integer' },
            resolution_width: { type: 'integer' },
            resolution_height: { type: 'integer' },
          },
        },
        // Watch History Schemas
        WatchHistory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            profile_id: { type: 'string', format: 'uuid' },
            content_id: { type: 'string', format: 'uuid' },
            episode_id: { type: 'string', format: 'uuid' },
            watched_at: { type: 'string', format: 'date-time' },
            watch_duration_seconds: { type: 'integer' },
            total_duration_seconds: { type: 'integer' },
            completion_percentage: { type: 'number' },
            device_type: { type: 'string' },
            device_id: { type: 'string' },
          },
        },
        UpdateWatchHistoryRequest: {
          type: 'object',
          required: ['content_id', 'watch_duration_seconds', 'total_duration_seconds'],
          properties: {
            content_id: { type: 'string', format: 'uuid' },
            episode_id: { type: 'string', format: 'uuid' },
            watch_duration_seconds: { type: 'integer', minimum: 0 },
            total_duration_seconds: { type: 'integer', minimum: 1 },
            device_type: { type: 'string' },
            device_id: { type: 'string' },
          },
        },
        // Rating Schemas
        Rating: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            profile_id: { type: 'string', format: 'uuid' },
            content_id: { type: 'string', format: 'uuid' },
            rating_type: {
              type: 'string',
              enum: ['thumbs_up', 'thumbs_down', 'star_rating']
            },
            rating_value: { type: 'integer' },
            review_text: { type: 'string' },
            is_public: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateRatingRequest: {
          type: 'object',
          required: ['rating_type'],
          properties: {
            rating_type: {
              type: 'string',
              enum: ['thumbs_up', 'thumbs_down', 'star_rating']
            },
            rating_value: { type: 'integer', minimum: 1, maximum: 5 },
            review_text: { type: 'string' },
            is_public: { type: 'boolean', default: false },
          },
        },
        // Auth Schemas
        AuthRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            country: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            profile: { $ref: '#/components/schemas/Profile' },
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
            expires_in: { type: 'integer' },
          },
        },
        // Streaming Schemas
        StreamingManifest: {
          type: 'object',
          properties: {
            manifest_url: { type: 'string' },
            content_info: { $ref: '#/components/schemas/Content' },
            video_file: { $ref: '#/components/schemas/VideoFile' },
            available_qualities: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['240p', '360p', '480p', '720p', '1080p', '4k', '8k']
              }
            },
          },
        },
        // Search Schemas
        SearchResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Content' }
            },
            query: { type: 'string' },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'integer' },
                offset: { type: 'integer' },
              },
            },
          },
        },
        // Pagination Schemas
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                limit: { type: 'integer' },
                offset: { type: 'integer' },
                hasMore: { type: 'boolean' },
              },
            },
          },
        },
        // Error Schemas
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
            statusCode: { type: 'integer' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            statusCode: { type: 'integer' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API routes and controllers
};

export const swaggerSpec = swaggerJSDoc(options);