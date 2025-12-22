/**
 * Ranking Service
 * Ranks search results using TF-IDF and PageRank
 */

const db = require('../database/connection');
const config = require('../config');

class RankerService {
    /**
     * Rank documents
     * @param {Array} documents - Documents to rank
     * @param {Array<string>} queryTokens - Query tokens
     * @returns {Array} Ranked documents
     */
    async rank(documents, queryTokens) {
        if (documents.length === 0) return [];

        // Get total document count
        const totalDocsResult = await db.query(
            'SELECT COUNT(*) as count FROM web_pages WHERE is_indexed = true'
        );
        const totalDocs = parseInt(totalDocsResult.rows[0]?.count || 0);

        // Get document frequencies for query terms
        const dfMap = await this.getDocumentFrequencies(queryTokens);

        // Calculate scores for each document
        const scored = await Promise.all(
            documents.map(async (doc) => {
                const tfidfScore = await this.calculateTFIDF(doc, queryTokens, dfMap, totalDocs);
                const pageRankScore = doc.pageRank || 0;
                const matchScore = doc.matchedTerms / queryTokens.length;

                // Combine scores
                const finalScore = (
                    tfidfScore * config.ranking.tfidfWeight +
                    pageRankScore * config.ranking.pageRankWeight +
                    matchScore * config.ranking.matchWeight
                );

                return {
                    ...doc,
                    tfidfScore,
                    pageRankScore,
                    matchScore,
                    finalScore
                };
            })
        );

        // Sort by final score
        return scored.sort((a, b) => b.finalScore - a.finalScore);
    }

    /**
     * Calculate TF-IDF score for a document
     * @param {Object} doc - Document
     * @param {Array<string>} queryTokens - Query tokens
     * @param {Object} dfMap - Document frequency map
     * @param {number} totalDocs - Total documents
     * @returns {number} TF-IDF score
     */
    async calculateTFIDF(doc, queryTokens, dfMap, totalDocs) {
        let score = 0;

        // Get term frequencies for this document
        const tfResult = await db.query(
            `SELECT word, term_frequency, field_type
             FROM inverted_index
             WHERE page_id = $1 AND word = ANY($2)`,
            [doc.pageId, queryTokens]
        );

        const tfMap = {};
        tfResult.rows.forEach(row => {
            const word = row.word;
            const fieldWeight = this.getFieldWeight(row.field_type);
            const tf = row.term_frequency * fieldWeight;

            if (!tfMap[word]) {
                tfMap[word] = 0;
            }
            tfMap[word] += tf;
        });

        // Calculate TF-IDF for each query term
        queryTokens.forEach(token => {
            const tf = tfMap[token] || 0;
            const df = dfMap[token] || 1;

            if (tf > 0 && df > 0 && totalDocs > 0) {
                // TF-IDF = log(1 + TF) * log(N / DF)
                const tfidf = Math.log(1 + tf) * Math.log(totalDocs / df);
                score += tfidf;
            }
        });

        return score;
    }

    /**
     * Get document frequencies for terms
     * @param {Array<string>} terms - Terms
     * @returns {Object} Document frequency map
     */
    async getDocumentFrequencies(terms) {
        try {
            const result = await db.query(
                'SELECT word, document_count FROM document_frequency WHERE word = ANY($1)',
                [terms]
            );

            const dfMap = {};
            result.rows.forEach(row => {
                dfMap[row.word] = parseInt(row.document_count);
            });

            // Fill missing terms with 1
            terms.forEach(term => {
                if (!dfMap[term]) {
                    dfMap[term] = 1;
                }
            });

            return dfMap;
        } catch (error) {
            console.error('❌ Failed to get document frequencies:', error.message);
            return {};
        }
    }

    /**
     * Get field weight for TF-IDF calculation
     * @param {string} fieldType - Field type
     * @returns {number} Weight
     */
    getFieldWeight(fieldType) {
        const weights = {
            'title': 3.0,
            'meta': 2.0,
            'keywords': 1.5,
            'body': 1.0
        };
        return weights[fieldType] || 1.0;
    }

    /**
     * Calculate PageRank for all pages
     * @param {number} iterations - Number of iterations
     */
    async calculatePageRank(iterations = 10) {
        const dampingFactor = 0.85;

        // Get total pages
        const totalResult = await db.query('SELECT COUNT(*) as count FROM web_pages WHERE is_indexed = true');
        const totalPages = parseInt(totalResult.rows[0]?.count || 1);
        const initialRank = 1.0 / totalPages;

        // Initialize PageRank
        await db.query(`
            INSERT INTO page_rank (page_id, rank_value, iteration)
            SELECT id, $1, 0 FROM web_pages WHERE is_indexed = true
            ON CONFLICT (page_id) DO UPDATE SET rank_value = $1, iteration = 0
        `, [initialRank]);

        // Iterate
        for (let iter = 1; iter <= iterations; iter++) {
            console.log(`📊 PageRank iteration ${iter}/${iterations}`);

            // Get all pages
            const pagesResult = await db.query('SELECT id FROM web_pages WHERE is_indexed = true');

            for (const page of pagesResult.rows) {
                const pageId = page.id;

                // Get incoming links
                const incomingResult = await db.query(
                    `SELECT from_page_id FROM links WHERE to_page_id = $1`,
                    [pageId]
                );

                let prSum = 0;

                for (const link of incomingResult.rows) {
                    // Get PageRank of source page
                    const sourcePR = await db.query(
                        'SELECT rank_value FROM page_rank WHERE page_id = $1',
                        [link.from_page_id]
                    );

                    if (sourcePR.rows.length > 0) {
                        const sourceRank = parseFloat(sourcePR.rows[0].rank_value);

                        // Get outgoing links count
                        const outgoingResult = await db.query(
                            'SELECT COUNT(*) as count FROM links WHERE from_page_id = $1',
                            [link.from_page_id]
                        );
                        const outgoingCount = parseInt(outgoingResult.rows[0]?.count || 1);

                        prSum += sourceRank / outgoingCount;
                    }
                }

                // Calculate new PageRank
                const newPR = (1 - dampingFactor) + dampingFactor * prSum;

                // Update PageRank
                await db.query(
                    'UPDATE page_rank SET rank_value = $1, iteration = $2 WHERE page_id = $3',
                    [newPR, iter, pageId]
                );

                // Update web_pages table
                await db.query(
                    'UPDATE web_pages SET page_rank = $1 WHERE id = $2',
                    [newPR, pageId]
                );
            }
        }

        console.log('✅ PageRank calculation completed');
    }
}

module.exports = new RankerService();
