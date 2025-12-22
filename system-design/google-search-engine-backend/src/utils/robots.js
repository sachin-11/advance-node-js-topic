/**
 * Robots.txt Parser
 * Parses and validates robots.txt rules
 */

class RobotsParser {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Parse robots.txt content
     * @param {string} content - robots.txt content
     * @param {string} userAgent - User agent (default: *)
     * @returns {Object} Parsed rules
     */
    parse(content, userAgent = '*') {
        if (!content) {
            return {
                allowed: true,
                crawlDelay: 0,
                disallowed: [],
                allowedPaths: []
            };
        }

        const rules = {
            allowed: true,
            crawlDelay: 0,
            disallowed: [],
            allowedPaths: []
        };

        const lines = content.split('\n');
        let currentUserAgent = null;
        let inUserAgentBlock = false;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const [directive, ...valueParts] = trimmed.split(':').map(s => s.trim());
            const value = valueParts.join(':').trim();

            if (directive.toLowerCase() === 'user-agent') {
                if (value === userAgent || value === '*') {
                    inUserAgentBlock = true;
                    currentUserAgent = value;
                } else {
                    inUserAgentBlock = false;
                }
            } else if (inUserAgentBlock || currentUserAgent === '*') {
                if (directive.toLowerCase() === 'disallow') {
                    if (value === '') {
                        rules.allowed = true;
                    } else {
                        rules.disallowed.push(value);
                    }
                } else if (directive.toLowerCase() === 'allow') {
                    rules.allowedPaths.push(value);
                } else if (directive.toLowerCase() === 'crawl-delay') {
                    rules.crawlDelay = parseInt(value) || 0;
                }
            }
        }

        return rules;
    }

    /**
     * Check if URL is allowed
     * @param {string} url - URL to check
     * @param {Object} rules - Parsed robots.txt rules
     * @returns {boolean} True if allowed
     */
    isAllowed(url, rules) {
        if (!rules || rules.allowed === false) {
            return false;
        }

        // Check disallowed paths
        for (const disallowed of rules.disallowed) {
            if (url.includes(disallowed)) {
                // Check if there's an allow rule that overrides
                let overridden = false;
                for (const allowed of rules.allowedPaths) {
                    if (url.includes(allowed) && allowed.length > disallowed.length) {
                        overridden = true;
                        break;
                    }
                }
                if (!overridden) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Get crawl delay
     * @param {Object} rules - Parsed rules
     * @returns {number} Crawl delay in seconds
     */
    getCrawlDelay(rules) {
        return rules?.crawlDelay || 0;
    }
}

module.exports = new RobotsParser();
