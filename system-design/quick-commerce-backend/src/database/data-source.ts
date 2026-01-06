import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as entities from '../entities';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'quickcommerce',
  entities: Object.values(entities).filter(
    (entity) => typeof entity === 'function',
  ) as any[],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Always false in production, use migrations
  logging: process.env.NODE_ENV === 'development',
});

