import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import { runSeeds } from './seeds';
import * as entities from '../entities';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

async function bootstrap() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'quickcommerce',
    entities: Object.values(entities).filter(
      (entity) => typeof entity === 'function',
    ) as any[],
    synchronize: true, // Auto-create tables for seeding
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    await runSeeds(dataSource);

    await dataSource.destroy();
    console.log('\n✅ Seeding process completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

bootstrap();

