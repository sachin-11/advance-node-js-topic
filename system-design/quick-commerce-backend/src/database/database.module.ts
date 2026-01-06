import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger/logger.service';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          extra: {
            max: dbConfig.poolMax,
            min: dbConfig.poolMin,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [LoggerService],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const dbConfig = this.configService.get('database');
    
    // Check if database is connected
    if (this.dataSource.isInitialized) {
      this.logger.log(
        `Database connected successfully - Host: ${dbConfig.host}, Port: ${dbConfig.port}, Database: ${dbConfig.database}`,
        'DatabaseModule',
      );
    } else {
      this.logger.warn(
        `Database connection pending - Host: ${dbConfig.host}, Port: ${dbConfig.port}, Database: ${dbConfig.database}`,
        'DatabaseModule',
      );
    }
  }
}

