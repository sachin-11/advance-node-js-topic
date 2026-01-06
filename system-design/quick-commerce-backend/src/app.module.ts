import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootController } from './root.controller';
import { HealthModule } from './common/health/health.module';
import { LoggerService } from './common/logger/logger.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    // Database Module
    DatabaseModule,
    // Redis Module
    RedisModule,
    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    // Health Check Module
    HealthModule,
    // User Module
    UsersModule,
    // Auth Module
    AuthModule,
    // Products Module
    ProductsModule,
    // Categories Module
    CategoriesModule,
  ],
  controllers: [RootController, AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {}
