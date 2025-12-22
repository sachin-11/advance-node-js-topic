/**
 * HTML Parser
 * Extracts content from HTML documents
 */

const cheerio = require('cheerio');

class HTMLParser {
    /**
     * Parse HTML content
     * @param {string} html - HTML content
     * @param {string} baseUrl - Base URL for resolving relative links
     * @returns {Object} Parsed content
     */
    parse(html, baseUrl = '') {
        const $ = cheerio.load(html);

        // Extract title
        const title = $('title').first().text().trim() || 
                     $('h1').first().text().trim() || '';

        // Extract meta description
        const metaDescription = $('meta[name="description"]').attr('content') ||
                               $('meta[property="og:description"]').attr('content') || '';

        // Extract headings
        const headings = {
            h1: $('h1').map((i, el) => $(el).text().trim()).get(),
            h2: $('h2').map((i, el) => $(el).text().trim()).get(),
            h3: $('h3').map((i, el) => $(el).text().trim()).get()
        };

        // Extract body text (remove scripts, styles)
        $('script, style, nav, footer, header, aside').remove();
        const bodyText = $('body').text().trim() || $('html').text().trim();

        // Extract links
        const links = this.extractLinks($, baseUrl);

        // Extract images (alt text)
        const images = $('img').map((i, el) => ({
            src: $(el).attr('src'),
            alt: $(el).attr('alt') || ''
        })).get();

        // Extract meta keywords
        const keywords = $('meta[name="keywords"]').attr('content') || '';

        return {
            title,
            metaDescription,
            headings,
            bodyText,
            links,
            images,
            keywords,
            textLength: bodyText.length
        };
    }

    /**
     * Extract links from HTML
     * @param {Object} $ - Cheerio instance
     * @param {string} baseUrl - Base URL
     * @returns {Array<Object>} Array of links
     */
    extractLinks($, baseUrl) {
        const links = [];
        const seen = new Set();

        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            const anchorText = $(el).text().trim();

            if (!href) return;

            // Resolve relative URLs
            let absoluteUrl;
            try {
                if (href.startsWith('http://') || href.startsWith('https://')) {
                    absoluteUrl = href;
                } else if (href.startsWith('//')) {
                    absoluteUrl = new URL(baseUrl).protocol + href;
                } else if (href.startsWith('/')) {
                    const base = new URL(baseUrl);
                    absoluteUrl = `${base.protocol}//${base.host}${href}`;
                } else {
                    absoluteUrl = new URL(href, baseUrl).href;
                }
            } catch (e) {
                return; // Skip invalid URLs
            }

            // Skip duplicates and fragments
            if (seen.has(absoluteUrl) || absoluteUrl.includes('#')) {
                return;
            }

            seen.add(absoluteUrl);

            // Determine link type
            const linkType = absoluteUrl.startsWith(baseUrl) ? 'internal' : 'external';

            links.push({
                url: absoluteUrl,
                anchorText,
                linkType
            });
        });

        return links;
    }

    /**
     * Extract domain from URL
     * @param {string} url - URL
     * @returns {string} Domain
     */
    extractDomain(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch (e) {
            return '';
        }
    }
}

module.exports = new HTMLParser();
