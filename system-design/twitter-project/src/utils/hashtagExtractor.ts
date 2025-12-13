/**
 * Extract hashtags from tweet content
 * Returns array of hashtags without the # symbol
 */
export function extractHashtags(content: string): string[] {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = content.match(hashtagRegex);

    if (!matches) {
        return [];
    }

    // Remove # symbol and convert to lowercase
    return matches.map(tag => tag.substring(1).toLowerCase());
}

/**
 * Extract unique hashtags (no duplicates)
 */
export function extractUniqueHashtags(content: string): string[] {
    const hashtags = extractHashtags(content);
    return Array.from(new Set(hashtags));
}
