-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_is_active ON users(is_active);

-- Pastes table
CREATE TABLE IF NOT EXISTS pastes (
    id SERIAL PRIMARY KEY,
    paste_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255),
    
    -- Content Storage Strategy
    content TEXT,  -- For small pastes (< 64KB)
    content_location VARCHAR(10) DEFAULT 'db',  -- 'db' or 's3'
    content_url TEXT,  -- S3 URL if stored in object storage
    content_size BIGINT NOT NULL DEFAULT 0,  -- Size in bytes
    
    -- Metadata
    language VARCHAR(50) DEFAULT 'text',
    syntax_mode VARCHAR(50),  -- For syntax highlighting
    
    -- User Association
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Privacy & Access Control
    privacy VARCHAR(20) DEFAULT 'public',  -- 'public', 'private', 'unlisted'
    password_hash VARCHAR(255),  -- bcrypt hash if password protected
    burn_after_reading BOOLEAN DEFAULT FALSE,
    viewed_once BOOLEAN DEFAULT FALSE,  -- For burn after reading
    
    -- Expiration
    expires_at TIMESTAMP,
    max_views INTEGER,  -- View-based expiration (NULL = unlimited)
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,  -- Soft delete
    
    -- Constraints
    CONSTRAINT chk_privacy CHECK (privacy IN ('public', 'private', 'unlisted')),
    CONSTRAINT chk_content_location CHECK (content_location IN ('db', 's3'))
);

-- Indexes for pastes table
CREATE INDEX IF NOT EXISTS idx_paste_id ON pastes(paste_id);
CREATE INDEX IF NOT EXISTS idx_user_id ON pastes(user_id);
CREATE INDEX IF NOT EXISTS idx_expires_at ON pastes(expires_at);
CREATE INDEX IF NOT EXISTS idx_privacy ON pastes(privacy);
CREATE INDEX IF NOT EXISTS idx_created_at ON pastes(created_at);
CREATE INDEX IF NOT EXISTS idx_deleted_at ON pastes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_language ON pastes(language);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    paste_id VARCHAR(20) REFERENCES pastes(paste_id) ON DELETE CASCADE,
    
    -- File Information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,  -- S3 URL
    file_size BIGINT NOT NULL,  -- Size in bytes
    file_type VARCHAR(100),  -- 'image', 'document', 'code', etc.
    mime_type VARCHAR(100),  -- 'image/png', 'application/pdf', etc.
    
    -- File Metadata
    width INTEGER,  -- For images
    height INTEGER,  -- For images
    description TEXT,
    
    -- Storage Info
    storage_location VARCHAR(10) DEFAULT 's3',
    storage_tier VARCHAR(20) DEFAULT 'standard',  -- 'standard', 'glacier', 'archive'
    
    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for files table
CREATE INDEX IF NOT EXISTS idx_files_paste_id ON files(paste_id);
CREATE INDEX IF NOT EXISTS idx_file_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_uploaded_at ON files(uploaded_at);

-- Analytics table (Aggregated Stats)
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    paste_id VARCHAR(20) REFERENCES pastes(paste_id) ON DELETE CASCADE,
    
    -- View Statistics
    view_count INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP,
    
    -- Geographic Data (JSON)
    countries JSONB,  -- {"US": 100, "IN": 50, ...}
    cities JSONB,     -- {"New York": 50, "Mumbai": 30, ...}
    
    -- Referrer Data (JSON)
    referrers JSONB,  -- {"google.com": 200, "github.com": 100, ...}
    
    -- Device Data (JSON)
    devices JSONB,    -- {"desktop": 500, "mobile": 300, ...}
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytics table
CREATE INDEX IF NOT EXISTS idx_analytics_paste_id ON analytics(paste_id);
CREATE INDEX IF NOT EXISTS idx_last_viewed_at ON analytics(last_viewed_at);
CREATE INDEX IF NOT EXISTS idx_view_count ON analytics(view_count DESC);  -- For popular pastes

-- View logs table (Detailed Logs)
CREATE TABLE IF NOT EXISTS view_logs (
    id SERIAL PRIMARY KEY,
    paste_id VARCHAR(20) NOT NULL,
    
    -- Request Information
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Geographic Data
    country VARCHAR(2),  -- ISO country code
    city VARCHAR(100),
    region VARCHAR(100),
    
    -- Device Information
    device_type VARCHAR(20),  -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- User Information
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_unique BOOLEAN DEFAULT TRUE,
    
    -- Timestamp
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for view_logs table
CREATE INDEX IF NOT EXISTS idx_view_logs_paste_id ON view_logs(paste_id);
CREATE INDEX IF NOT EXISTS idx_viewed_at ON view_logs(viewed_at);
CREATE INDEX IF NOT EXISTS idx_view_logs_user_id ON view_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_country ON view_logs(country);
