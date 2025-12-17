import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Ensure uploads directory exists
 */
async function ensureUploadsDir(): Promise<void> {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    // Directory doesn't exist, create it
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    
    // Create subdirectories
    await fs.mkdir(path.join(UPLOADS_DIR, 'media'), { recursive: true });
    await fs.mkdir(path.join(UPLOADS_DIR, 'documents'), { recursive: true });
    await fs.mkdir(path.join(UPLOADS_DIR, 'profile'), { recursive: true });
  }
}

/**
 * Upload file to local storage
 */
export async function uploadToLocal(
  key: string,
  buffer: Buffer,
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  try {
    await ensureUploadsDir();
    
    const filePath = path.join(UPLOADS_DIR, key);
    const dir = path.dirname(filePath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(filePath, buffer);
    
    // Generate URL
    const url = `${BASE_URL}/uploads/${key}`;
    
    return { url, key };
  } catch (error: any) {
    console.error('Local Storage Upload Error:', error.message);
    throw new Error(`Failed to upload to local storage: ${error.message}`);
  }
}

/**
 * Delete file from local storage
 */
export async function deleteFromLocal(key: string): Promise<void> {
  try {
    const filePath = path.join(UPLOADS_DIR, key);
    
    // Check if file exists
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch {
      // File doesn't exist, that's okay
      console.log(`File not found for deletion: ${key}`);
    }
  } catch (error: any) {
    console.error('Local Storage Delete Error:', error.message);
    throw new Error(`Failed to delete from local storage: ${error.message}`);
  }
}

/**
 * Get uploads directory path
 */
export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

export { UPLOADS_DIR, BASE_URL };
