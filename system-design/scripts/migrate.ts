import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../src/db/pg';

/**
 * Simple migration script to run SQL files
 */
async function runMigration() {
  try {
    const migrationPath = join(__dirname, '../migrations/001_create_urls_table.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await query(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log('⚠ Skipped (already exists):', statement.substring(0, 50) + '...');
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

