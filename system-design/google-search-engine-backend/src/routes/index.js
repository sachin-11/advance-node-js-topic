/**
 * API Routes
 */

const express = require('express');
const router = express.Router();

const SearchController = require('../controllers/SearchController');
const CrawlerController = require('../controllers/CrawlerController');
const AdminController = require('../controllers/AdminController');

// ═══════════════════════════════════════════
// Search APIs
// ═══════════════════════════════════════════
router.get('/search', SearchController.search.bind(SearchController));
router.get('/autocomplete', SearchController.autocomplete.bind(SearchController));

// ═══════════════════════════════════════════
// Crawler APIs
// ═══════════════════════════════════════════
router.post('/crawl/add', CrawlerController.addUrl.bind(CrawlerController));
router.post('/crawl/process', CrawlerController.processQueue.bind(CrawlerController));
router.post('/crawl/url', CrawlerController.crawlUrl.bind(CrawlerController));
router.get('/crawl/status', CrawlerController.getQueueStatus.bind(CrawlerController));

// ═══════════════════════════════════════════
// Admin APIs
// ═══════════════════════════════════════════
router.get('/admin/stats', AdminController.getStats.bind(AdminController));
router.post('/admin/pagerank', AdminController.calculatePageRank.bind(AdminController));
router.post('/admin/reindex/:pageId', AdminController.reindexPage.bind(AdminController));

module.exports = router;
