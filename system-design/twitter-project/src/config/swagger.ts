import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Twitter API',
            version: '1.0.0',
            description: 'A production-ready Twitter-like social media API',
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
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        display_name: { type: 'string' },
                        bio: { type: 'string' },
                        avatar_url: { type: 'string' },
                        verified: { type: 'boolean' },
                        follower_count: { type: 'integer' },
                        following_count: { type: 'integer' },
                        tweet_count: { type: 'integer' },
                    },
                },
                Tweet: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        content: { type: 'string' },
                        media_urls: { type: 'array', items: { type: 'string' } },
                        like_count: { type: 'integer' },
                        retweet_count: { type: 'integer' },
                        reply_count: { type: 'integer' },
                        created_at: { type: 'string', format: 'date-time' },
                        user: { $ref: '#/components/schemas/User' },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
