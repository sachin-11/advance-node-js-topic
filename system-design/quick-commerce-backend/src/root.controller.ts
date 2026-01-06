import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class RootController {
  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Quick Commerce Backend API' },
        version: { type: 'string', example: '1.0.0' },
        status: { type: 'string', example: 'running' },
        endpoints: {
          type: 'object',
          properties: {
            api: { type: 'string', example: '/api' },
            health: { type: 'string', example: '/health' },
            docs: { type: 'string', example: '/docs' },
          },
        },
      },
    },
  })
  getRoot() {
    return {
      message: 'Quick Commerce Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        api: '/api',
        health: '/health',
        docs: '/docs',
      },
      documentation: 'Swagger API Documentation available at /docs',
    };
  }
}

