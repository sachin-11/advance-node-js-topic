-- Google Search Engine Database Schema
-- PostgreSQL Database Design for Search Engine

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For GIN indexes

-- ═══════════════════════════════════════════════════════════════
-- CRAWLER & INDEXING TABLES
-- ═══════════════════════════════════════════════════════════════

-- Web Pages Table
CREATE TABLE IF NOT EXISTS web_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url VARCHAR(2048) NOT NULL UNIQUE,
    domain VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    meta_description TEXT,
    content_hash VARCHAR(64), -- SHA-256 hash of content
    content_length INTEGER,
    content_type VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    status_code INTEGER DEFAULT 200,
    last_crawled_at TIMESTAMP,
    last_modified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_indexed BOOLEAN DEFAULT false,
    page_rank DECIMAL(10, 8) DEFAULT 0.0,
    crawl_priority INTEGER DEFAULT 5, -- 1-10, 1 = highest priority
    robots_allowed BOOLEAN DEFAULT true,
    CONSTRAINT valid_url CHECK (url ~* '^https?://'),
    CONSTRAINT valid_status CHECK (status_code BETWEEN 100 AND 599)
);

-- Indexes for web_pages
CREATE INDEX IF NOT EXISTS idx_web_pages_domain ON web_pages(domain);
CREATE INDEX IF NOT EXISTS idx_web_pages_last_crawled ON web_pages(last_crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_pages_crawl_priority ON web_pages(crawl_priority ASC, last_crawled_at ASC);
CREATE INDEX IF NOT EXISTS idx_web_pages_is_indexed ON web_pages(is_indexed) WHERE is_indexed = false;
CREATE INDEX IF NOT EXISTS idx_web_pages_page_rank ON web_pages(page_rank DESC);
CREATE INDEX IF NOT EXISTS idx_web_pages_url_hash ON web_pages USING hash(url);

-- Crawl Queue Table
CREATE TABLE IF NOT EXISTS crawl_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url VARCHAR(2048) NOT NULL UNIQUE,
    priority INTEGER DEFAULT 5,
    depth INTEGER DEFAULT 0,
    parent_url VARCHAR(2048),
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    crawled_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CRAWLING, COMPLETED, FAILED
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('PENDING', 'CRAWLING', 'COMPLETED', 'FAILED', 'SKIPPED'))
);

CREATE INDEX IF NOT EXISTS idx_crawl_queue_status ON crawl_queue(status, priority DESC, scheduled_at ASC);
CREATE INDEX IF NOT EXISTS idx_crawl_queue_scheduled ON crawl_queue(scheduled_at) WHERE status = 'PENDING';

-- Robots.txt Cache
CREATE TABLE IF NOT EXISTS robots_txt (
    domain VARCHAR(255) PRIMARY KEY,
    content TEXT,
    last_fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXING & SEARCH TABLES
-- ═══════════════════════════════════════════════════════════════

-- Inverted Index Table (Word to Document mapping)
CREATE TABLE IF NOT EXISTS inverted_index (
    id BIGSERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    page_id UUID NOT NULL REFERENCES web_pages(id) ON DELETE CASCADE,
    term_frequency INTEGER DEFAULT 1, -- TF: How many times word appears in document
    positions INTEGER[], -- Positions where word appears in document
    field_type VARCHAR(20) DEFAULT 'body', -- title, body, meta, url, anchor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(word, page_id, field_type)
);

-- Indexes for inverted_index
CREATE INDEX IF NOT EXISTS idx_inverted_index_word ON inverted_index(word);
CREATE INDEX IF NOT EXISTS idx_inverted_index_page_id ON inverted_index(page_id);
CREATE INDEX IF NOT EXISTS idx_inverted_index_word_page ON inverted_index(word, page_id);
CREATE INDEX IF NOT EXISTS idx_inverted_index_field ON inverted_index(field_type);
CREATE INDEX IF NOT EXISTS idx_inverted_index_tf ON inverted_index(term_frequency DESC);

-- Document Frequency Table (DF: How many documents contain the word)
CREATE TABLE IF NOT EXISTS document_frequency (
    word VARCHAR(255) PRIMARY KEY,
    document_count BIGINT DEFAULT 1,
    total_frequency BIGINT DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_frequency_count ON document_frequency(document_count DESC);

-- Bigrams Table (for phrase search)
CREATE TABLE IF NOT EXISTS bigrams (
    id BIGSERIAL PRIMARY KEY,
    word1 VARCHAR(255) NOT NULL,
    word2 VARCHAR(255) NOT NULL,
    page_id UUID NOT NULL REFERENCES web_pages(id) ON DELETE CASCADE,
    frequency INTEGER DEFAULT 1,
    positions INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(word1, word2, page_id)
);

CREATE INDEX IF NOT EXISTS idx_bigrams_words ON bigrams(word1, word2);
CREATE INDEX IF NOT EXISTS idx_bigrams_page_id ON bigrams(page_id);

-- ═══════════════════════════════════════════════════════════════
-- LINK ANALYSIS TABLES
-- ═══════════════════════════════════════════════════════════════

-- Links Table (Page to Page links)
CREATE TABLE IF NOT EXISTS links (
    id BIGSERIAL PRIMARY KEY,
    from_page_id UUID NOT NULL REFERENCES web_pages(id) ON DELETE CASCADE,
    to_page_id UUID NOT NULL REFERENCES web_pages(id) ON DELETE CASCADE,
    anchor_text TEXT,
    link_type VARCHAR(20) DEFAULT 'internal', -- internal, external
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_page_id, to_page_id)
);

CREATE INDEX IF NOT EXISTS idx_links_from ON links(from_page_id);
CREATE INDEX IF NOT EXISTS idx_links_to ON links(to_page_id);
CREATE INDEX IF NOT EXISTS idx_links_type ON links(link_type);

-- PageRank Table
CREATE TABLE IF NOT EXISTS page_rank (
    page_id UUID PRIMARY KEY REFERENCES web_pages(id) ON DELETE CASCADE,
    rank_value DECIMAL(10, 8) DEFAULT 0.0,
    iteration INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_rank_value ON page_rank(rank_value DESC);

-- ═══════════════════════════════════════════════════════════════
-- SEARCH & QUERY TABLES
-- ═══════════════════════════════════════════════════════════════

-- Search Queries Table (for analytics and autocomplete)
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text VARCHAR(500) NOT NULL,
    normalized_query VARCHAR(500), -- Lowercase, trimmed
    result_count INTEGER DEFAULT 0,
    clicked_result_id UUID REFERENCES web_pages(id),
    user_ip VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_queries_text ON search_queries(normalized_query);
CREATE INDEX IF NOT EXISTS idx_search_queries_created ON search_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_session ON search_queries(session_id);

-- Query Suggestions (Autocomplete)
CREATE TABLE IF NOT EXISTS query_suggestions (
    id BIGSERIAL PRIMARY KEY,
    query_prefix VARCHAR(255) NOT NULL,
    suggestion VARCHAR(500) NOT NULL,
    frequency INTEGER DEFAULT 1,
    last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(query_prefix, suggestion)
);

CREATE INDEX IF NOT EXISTS idx_query_suggestions_prefix ON query_suggestions(query_prefix);
CREATE INDEX IF NOT EXISTS idx_query_suggestions_frequency ON query_suggestions(frequency DESC);

-- Search Results Cache
CREATE TABLE IF NOT EXISTS search_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash of normalized query
    query_text VARCHAR(500) NOT NULL,
    results JSONB NOT NULL, -- Cached search results
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour')
);

CREATE INDEX IF NOT EXISTS idx_search_cache_hash ON search_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_cache(expires_at) WHERE expires_at > CURRENT_TIMESTAMP;

-- ═══════════════════════════════════════════════════════════════
-- CONTENT ANALYSIS TABLES
-- ═══════════════════════════════════════════════════════════════

-- Keywords Table (Important keywords per page)
CREATE TABLE IF NOT EXISTS keywords (
    id BIGSERIAL PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES web_pages(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    score DECIMAL(10, 8) DEFAULT 0.0, -- TF-IDF score
    position INTEGER, -- Position in document
    field_type VARCHAR(20), -- title, h1, h2, body, meta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page_id, keyword, field_type)
);

CREATE INDEX IF NOT EXISTS idx_keywords_page_id ON keywords(page_id);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_score ON keywords(score DESC);

-- Entities Table (Named Entity Recognition)
CREATE TABLE IF NOT EXISTS entities (
    id BIGSERIAL PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES web_pages(id) ON DELETE CASCADE,
    entity_text VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50), -- PERSON, ORGANIZATION, LOCATION, etc.
    confidence DECIMAL(5, 4) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entities_page_id ON entities(page_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_text ON entities(entity_text);

-- ═══════════════════════════════════════════════════════════════
-- ANALYTICS & METRICS TABLES
-- ═══════════════════════════════════════════════════════════════

-- Click Analytics
CREATE TABLE IF NOT EXISTS click_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID REFERENCES search_queries(id),
    page_id UUID NOT NULL REFERENCES web_pages(id) ON DELETE CASCADE,
    position INTEGER NOT NULL, -- Position in search results
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_ip VARCHAR(45),
    session_id VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_click_analytics_page_id ON click_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_click_analytics_query_id ON click_analytics(query_id);
CREATE INDEX IF NOT EXISTS idx_click_analytics_clicked_at ON click_analytics(clicked_at DESC);

-- Domain Statistics
CREATE TABLE IF NOT EXISTS domain_stats (
    domain VARCHAR(255) PRIMARY KEY,
    total_pages INTEGER DEFAULT 0,
    indexed_pages INTEGER DEFAULT 0,
    total_links INTEGER DEFAULT 0,
    average_page_rank DECIMAL(10, 8) DEFAULT 0.0,
    last_crawled_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_web_pages_updated_at BEFORE UPDATE ON web_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_stats_updated_at BEFORE UPDATE ON domain_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update document frequency
CREATE OR REPLACE FUNCTION update_document_frequency()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO document_frequency (word, document_count, total_frequency)
    VALUES (NEW.word, 1, NEW.term_frequency)
    ON CONFLICT (word) DO UPDATE SET
        document_count = document_frequency.document_count + 1,
        total_frequency = document_frequency.total_frequency + NEW.term_frequency,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_df_on_insert AFTER INSERT ON inverted_index
    FOR EACH ROW EXECUTE FUNCTION update_document_frequency();

-- Function to calculate TF-IDF score
CREATE OR REPLACE FUNCTION calculate_tfidf(tf INTEGER, df BIGINT, total_docs BIGINT)
RETURNS DECIMAL AS $$
BEGIN
    IF df = 0 OR total_docs = 0 THEN
        RETURN 0;
    END IF;
    RETURN LOG(1.0 + tf::DECIMAL) * LOG(total_docs::DECIMAL / df::DECIMAL);
END;
$$ language 'plpgsql';

-- ═══════════════════════════════════════════════════════════════
-- VIEWS FOR COMMON QUERIES
-- ═══════════════════════════════════════════════════════════════

-- View: Pages ready for crawling
CREATE OR REPLACE VIEW pages_to_crawl AS
SELECT 
    cq.id,
    cq.url,
    cq.priority,
    cq.depth,
    cq.scheduled_at
FROM crawl_queue cq
WHERE cq.status = 'PENDING'
ORDER BY cq.priority ASC, cq.scheduled_at ASC;

-- View: Top pages by PageRank
CREATE OR REPLACE VIEW top_pages_by_rank AS
SELECT 
    wp.id,
    wp.url,
    wp.title,
    wp.domain,
    pr.rank_value,
    wp.page_rank
FROM web_pages wp
JOIN page_rank pr ON wp.id = pr.page_id
ORDER BY pr.rank_value DESC
LIMIT 1000;

-- View: Search statistics
CREATE OR REPLACE VIEW search_statistics AS
SELECT 
    DATE(created_at) as search_date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(result_count) as avg_results,
    COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END) as clicks
FROM search_queries
GROUP BY DATE(created_at)
ORDER BY search_date DESC;

-- ═══════════════════════════════════════════════════════════════
-- PARTITIONING (for large tables)
-- ═══════════════════════════════════════════════════════════════

-- Partition search_queries by date (monthly partitions)
-- CREATE TABLE search_queries_2024_01 PARTITION OF search_queries
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE web_pages IS 'Stores crawled web pages with metadata';
COMMENT ON TABLE inverted_index IS 'Inverted index for fast text search (word -> documents)';
COMMENT ON TABLE document_frequency IS 'Document frequency for TF-IDF calculation';
COMMENT ON TABLE links IS 'Page-to-page links for PageRank calculation';
COMMENT ON TABLE page_rank IS 'PageRank scores for pages';
COMMENT ON TABLE search_queries IS 'User search queries for analytics';
COMMENT ON TABLE search_cache IS 'Cached search results for performance';
