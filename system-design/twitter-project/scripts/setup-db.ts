#!/usr/bin/env ts-node

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
    const pool = new Pool({
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT || '5432'),
        database: process.env.PG_DATABASE || 'twitter',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres',
    });

    try {
        console.log('🔄 Setting up database...');

        // Read schema file
        const schemaPath = path.join(__dirname, '../src/db/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await pool.query(schema);

        console.log('✅ Database setup completed successfully!');
        console.log('📊 Tables created:');
        console.log('   - users');
        console.log('   - tweets');
        console.log('   - follows');
        console.log('   - likes');
        console.log('   - retweets');
        console.log('   - hashtags');
        console.log('   - tweet_hashtags');
        console.log('   - notifications');
        console.log('   - direct_messages');

    } catch (error: any) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

setupDatabase();
