/**
 * Search Controller
 * Handles search API requests
 */

const SearchService = require('../services/SearchService');

class SearchController {
    /**
     * Search endpoint
     */
    async search(req, res) {
        try {
            const { q, page, limit, filters } = req.query;

            if (!q || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter "q" is required'
                });
            }

            const options = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                filters: filters ? JSON.parse(filters) : {}
            };

            const results = await SearchService.search(q, options);

            res.json(results);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Search failed',
                message: error.message
            });
        }
    }

    /**
     * Autocomplete endpoint
     */
    async autocomplete(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length < 2) {
                return res.json({
                    success: true,
                    suggestions: []
                });
            }

            const suggestions = await SearchService.getAutocomplete(q, 10);

            res.json({
                success: true,
                query: q,
                suggestions
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Autocomplete failed',
                message: error.message
            });
        }
    }
}

module.exports = new SearchController();
