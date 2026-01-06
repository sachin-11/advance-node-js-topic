import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller({ path: 'health', version: [] })
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the health status of the application including memory and disk usage',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            memory_heap: { type: 'object' },
            memory_rss: { type: 'object' },
            storage: { type: 'object' },
          },
        },
        error: { type: 'object' },
        details: {
          type: 'object',
          properties: {
            memory_heap: { type: 'object' },
            memory_rss: { type: 'object' },
            storage: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Application is unhealthy',
  })
  check() {
    // Get OS-specific root path
    const rootPath = process.platform === 'win32' 
      ? process.cwd().split('\\')[0] + '\\' // Windows: Use current drive (e.g., C:\)
      : '/'; // Unix/Linux/Mac: Use root path
    
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', { 
          path: rootPath, 
          thresholdPercent: 0.9 
        }),
    ]);
  }
}

