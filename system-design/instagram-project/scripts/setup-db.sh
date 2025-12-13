#!/bin/bash

# Setup script for Instagram database
# This script creates the database and runs migrations

echo "🚀 Setting up Instagram database..."

# Database configuration
DB_NAME="instagram_db"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Check if PostgreSQL is running
echo "📋 Checking PostgreSQL connection..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "SELECT 1" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to PostgreSQL"
    echo "💡 Make sure PostgreSQL is running:"
    echo "   brew services start postgresql@15"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database if it doesn't exist
echo "📦 Creating database '$DB_NAME'..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' created successfully"
else
    echo "⚠️  Database might already exist or there was an error"
fi

# Run migrations
echo "📝 Running migrations..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f src/db/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
    echo ""
    echo "🎉 Database setup complete!"
    echo "💡 You can now start the server with: npm run dev"
else
    echo "❌ Migration failed"
    exit 1
fi

