/**
 * Admin Controller
 * Handles admin operations
 */

const RankerService = require('../services/RankerService');
const IndexerService = require('../services/IndexerService');
const db = require('../database/connection');

class AdminController {
    /**
     * Get system statistics
     */
    async getStats(req, res) {
        try {
            const [
                pagesResult,
                indexedResult,
                linksResult,
                queriesResult,
                queueResult
            ] = await Promise.all([
                db.query('SELECT COUNT(*) as count FROM web_pages'),
                db.query('SELECT COUNT(*) as count FROM web_pages WHERE is_indexed = true'),
                db.query('SELECT COUNT(*) as count FROM links'),
                db.query('SELECT COUNT(*) as count FROM search_queries WHERE created_at > NOW() - INTERVAL \'24 hours\''),
                db.query('SELECT COUNT(*) as count FROM crawl_queue WHERE status = \'PENDING\'')
            ]);

            res.json({
                success: true,
                stats: {
                    totalPages: parseInt(pagesResult.rows[0]?.count || 0),
                    indexedPages: parseInt(indexedResult.rows[0]?.count || 0),
                    totalLinks: parseInt(linksResult.rows[0]?.count || 0),
                    queriesLast24h: parseInt(queriesResult.rows[0]?.count || 0),
                    pendingUrls: parseInt(queueResult.rows[0]?.count || 0)
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get stats',
                message: error.message
            });
        }
    }

    /**
     * Calculate PageRank
     */
    async calculatePageRank(req, res) {
        try {
            const { iterations } = req.body;

            res.json({
                success: true,
                message: 'PageRank calculation started',
                iterations: iterations || 10
            });

            // Run in background
            RankerService.calculatePageRank(iterations || 10)
                .then(() => {
                    console.log('✅ PageRank calculation completed');
                })
                .catch(error => {
                    console.error('❌ PageRank calculation failed:', error);
                });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to start PageRank calculation',
                message: error.message
            });
        }
    }

    /**
     * Reindex page
     */
    async reindexPage(req, res) {
        try {
            const { pageId } = req.params;

            const result = await IndexerService.reindexPage(pageId);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Page reindexed successfully',
                    pageId
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to reindex page',
                message: error.message
            });
        }
    }
}

module.exports = new AdminController();
