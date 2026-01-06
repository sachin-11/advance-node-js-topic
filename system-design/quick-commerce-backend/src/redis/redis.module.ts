import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger/logger.service';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LoggerService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService, logger: LoggerService) => {
        const redisConfig = configService.get('redis');
        const enableRedis = process.env.REDIS_ENABLED !== 'false'; // Default: enabled
        
        if (!enableRedis) {
          logger.warn(
            'Redis is disabled via REDIS_ENABLED=false',
            'RedisModule',
          );
          return null;
        }

        const client = new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
          // Enable offline queue - commands will be queued if Redis is not available
          enableOfflineQueue: true,
          // Lazy connect - don't connect immediately
          lazyConnect: true,
          retryStrategy: (times) => {
            // Stop retrying after 10 attempts (about 20 seconds)
            if (times > 10) {
              logger.warn(
                `Redis connection failed after ${times} attempts. Redis features will be unavailable.`,
                'RedisModule',
              );
              return null; // Stop retrying
            }
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: null, // Retry indefinitely for queued commands
          // Connection timeout
          connectTimeout: 5000,
        });

        let isConnected = false;
        let connectionAttempted = false;

        // Attempt initial connection
        client.connect().catch((error) => {
          if (!connectionAttempted) {
            connectionAttempted = true;
            logger.warn(
              `Redis connection failed: ${error.message}. Application will continue without Redis. To disable Redis warnings, set REDIS_ENABLED=false`,
              'RedisModule',
            );
          }
        });

        client.on('connect', () => {
          isConnected = true;
          logger.log(
            `Redis connected successfully to ${redisConfig.host}:${redisConfig.port}`,
            'RedisModule',
          );
        });

        client.on('ready', () => {
          isConnected = true;
          logger.log('Redis is ready to accept commands', 'RedisModule');
        });

        client.on('error', (error) => {
          // Only log error if we haven't logged connection failure yet
          if (isConnected || !connectionAttempted) {
            logger.error(
              `Redis connection error: ${error.message}`,
              error.stack,
              'RedisModule',
            );
            isConnected = false;
          }
        });

        client.on('close', () => {
          if (isConnected) {
            logger.warn('Redis connection closed', 'RedisModule');
            isConnected = false;
          }
        });

        client.on('reconnecting', (delay: number) => {
          logger.warn(`Redis reconnecting in ${delay}ms...`, 'RedisModule');
        });

        client.on('end', () => {
          logger.warn('Redis connection ended', 'RedisModule');
          isConnected = false;
        });

        return client;
      },
      inject: [ConfigService, LoggerService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    const redisConfig = this.configService.get('redis');
    const enableRedis = process.env.REDIS_ENABLED !== 'false';
    
    if (!enableRedis) {
      this.logger.log('Redis module initialized (disabled)', 'RedisModule');
      return;
    }

    this.logger.log(
      `Redis module initialized - Host: ${redisConfig.host}, Port: ${redisConfig.port}`,
      'RedisModule',
    );
  }

  async onModuleDestroy() {
    this.logger.log('Redis module destroyed', 'RedisModule');
  }
}

