#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Netflix Streaming Platform - Setup Check\n');

// Check Node.js
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
  const version = parseInt(nodeVersion.split('.')[0].replace('v', ''));
  if (version < 18) {
    console.log('⚠️  Warning: Node.js 18+ recommended');
  }
} catch (error) {
  console.log('❌ Node.js: Not installed or not in PATH');
}

// Check npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
  console.log('❌ npm: Not installed or not in PATH');
}

// Check PostgreSQL
try {
  const pgVersion = execSync('psql --version', { encoding: 'utf8' }).trim();
  console.log(`✅ PostgreSQL: ${pgVersion}`);
} catch (error) {
  console.log('❌ PostgreSQL: Not installed or not in PATH');
  console.log('   💡 Install: https://www.postgresql.org/download/');
}

// Check Redis
try {
  const redisVersion = execSync('redis-cli --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Redis: ${redisVersion}`);
} catch (error) {
  console.log('❌ Redis: Not installed or not in PATH');
  console.log('   💡 Install: https://redis.io/download');
}

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file: Found');
} else {
  console.log('❌ .env file: Missing (copy from env.example)');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ Dependencies: Installed');
} else {
  console.log('❌ Dependencies: Not installed (run: npm install)');
}

// Check package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✅ Package.json: Found');
} else {
  console.log('❌ Package.json: Missing');
}

console.log('\n📋 Quick Setup Commands:');
console.log('1. npm install');
console.log('2. copy env.example .env  (then edit .env)');
console.log('3. npm run setup-db');
console.log('4. Start Redis server');
console.log('5. npm run dev');
console.log('\n🚀 Ready? Run the commands above!\n');