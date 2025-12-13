-- Create URLs table for TinyURL service
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(255) UNIQUE NOT NULL,
    long_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_at TIMESTAMP,
    click_count INTEGER DEFAULT 0
);

-- Create index on short_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);

-- Create index on expire_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_expire_at ON urls(expire_at);

