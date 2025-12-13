/**
 * Base62 encoding utility for converting numeric IDs to short codes
 * Base62 uses: 0-9, a-z, A-Z (62 characters total)
 */

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = 62;

/**
 * Encodes a numeric ID to a base62 string
 * @param id - The numeric ID to encode
 * @returns Base62 encoded string
 */
export function encodeBase62(id: number): string {
  if (id === 0) {
    return BASE62_CHARS[0];
  }

  let encoded = '';
  let num = id;

  while (num > 0) {
    encoded = BASE62_CHARS[num % BASE] + encoded;
    num = Math.floor(num / BASE);
  }

  return encoded;
}

/**
 * Decodes a base62 string back to a numeric ID
 * @param encoded - The base62 encoded string
 * @returns The decoded numeric ID
 */
export function decodeBase62(encoded: string): number {
  let decoded = 0;
  const length = encoded.length;

  for (let i = 0; i < length; i++) {
    const char = encoded[i];
    const charIndex = BASE62_CHARS.indexOf(char);
    
    if (charIndex === -1) {
      throw new Error(`Invalid base62 character: ${char}`);
    }

    decoded = decoded * BASE + charIndex;
  }

  return decoded;
}

