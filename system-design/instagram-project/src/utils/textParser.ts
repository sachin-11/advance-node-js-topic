/**
 * Utility functions for parsing text content
 * Extracts hashtags and mentions from text
 */

/**
 * Extract hashtags from text (e.g., #hashtag)
 * Returns array of hashtag strings without #
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Remove # and return unique hashtags
  const hashtags = matches.map((tag) => tag.substring(1).toLowerCase());
  return [...new Set(hashtags)]; // Remove duplicates
}

/**
 * Extract mentions from text (e.g., @username)
 * Returns array of usernames without @
 */
export function extractMentions(text: string): string[] {
  if (!text) return [];
  
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  
  if (!matches) return [];
  
  // Remove @ and return unique mentions
  const mentions = matches.map((mention) => mention.substring(1).toLowerCase());
  return [...new Set(mentions)]; // Remove duplicates
}

/**
 * Validate hashtag format
 */
export function isValidHashtag(tag: string): boolean {
  const hashtagRegex = /^[a-zA-Z0-9_]+$/;
  return hashtagRegex.test(tag) && tag.length <= 100;
}

/**
 * Validate mention format
 */
export function isValidMention(mention: string): boolean {
  const mentionRegex = /^[a-zA-Z0-9_]+$/;
  return mentionRegex.test(mention) && mention.length <= 50;
}

