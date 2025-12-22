/**
 * Indexer Service
 * Builds inverted index from crawled pages
 */

const db = require('../database/connection');
const Tokenizer = require('../utils/tokenizer');
const config = require('../config');

class IndexerService {
    /**
     * Index a page
     * @param {string} pageId - Page ID
     * @param {Object} content - Parsed content
     */
    async indexPage(pageId, content) {
        try {
            // Tokenize different fields
            const titleTokens = Tokenizer.tokenize(content.title || '');
            const bodyTokens = Tokenizer.tokenize(content.bodyText || '');
            const metaTokens = Tokenizer.tokenize(content.metaDescription || '');
            const keywordTokens = Tokenizer.tokenize(content.keywords || '');

            // Calculate term frequencies
            const titleTF = Tokenizer.calculateTermFrequency(titleTokens);
            const bodyTF = Tokenizer.calculateTermFrequency(bodyTokens);
            const metaTF = Tokenizer.calculateTermFrequency(metaTokens);
            const keywordTF = Tokenizer.calculateTermFrequency(keywordTokens);

            // Save to inverted index
            await this.saveInvertedIndex(pageId, 'title', titleTF);
            await this.saveInvertedIndex(pageId, 'body', bodyTF);
            await this.saveInvertedIndex(pageId, 'meta', metaTF);
            await this.saveInvertedIndex(pageId, 'keywords', keywordTF);

            // Extract and save bigrams if enabled
            if (config.indexer.enableBigrams) {
                await this.indexBigrams(pageId, bodyTokens);
            }

            // Mark page as indexed
            await db.query(
                'UPDATE web_pages SET is_indexed = true WHERE id = $1',
                [pageId]
            );

            return { success: true, pageId };
        } catch (error) {
            console.error(`❌ Failed to index page ${pageId}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save inverted index entries
     * @param {string} pageId - Page ID
     * @param {string} fieldType - Field type (title, body, meta)
     * @param {Object} termFreq - Term frequency map
     */
    async saveInvertedIndex(pageId, fieldType, termFreq) {
        if (Object.keys(termFreq).length === 0) return;

        const inserts = Object.entries(termFreq).map(([word, data]) => ({
            word,
            page_id: pageId,
            term_frequency: data.count,
            positions: data.positions,
            field_type: fieldType
        }));

        // Batch insert
        const values = inserts.map((item, index) => {
            const base = index * 5;
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
        }).join(', ');

        const params = inserts.flatMap(item => [
            item.word,
            item.page_id,
            item.term_frequency,
            `{${item.positions.join(',')}}`,
            item.field_type
        ]);

        try {
            await db.query(
                `INSERT INTO inverted_index (word, page_id, term_frequency, positions, field_type)
                 VALUES ${values}
                 ON CONFLICT (word, page_id, field_type) DO UPDATE SET
                     term_frequency = EXCLUDED.term_frequency,
                     positions = EXCLUDED.positions`,
                params
            );
        } catch (error) {
            // If batch is too large, insert in smaller chunks
            if (error.message.includes('too many parameters')) {
                const chunkSize = 100;
                for (let i = 0; i < inserts.length; i += chunkSize) {
                    const chunk = inserts.slice(i, i + chunkSize);
                    await this.saveInvertedIndex(pageId, fieldType, 
                        Object.fromEntries(chunk.map(item => [item.word, { count: item.term_frequency, positions: item.positions }]))
                    );
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * Index bigrams (two-word phrases)
     * @param {string} pageId - Page ID
     * @param {Array<string>} tokens - Tokens
     */
    async indexBigrams(pageId, tokens) {
        if (tokens.length < 2) return;

        const bigrams = [];
        for (let i = 0; i < tokens.length - 1; i++) {
            bigrams.push({
                word1: tokens[i],
                word2: tokens[i + 1],
                position: i
            });
        }

        // Group by bigram
        const bigramFreq = {};
        bigrams.forEach(bigram => {
            const key = `${bigram.word1} ${bigram.word2}`;
            if (!bigramFreq[key]) {
                bigramFreq[key] = {
                    word1: bigram.word1,
                    word2: bigram.word2,
                    frequency: 0,
                    positions: []
                };
            }
            bigramFreq[key].frequency++;
            bigramFreq[key].positions.push(bigram.position);
        });

        // Save to database
        const inserts = Object.values(bigramFreq).map(bigram => ({
            word1: bigram.word1,
            word2: bigram.word2,
            page_id: pageId,
            frequency: bigram.frequency,
            positions: bigram.positions
        }));

        for (const bigram of inserts) {
            try {
                await db.query(
                    `INSERT INTO bigrams (word1, word2, page_id, frequency, positions)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (word1, word2, page_id) DO UPDATE SET
                         frequency = EXCLUDED.frequency,
                         positions = EXCLUDED.positions`,
                    [
                        bigram.word1,
                        bigram.word2,
                        bigram.page_id,
                        bigram.frequency,
                        `{${bigram.positions.join(',')}}`
                    ]
                );
            } catch (error) {
                console.error('❌ Failed to save bigram:', error.message);
            }
        }
    }

    /**
     * Reindex a page
     * @param {string} pageId - Page ID
     */
    async reindexPage(pageId) {
        try {
            // Get page content
            const pageResult = await db.query(
                'SELECT url, title, meta_description FROM web_pages WHERE id = $1',
                [pageId]
            );

            if (pageResult.rows.length === 0) {
                return { success: false, error: 'Page not found' };
            }

            // Delete existing index
            await db.query('DELETE FROM inverted_index WHERE page_id = $1', [pageId]);
            await db.query('DELETE FROM bigrams WHERE page_id = $1', [pageId]);

            // Reindex (would need to fetch page content again or store it)
            // For now, mark as not indexed
            await db.query('UPDATE web_pages SET is_indexed = false WHERE id = $1', [pageId]);

            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to reindex page ${pageId}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process unindexed pages
     * @param {number} batchSize - Batch size
     */
    async processUnindexedPages(batchSize = config.indexer.batchSize) {
        try {
            // Get unindexed pages (would need content stored)
            // For now, this is a placeholder
            const result = await db.query(
                'SELECT id FROM web_pages WHERE is_indexed = false LIMIT $1',
                [batchSize]
            );

            return {
                found: result.rows.length,
                message: 'Note: Content needs to be stored for reindexing'
            };
        } catch (error) {
            console.error('❌ Failed to process unindexed pages:', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new IndexerService();
