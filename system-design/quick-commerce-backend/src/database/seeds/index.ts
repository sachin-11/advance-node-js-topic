import { DataSource } from 'typeorm';
import { seedUsers } from './users.seed';
import { seedCategories } from './categories.seed';
import { seedProducts } from './products.seed';
import { seedWarehouses } from './warehouses.seed';

export async function runSeeds(dataSource: DataSource): Promise<void> {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed categories first (products depend on categories)
    console.log('📦 Seeding categories...');
    const categories = await seedCategories(dataSource);
    console.log('');

    // Seed warehouses
    console.log('🏭 Seeding warehouses...');
    await seedWarehouses(dataSource);
    console.log('');

    // Seed products (depends on categories)
    console.log('🛍️ Seeding products...');
    await seedProducts(dataSource, categories);
    console.log('');

    // Seed users
    console.log('👥 Seeding users...');
    await seedUsers(dataSource);
    console.log('');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

