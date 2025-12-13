import sharp from 'sharp';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  exif?: any;
}

export interface ProcessedImages {
  original: Buffer;
  thumbnail: Buffer; // 150x150
  medium: Buffer; // 640x640
  large: Buffer; // 1080x1080
  metadata: ImageMetadata;
}

/**
 * Image Processing Service
 * Handles image resizing, compression, and metadata extraction
 */
export class ImageProcessingService {
  /**
   * Process image: generate thumbnails and extract metadata
   */
  async processImage(imageBuffer: Buffer): Promise<ProcessedImages> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Extract metadata
    const imageMetadata: ImageMetadata = {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'jpeg',
      size: imageBuffer.length,
      exif: metadata.exif,
    };

    // Generate thumbnail (150x150) - square crop
    const thumbnail = await image
      .clone()
      .resize(150, 150, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate medium size (640x640) - maintain aspect ratio
    const medium = await image
      .clone()
      .resize(640, 640, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Generate large size (1080x1080) - maintain aspect ratio
    const large = await image
      .clone()
      .resize(1080, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 92 })
      .toBuffer();

    // Compress original (maintain quality > 85%)
    const original = await image
      .jpeg({ quality: 92 })
      .toBuffer();

    return {
      original,
      thumbnail,
      medium,
      large,
      metadata: imageMetadata,
    };
  }

  /**
   * Validate image format and size
   */
  validateImage(buffer: Buffer, maxSize: number = 10485760): { valid: boolean; error?: string } {
    // Check file size (10MB max)
    if (buffer.length > maxSize) {
      return { valid: false, error: `Image size exceeds maximum of ${maxSize / 1048576}MB` };
    }

    // Check if it's a valid image by checking magic bytes
    const isValidFormat = this.isValidImageFormat(buffer);
    if (!isValidFormat) {
      return { valid: false, error: 'Invalid image format. Only JPEG, PNG, and WebP are supported' };
    }

    return { valid: true };
  }

  /**
   * Check if buffer is a valid image format
   */
  private isValidImageFormat(buffer: Buffer): boolean {
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return true;
    }

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return true;
    }

    // WebP: RIFF ... WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return true;
    }

    return false;
  }
}

