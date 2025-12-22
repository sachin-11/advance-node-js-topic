/**
 * Text Tokenizer
 * Tokenizes text into words for indexing
 */

class Tokenizer {
    constructor() {
        // Common stop words (can be expanded)
        this.stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
            'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if',
            'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
            'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more',
            'very', 'after', 'words', 'long', 'than', 'first', 'been', 'call',
            'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get',
            'come', 'made', 'may', 'part'
        ]);
    }

    /**
     * Tokenize text into words
     * @param {string} text - Text to tokenize
     * @returns {Array<string>} Array of tokens
     */
    tokenize(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        // Convert to lowercase
        const lowerText = text.toLowerCase();

        // Remove HTML tags, URLs, emails
        const cleaned = lowerText
            .replace(/<[^>]+>/g, ' ') // Remove HTML tags
            .replace(/https?:\/\/[^\s]+/g, ' ') // Remove URLs
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Split into words
        const words = cleaned.split(/\s+/);

        // Filter: remove stop words, empty strings, and short words
        return words.filter(word => 
            word.length >= 2 && 
            !this.stopWords.has(word) &&
            !/^\d+$/.test(word) // Remove pure numbers
        );
    }

    /**
     * Extract bigrams (two-word phrases)
     * @param {string} text - Text to extract bigrams from
     * @returns {Array<string>} Array of bigrams
     */
    extractBigrams(text) {
        const tokens = this.tokenize(text);
        const bigrams = [];

        for (let i = 0; i < tokens.length - 1; i++) {
            bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
        }

        return bigrams;
    }

    /**
     * Calculate term frequency
     * @param {Array<string>} tokens - Array of tokens
     * @returns {Object} Term frequency map
     */
    calculateTermFrequency(tokens) {
        const tf = {};
        
        tokens.forEach((token, index) => {
            if (!tf[token]) {
                tf[token] = {
                    count: 0,
                    positions: []
                };
            }
            tf[token].count++;
            tf[token].positions.push(index);
        });

        return tf;
    }

    /**
     * Normalize query text
     * @param {string} query - Search query
     * @returns {string} Normalized query
     */
    normalizeQuery(query) {
        if (!query) return '';
        return query.toLowerCase().trim().replace(/\s+/g, ' ');
    }
}

module.exports = new Tokenizer();
