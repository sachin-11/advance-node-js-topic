-- Netflix Streaming Platform Database Schema
-- PostgreSQL 15+ compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===========================================
-- ENUM TYPES
-- ===========================================

-- User account status
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'inactive', 'pending_verification');

-- Content types
CREATE TYPE content_type AS ENUM ('movie', 'tv_show', 'episode', 'trailer', 'clip');

-- Video quality/resolution
CREATE TYPE video_quality AS ENUM ('240p', '360p', '480p', '720p', '1080p', '4k', '8k');

-- Streaming protocols
CREATE TYPE streaming_protocol AS ENUM ('hls', 'dash', 'mp4');

-- Rating types
CREATE TYPE rating_type AS ENUM ('thumbs_up', 'thumbs_down', 'star_rating');

-- Download status
CREATE TYPE download_status AS ENUM ('pending', 'downloading', 'completed', 'failed', 'expired');

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM ('basic', 'standard', 'premium', 'ultra');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');

-- ===========================================
-- CORE TABLES
-- ===========================================

-- Users table (Primary account holders)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    country VARCHAR(100),
    account_status account_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    subscription_plan subscription_plan DEFAULT 'basic',
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    max_profiles INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- User profiles (Multiple profiles per account)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(500),
    is_kids_profile BOOLEAN DEFAULT false,
    pin_code VARCHAR(6), -- For kids profiles or parental controls
    language VARCHAR(10) DEFAULT 'en',
    autoplay BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Content categories/genres
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content metadata (Movies, TV Shows)
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    description TEXT,
    content_type content_type NOT NULL,
    release_date DATE,
    duration_minutes INTEGER, -- For movies and episodes
    language VARCHAR(10) DEFAULT 'en',
    country_of_origin VARCHAR(100),
    imdb_rating DECIMAL(3,1),
    rotten_tomatoes_score INTEGER,
    poster_url VARCHAR(500),
    backdrop_url VARCHAR(500),
    trailer_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    age_rating VARCHAR(10) DEFAULT '13+', -- PG-13, R, TV-MA, etc.
    production_year INTEGER,
    director VARCHAR(255),
    cast TEXT[], -- Array of actor names
    genres TEXT[], -- Array of genre names
    tags TEXT[], -- Additional tags for search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TV Shows specific table
CREATE TABLE tv_shows (
    id UUID PRIMARY KEY REFERENCES content(id) ON DELETE CASCADE,
    total_seasons INTEGER DEFAULT 1,
    total_episodes INTEGER,
    network VARCHAR(100), -- Netflix, HBO, etc.
    status VARCHAR(50) DEFAULT 'ended', -- ongoing, ended, cancelled
    first_air_date DATE,
    last_air_date DATE,
    episode_runtime INTEGER, -- Average episode length in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Episodes table (for TV shows)
CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tv_show_id UUID NOT NULL REFERENCES tv_shows(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    air_date DATE,
    thumbnail_url VARCHAR(500),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tv_show_id, season_number, episode_number)
);

-- Content categories relationship (many-to-many)
CREATE TABLE content_categories (
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, category_id)
);

-- Video files and streaming manifests
CREATE TABLE video_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE, -- For episodes
    quality video_quality NOT NULL,
    protocol streaming_protocol DEFAULT 'hls',
    file_path VARCHAR(1000) NOT NULL, -- S3 path or local path
    file_size_bytes BIGINT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    bitrate_kbps INTEGER NOT NULL,
    resolution_width INTEGER,
    resolution_height INTEGER,
    manifest_url VARCHAR(1000), -- HLS m3u8 or DASH mpd URL
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id, episode_id, quality, protocol)
);

-- ===========================================
-- USER INTERACTION TABLES
-- ===========================================

-- Watch history (stored in Cassandra for time-series, but keeping PostgreSQL for relations)
CREATE TABLE watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    watch_duration_seconds INTEGER NOT NULL,
    total_duration_seconds INTEGER NOT NULL,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    device_type VARCHAR(50), -- mobile, desktop, tv, tablet
    device_id VARCHAR(255), -- Unique device identifier
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User ratings and reviews
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    rating_type rating_type NOT NULL,
    rating_value INTEGER, -- 1-5 for star ratings, 1 or 0 for thumbs
    review_text TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, content_id)
);

-- User lists/playlists (My List, Watch Later, etc.)
CREATE TABLE user_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false, -- My List is default
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, name)
);

-- User list items
CREATE TABLE user_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    position INTEGER, -- For ordering in lists
    UNIQUE(list_id, content_id)
);

-- ===========================================
-- DOWNLOAD MANAGEMENT
-- ===========================================

-- Download queue/requests
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    quality video_quality NOT NULL,
    status download_status DEFAULT 'pending',
    download_path VARCHAR(1000), -- Local storage path
    file_size_bytes BIGINT,
    expires_at TIMESTAMP WITH TIME ZONE, -- For license expiration
    device_id VARCHAR(255), -- Device where downloaded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, content_id, episode_id, quality)
);

-- ===========================================
-- RECOMMENDATION SYSTEM
-- ===========================================

-- Pre-computed recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    recommendation_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    recommendation_type VARCHAR(50) NOT NULL, -- collaborative, content-based, trending, etc.
    source_content_id UUID REFERENCES content(id), -- What led to this recommendation
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, content_id, recommendation_type)
);

-- Content similarity matrix (for content-based recommendations)
CREATE TABLE content_similarity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id_1 UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    content_id_2 UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,4) NOT NULL, -- Cosine similarity or other metric
    similarity_type VARCHAR(50) DEFAULT 'content_based', -- genre, cast, director, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id_1, content_id_2, similarity_type),
    CHECK (content_id_1 < content_id_2) -- Prevent duplicate pairs
);

-- ===========================================
-- ANALYTICS & MONITORING
-- ===========================================

-- User sessions (for analytics)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    device_info JSONB, -- Device details, OS, browser, etc.
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true
);

-- Content view analytics
CREATE TABLE content_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    view_start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    view_end_time TIMESTAMP WITH TIME ZONE,
    total_view_time_seconds INTEGER,
    completion_rate DECIMAL(5,2),
    quality_played video_quality,
    device_type VARCHAR(50),
    location_country VARCHAR(100),
    referrer VARCHAR(500) -- How they found this content
);

-- ===========================================
-- PAYMENT & SUBSCRIPTION
-- ===========================================

-- Payment transactions
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50), -- credit_card, paypal, etc.
    payment_status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255) UNIQUE, -- External payment processor ID
    subscription_plan subscription_plan,
    billing_period_start DATE,
    billing_period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Full-text search indexes
CREATE INDEX idx_content_title_trgm ON content USING gin (title gin_trgm_ops);
CREATE INDEX idx_content_description_trgm ON content USING gin (description gin_trgm_ops);
CREATE INDEX idx_content_cast_gin ON content USING gin (cast);
CREATE INDEX idx_content_genres_gin ON content USING gin (genres);
CREATE INDEX idx_content_tags_gin ON content USING gin (tags);

-- Watch history indexes
CREATE INDEX idx_watch_history_profile_watched ON watch_history (profile_id, watched_at DESC);
CREATE INDEX idx_watch_history_content ON watch_history (content_id, watched_at DESC);

-- Recommendations indexes
CREATE INDEX idx_recommendations_profile_score ON recommendations (profile_id, recommendation_score DESC);
CREATE INDEX idx_recommendations_expires ON recommendations (expires_at);

-- Content similarity indexes
CREATE INDEX idx_content_similarity_score ON content_similarity (similarity_score DESC);

-- Content views indexes for analytics
CREATE INDEX idx_content_views_content_date ON content_views (content_id, view_start_time DESC);
CREATE INDEX idx_content_views_profile_date ON content_views (profile_id, view_start_time DESC);

-- User sessions indexes
CREATE INDEX idx_user_sessions_profile_active ON user_sessions (profile_id, is_active) WHERE is_active = true;

-- Downloads indexes
CREATE INDEX idx_downloads_profile_status ON downloads (profile_id, status);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tv_shows_updated_at BEFORE UPDATE ON tv_shows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_files_updated_at BEFORE UPDATE ON video_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_watch_history_updated_at BEFORE UPDATE ON watch_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON user_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_downloads_updated_at BEFORE UPDATE ON downloads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_similarity_updated_at BEFORE UPDATE ON content_similarity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- DEFAULT DATA
-- ===========================================

-- Insert default categories
INSERT INTO categories (name, description, display_order) VALUES
('Action', 'High-energy films with intense action sequences', 1),
('Comedy', 'Humorous films designed to entertain and amuse', 2),
('Drama', 'Serious films focusing on emotional and social themes', 3),
('Horror', 'Films designed to frighten and thrill', 4),
('Romance', 'Films centered around love and relationships', 5),
('Sci-Fi', 'Science fiction films exploring futuristic concepts', 6),
('Thriller', 'Suspenseful films keeping viewers on edge', 7),
('Documentary', 'Non-fiction films presenting real events', 8),
('Animation', 'Animated films using various techniques', 9),
('Crime', 'Films involving criminal activities and law enforcement', 10);

-- Create default "My List" for all new profiles
-- This will be handled by application logic when profiles are created