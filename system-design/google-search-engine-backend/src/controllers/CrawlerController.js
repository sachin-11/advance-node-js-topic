/**
 * Crawler Controller
 * Handles crawler API requests
 */

const CrawlerService = require('../services/CrawlerService');
const IndexerService = require('../services/IndexerService');
const db = require('../database/connection');

class CrawlerController {
    /**
     * Add URL to crawl queue
     */
    async addUrl(req, res) {
        try {
            const { url, priority, depth } = req.body;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required'
                });
            }

            const queueId = await CrawlerService.addToQueue(
                url,
                priority || 5,
                depth || 0
            );

            res.json({
                success: true,
                message: 'URL added to crawl queue',
                queueId,
                url
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to add URL',
                message: error.message
            });
        }
    }

    /**
     * Get crawl queue status
     */
    async getQueueStatus(req, res) {
        try {
            const result = await db.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM crawl_queue
                GROUP BY status
            `);

            const stats = {};
            result.rows.forEach(row => {
                stats[row.status] = parseInt(row.count);
            });

            res.json({
                success: true,
                queue: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get queue status',
                message: error.message
            });
        }
    }

    /**
     * Process crawl queue
     */
    async processQueue(req, res) {
        try {
            const { batchSize } = req.body;

            const result = await CrawlerService.processQueue(batchSize || 10);

            res.json({
                success: true,
                message: 'Crawl queue processed',
                ...result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to process queue',
                message: error.message
            });
        }
    }

    /**
     * Crawl single URL
     */
    async crawlUrl(req, res) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required'
                });
            }

            const result = await CrawlerService.crawl(url, 0);

            if (result.success) {
                // Index the page
                await IndexerService.indexPage(result.pageId, result.parsed);

                res.json({
                    success: true,
                    message: 'URL crawled and indexed successfully',
                    pageId: result.pageId,
                    url: result.url
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error || 'Failed to crawl URL',
                    skipped: result.skipped,
                    reason: result.reason
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to crawl URL',
                message: error.message
            });
        }
    }
}

module.exports = new CrawlerController();
