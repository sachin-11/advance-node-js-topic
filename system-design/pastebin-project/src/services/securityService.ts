import validator from 'validator';
import bcrypt from 'bcrypt';

/**
 * Security Service - Handles security-related operations
 */
export class SecurityService {
  private maliciousPatterns = [
    /phishing/i,
    /malware/i,
    /spam/i,
    /virus/i,
    /trojan/i,
    /malicious/i,
  ];

  private blacklistDomains: string[] = [
    // Add known malicious domains here
  ];

  /**
   * Check if content contains malicious patterns
   */
  async checkMaliciousContent(content: string): Promise<boolean> {
    // Check patterns
    if (this.maliciousPatterns.some(p => p.test(content))) {
      return true;
    }

    // Check for URLs in content
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex) || [];

    for (const url of urls) {
      try {
        const domain = new URL(url).hostname;
        if (this.blacklistDomains.includes(domain)) {
          return true;
        }
      } catch {
        // Invalid URL, skip
      }
    }

    return false;
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Sanitize content to prevent XSS
   */
  sanitizeContent(content: string): string {
    // Escape HTML characters
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Validate paste content
   */
  validateContent(content: string, maxSize: number = 10485760): { valid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: 'Content cannot be empty' };
    }

    if (content.length > maxSize) {
      return { valid: false, error: `Content exceeds maximum size of ${maxSize} bytes` };
    }

    return { valid: true };
  }
}

