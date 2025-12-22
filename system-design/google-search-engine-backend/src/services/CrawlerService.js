/**
 * Web Crawler Service
 * Crawls web pages and extracts content
 */

const axios = require('axios');
const crypto = require('crypto');
const db = require('../database/connection');
const HTMLParser = require('../utils/htmlParser');
const RobotsParser = require('../utils/robots');
const config = require('../config');

class CrawlerService {
    constructor() {
        this.robotsCache = new Map();
        this.domainDelays = new Map(); // Track crawl delays per domain
    }

    /**
     * Add URL to crawl queue
     * @param {string} url - URL to crawl
     * @param {number} priority - Priority (1-10, 1 = highest)
     * @param {number} depth - Current depth
     * @param {string} parentUrl - Parent URL
     */
    async addToQueue(url, priority = 5, depth = 0, parentUrl = null) {
        try {
            const query = `
                INSERT INTO crawl_queue (url, priority, depth, parent_url, status)
                VALUES ($1, $2, $3, $4, 'PENDING')
                ON CONFLICT (url) DO UPDATE SET
                    priority = LEAST(crawl_queue.priority, EXCLUDED.priority),
                    scheduled_at = CURRENT_TIMESTAMP
                RETURNING id;
            `;

            const result = await db.query(query, [url, priority, depth, parentUrl]);
            return result.rows[0]?.id;
        } catch (error) {
            console.error(`❌ Failed to add URL to queue: ${url}`, error.message);
            return null;
        }
    }

    /**
     * Get next batch of URLs to crawl
     * @param {number} batchSize - Number of URLs to fetch
     * @returns {Array} URLs to crawl
     */
    async getNextBatch(batchSize = 10) {
        try {
            const query = `
                SELECT id, url, priority, depth, parent_url
                FROM crawl_queue
                WHERE status = 'PENDING'
                ORDER BY priority ASC, scheduled_at ASC
                LIMIT $1
                FOR UPDATE SKIP LOCKED;
            `;

            const result = await db.query(query, [batchSize]);
            return result.rows;
        } catch (error) {
            console.error('❌ Failed to get next batch:', error.message);
            return [];
        }
    }

    /**
     * Mark URL as crawling
     * @param {string} queueId - Queue ID
     */
    async markCrawling(queueId) {
        try {
            await db.query(
                'UPDATE crawl_queue SET status = $1, crawled_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['CRAWLING', queueId]
            );
        } catch (error) {
            console.error('❌ Failed to mark as crawling:', error.message);
        }
    }

    /**
     * Mark URL as completed
     * @param {string} queueId - Queue ID
     */
    async markCompleted(queueId) {
        try {
            await db.query(
                'UPDATE crawl_queue SET status = $1 WHERE id = $2',
                ['COMPLETED', queueId]
            );
        } catch (error) {
            console.error('❌ Failed to mark as completed:', error.message);
        }
    }

    /**
     * Mark URL as failed
     * @param {string} queueId - Queue ID
     * @param {string} errorMessage - Error message
     */
    async markFailed(queueId, errorMessage) {
        try {
            await db.query(
                `UPDATE crawl_queue 
                 SET status = 'FAILED', error_message = $1, retry_count = retry_count + 1
                 WHERE id = $2`,
                [errorMessage, queueId]
            );
        } catch (error) {
            console.error('❌ Failed to mark as failed:', error.message);
        }
    }

    /**
     * Check robots.txt for domain
     * @param {string} domain - Domain name
     * @returns {Object} Robots rules
     */
    async getRobotsRules(domain) {
        // Check cache
        if (this.robotsCache.has(domain)) {
            const cached = this.robotsCache.get(domain);
            if (cached.expiresAt > Date.now()) {
                return cached.rules;
            }
        }

        try {
            // Check database cache
            const dbResult = await db.query(
                'SELECT content, expires_at FROM robots_txt WHERE domain = $1',
                [domain]
            );

            if (dbResult.rows.length > 0) {
                const cached = dbResult.rows[0];
                if (cached.expires_at > new Date()) {
                    const rules = RobotsParser.parse(cached.content);
                    this.robotsCache.set(domain, {
                        rules,
                        expiresAt: cached.expires_at.getTime()
                    });
                    return rules;
                }
            }

            // Fetch robots.txt
            const robotsUrl = `https://${domain}/robots.txt`;
            const response = await axios.get(robotsUrl, {
                timeout: 5000,
                headers: { 'User-Agent': config.crawler.userAgent }
            });

            const rules = RobotsParser.parse(response.data);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Cache in database
            await db.query(
                `INSERT INTO robots_txt (domain, content, expires_at)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (domain) DO UPDATE SET
                     content = EXCLUDED.content,
                     expires_at = EXCLUDED.expires_at,
                     last_fetched_at = CURRENT_TIMESTAMP`,
                [domain, response.data, expiresAt]
            );

            // Cache in memory
            this.robotsCache.set(domain, {
                rules,
                expiresAt: expiresAt.getTime()
            });

            return rules;
        } catch (error) {
            // If robots.txt doesn't exist, allow crawling
            console.log(`⚠️  robots.txt not found for ${domain}, allowing crawl`);
            return { allowed: true, crawlDelay: 0, disallowed: [], allowedPaths: [] };
        }
    }

    /**
     * Check if URL is allowed by robots.txt
     * @param {string} url - URL to check
     * @returns {boolean} True if allowed
     */
    async isAllowedByRobots(url) {
        try {
            const domain = HTMLParser.extractDomain(url);
            const rules = await this.getRobotsRules(domain);
            return RobotsParser.isAllowed(url, rules);
        } catch (error) {
            return true; // Default to allowed
        }
    }

    /**
     * Crawl a single URL
     * @param {string} url - URL to crawl
     * @param {number} depth - Current depth
     * @returns {Object} Crawled page data
     */
    async crawl(url, depth = 0) {
        // Check robots.txt
        const allowed = await this.isAllowedByRobots(url);
        if (!allowed) {
            return { skipped: true, reason: 'robots.txt disallowed' };
        }

        // Check domain crawl delay
        const domain = HTMLParser.extractDomain(url);
        const rules = await this.getRobotsRules(domain);
        const crawlDelay = RobotsParser.getCrawlDelay(rules) * 1000;

        if (this.domainDelays.has(domain)) {
            const lastCrawl = this.domainDelays.get(domain);
            const timeSinceLastCrawl = Date.now() - lastCrawl;
            if (timeSinceLastCrawl < crawlDelay) {
                const waitTime = crawlDelay - timeSinceLastCrawl;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        try {
            // Fetch page
            const response = await axios.get(url, {
                timeout: config.crawler.timeout,
                headers: {
                    'User-Agent': config.crawler.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                maxRedirects: 5,
                validateStatus: (status) => status < 400
            });

            // Update domain delay tracker
            this.domainDelays.set(domain, Date.now());

            // Parse HTML
            const parsed = HTMLParser.parse(response.data, url);

            // Calculate content hash
            const contentHash = crypto
                .createHash('sha256')
                .update(response.data)
                .digest('hex');

            // Check if page already exists
            const existingPage = await db.query(
                'SELECT id, content_hash FROM web_pages WHERE url = $1',
                [url]
            );

            let pageId;
            if (existingPage.rows.length > 0) {
                // Update existing page
                pageId = existingPage.rows[0].id;
                if (existingPage.rows[0].content_hash === contentHash) {
                    return { skipped: true, reason: 'content unchanged', pageId };
                }

                await db.query(
                    `UPDATE web_pages SET
                     title = $1, meta_description = $2, content_hash = $3,
                     content_length = $4, last_crawled_at = CURRENT_TIMESTAMP,
                     status_code = $5, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $6`,
                    [
                        parsed.title,
                        parsed.metaDescription,
                        contentHash,
                        parsed.textLength,
                        response.status,
                        pageId
                    ]
                );
            } else {
                // Insert new page
                const result = await db.query(
                    `INSERT INTO web_pages (
                        url, domain, title, meta_description, content_hash,
                        content_length, status_code, language, last_crawled_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
                    RETURNING id`,
                    [
                        url,
                        domain,
                        parsed.title,
                        parsed.metaDescription,
                        contentHash,
                        parsed.textLength,
                        response.status,
                        'en'
                    ]
                );
                pageId = result.rows[0].id;
            }

            // Add links to crawl queue (if depth allows)
            if (depth < config.crawler.maxDepth) {
                for (const link of parsed.links) {
                    // Prioritize internal links
                    const priority = link.linkType === 'internal' ? 3 : 7;
                    await this.addToQueue(link.url, priority, depth + 1, url);
                }

                // Save links to database
                await this.saveLinks(pageId, parsed.links);
            }

            return {
                success: true,
                pageId,
                url,
                parsed,
                statusCode: response.status
            };
        } catch (error) {
            console.error(`❌ Failed to crawl ${url}:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Save links to database
     * @param {string} fromPageId - Source page ID
     * @param {Array} links - Array of links
     */
    async saveLinks(fromPageId, links) {
        if (links.length === 0) return;

        try {
            // Get page IDs for target URLs
            const urls = links.map(l => l.url);
            const pagesResult = await db.query(
                'SELECT id, url FROM web_pages WHERE url = ANY($1)',
                [urls]
            );

            const urlToPageId = {};
            pagesResult.rows.forEach(row => {
                urlToPageId[row.url] = row.id;
            });

            // Insert links
            for (const link of links) {
                const toPageId = urlToPageId[link.url];
                if (toPageId) {
                    await db.query(
                        `INSERT INTO links (from_page_id, to_page_id, anchor_text, link_type)
                         VALUES ($1, $2, $3, $4)
                         ON CONFLICT (from_page_id, to_page_id) DO NOTHING`,
                        [fromPageId, toPageId, link.anchorText, link.linkType]
                    );
                }
            }
        } catch (error) {
            console.error('❌ Failed to save links:', error.message);
        }
    }

    /**
     * Process crawl queue
     * @param {number} batchSize - Number of URLs to process
     */
    async processQueue(batchSize = config.crawler.maxConcurrent) {
        const urls = await this.getNextBatch(batchSize);

        if (urls.length === 0) {
            return { processed: 0 };
        }

        const results = await Promise.allSettled(
            urls.map(async (item) => {
                await this.markCrawling(item.id);
                const result = await this.crawl(item.url, item.depth);
                
                if (result.success) {
                    await this.markCompleted(item.id);
                } else if (result.skipped) {
                    await this.markCompleted(item.id);
                } else {
                    await this.markFailed(item.id, result.error);
                }

                return result;
            })
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

        return {
            processed: urls.length,
            successful,
            failed
        };
    }
}

module.exports = new CrawlerService();
