/**
 * Extract mentions from tweet content
 * Returns array of usernames without the @ symbol
 */
export function extractMentions(content: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = content.match(mentionRegex);

    if (!matches) {
        return [];
    }

    // Remove @ symbol and convert to lowercase
    return matches.map(mention => mention.substring(1).toLowerCase());
}

/**
 * Extract unique mentions (no duplicates)
 */
export function extractUniqueMentions(content: string): string[] {
    const mentions = extractMentions(content);
    return Array.from(new Set(mentions));
}
