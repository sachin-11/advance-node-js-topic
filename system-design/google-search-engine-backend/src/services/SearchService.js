/**
 * Search Service
 * Processes search queries and returns results
 */

const crypto = require('crypto');
const db = require('../database/connection');
const Tokenizer = require('../utils/tokenizer');
const RankerService = require('./RankerService');
const config = require('../config');

class SearchService {
    /**
     * Search for query
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Object} Search results
     */
    async search(query, options = {}) {
        const startTime = Date.now();
        const normalizedQuery = Tokenizer.normalizeQuery(query);
        const limit = Math.min(options.limit || config.search.defaultLimit, config.search.maxLimit);
        const page = options.page || 1;
        const offset = (page - 1) * limit;

        // Check cache
        const cacheKey = this.getCacheKey(normalizedQuery, options);
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            return {
                ...cached,
                cached: true,
                searchTimeMs: Date.now() - startTime
            };
        }

        // Tokenize query
        const queryTokens = Tokenizer.tokenize(normalizedQuery);

        if (queryTokens.length === 0) {
            return {
                success: false,
                error: 'Invalid query',
                results: [],
                total: 0
            };
        }

        // Get matching documents
        const documents = await this.getMatchingDocuments(queryTokens, limit * 2); // Get more for ranking

        // Rank documents
        const ranked = await RankerService.rank(documents, queryTokens);

        // Paginate
        const paginated = ranked.slice(offset, offset + limit);

        // Format results
        const results = await this.formatResults(paginated, queryTokens);

        // Save query to analytics
        await this.saveQuery(normalizedQuery, results.length);

        // Cache results
        await this.saveToCache(cacheKey, {
            query: normalizedQuery,
            results,
            total: ranked.length,
            page,
            limit
        });

        return {
            success: true,
            query: normalizedQuery,
            results,
            total: ranked.length,
            page,
            limit,
            searchTimeMs: Date.now() - startTime,
            cached: false
        };
    }

    /**
     * Get matching documents from inverted index
     * @param {Array<string>} queryTokens - Query tokens
     * @param {number} limit - Maximum documents to return
     * @returns {Array} Matching documents
     */
    async getMatchingDocuments(queryTokens, limit = 1000) {
        try {
            // Get documents containing query terms
            const query = `
                SELECT 
                    ii.page_id,
                    wp.url,
                    wp.title,
                    wp.meta_description,
                    wp.domain,
                    wp.page_rank,
                    SUM(CASE 
                        WHEN ii.field_type = 'title' THEN ii.term_frequency * 3
                        WHEN ii.field_type = 'meta' THEN ii.term_frequency * 2
                        ELSE ii.term_frequency
                    END) as weighted_tf,
                    COUNT(DISTINCT ii.word) as matched_terms,
                    COUNT(DISTINCT ii.field_type) as matched_fields,
                    ARRAY_AGG(DISTINCT ii.field_type) as fields
                FROM inverted_index ii
                JOIN web_pages wp ON ii.page_id = wp.id
                WHERE ii.word = ANY($1)
                AND wp.is_indexed = true
                GROUP BY ii.page_id, wp.url, wp.title, wp.meta_description, wp.domain, wp.page_rank
                HAVING COUNT(DISTINCT ii.word) >= $2
                ORDER BY matched_terms DESC, weighted_tf DESC
                LIMIT $3;
            `;

            const result = await db.query(query, [
                queryTokens,
                Math.max(1, Math.floor(queryTokens.length * 0.7)), // At least 70% of terms
                limit
            ]);

            return result.rows.map(row => ({
                pageId: row.page_id,
                url: row.url,
                title: row.title,
                metaDescription: row.meta_description,
                domain: row.domain,
                pageRank: parseFloat(row.page_rank) || 0,
                weightedTF: parseFloat(row.weighted_tf) || 0,
                matchedTerms: parseInt(row.matched_terms),
                matchedFields: parseInt(row.matched_fields),
                fields: row.fields
            }));
        } catch (error) {
            console.error('❌ Failed to get matching documents:', error.message);
            return [];
        }
    }

    /**
     * Format search results
     * @param {Array} documents - Ranked documents
     * @param {Array<string>} queryTokens - Query tokens
     * @returns {Array} Formatted results
     */
    async formatResults(documents, queryTokens) {
        return documents.map((doc, index) => ({
            id: doc.pageId,
            title: doc.title || doc.url,
            url: doc.url,
            snippet: this.generateSnippet(doc.metaDescription || '', queryTokens),
            domain: doc.domain,
            rank: index + 1,
            score: doc.finalScore || doc.score || 0,
            pageRank: doc.pageRankScore || doc.pageRank || 0
        }));
    }

    /**
     * Generate snippet from text
     * @param {string} text - Text to generate snippet from
     * @param {Array<string>} queryTokens - Query tokens
     * @param {number} maxLength - Maximum snippet length
     * @returns {string} Snippet
     */
    generateSnippet(text, queryTokens, maxLength = 200) {
        if (!text) return '';

        const lowerText = text.toLowerCase();
        let bestStart = 0;
        let maxMatches = 0;

        // Find position with most query term matches
        for (let i = 0; i < Math.min(text.length, 500); i++) {
            const snippet = text.substring(i, i + maxLength).toLowerCase();
            const matches = queryTokens.filter(token => snippet.includes(token)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                bestStart = i;
            }
        }

        let snippet = text.substring(bestStart, bestStart + maxLength);

        // Highlight query terms
        queryTokens.forEach(token => {
            const regex = new RegExp(`(${token})`, 'gi');
            snippet = snippet.replace(regex, '<strong>$1</strong>');
        });

        // Add ellipsis if truncated
        if (bestStart > 0) snippet = '...' + snippet;
        if (bestStart + maxLength < text.length) snippet = snippet + '...';

        return snippet;
    }

    /**
     * Get cache key
     * @param {string} query - Normalized query
     * @param {Object} options - Options
     * @returns {string} Cache key
     */
    getCacheKey(query, options) {
        const key = `${query}_${options.page || 1}_${options.limit || 10}`;
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    /**
     * Get from cache
     * @param {string} cacheKey - Cache key
     * @returns {Object|null} Cached results
     */
    async getFromCache(cacheKey) {
        try {
            const result = await db.query(
                'SELECT results, result_count FROM search_cache WHERE query_hash = $1 AND expires_at > NOW()',
                [cacheKey]
            );

            if (result.rows.length > 0) {
                return result.rows[0].results;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Save to cache
     * @param {string} cacheKey - Cache key
     * @param {Object} data - Data to cache
     */
    async saveToCache(cacheKey, data) {
        try {
            const expiresAt = new Date(Date.now() + config.search.cacheTTL * 1000);
            await db.query(
                `INSERT INTO search_cache (query_hash, query_text, results, result_count, expires_at)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (query_hash) DO UPDATE SET
                     results = EXCLUDED.results,
                     result_count = EXCLUDED.result_count,
                     expires_at = EXCLUDED.expires_at`,
                [cacheKey, data.query, JSON.stringify(data), data.total, expiresAt]
            );
        } catch (error) {
            console.error('❌ Failed to save to cache:', error.message);
        }
    }

    /**
     * Save search query for analytics
     * @param {string} query - Query text
     * @param {number} resultCount - Result count
     */
    async saveQuery(query, resultCount) {
        try {
            await db.query(
                `INSERT INTO search_queries (query_text, normalized_query, result_count)
                 VALUES ($1, $2, $3)`,
                [query, query, resultCount]
            );
        } catch (error) {
            // Ignore errors for analytics
        }
    }

    /**
     * Get autocomplete suggestions
     * @param {string} prefix - Query prefix
     * @param {number} limit - Number of suggestions
     * @returns {Array} Suggestions
     */
    async getAutocomplete(prefix, limit = 10) {
        try {
            const normalizedPrefix = Tokenizer.normalizeQuery(prefix);
            const result = await db.query(
                `SELECT suggestion, frequency
                 FROM query_suggestions
                 WHERE query_prefix = $1
                 ORDER BY frequency DESC, last_searched_at DESC
                 LIMIT $2`,
                [normalizedPrefix, limit]
            );

            return result.rows.map(row => ({
                text: row.suggestion,
                frequency: parseInt(row.frequency)
            }));
        } catch (error) {
            console.error('❌ Failed to get autocomplete:', error.message);
            return [];
        }
    }
}

module.exports = new SearchService();
