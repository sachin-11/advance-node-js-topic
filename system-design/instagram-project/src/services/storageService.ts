import { uploadToS3, deleteFromS3, generateImageKey } from '../config/s3';
import { uploadToLocal, deleteFromLocal } from '../config/localStorage';
import { ProcessedImages } from './imageProcessingService';

export interface UploadedImages {
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
}

// Check if S3 is enabled (default to local if AWS credentials not provided)
const USE_S3 = process.env.USE_S3 === 'true' && 
               process.env.AWS_ACCESS_KEY_ID && 
               process.env.AWS_SECRET_ACCESS_KEY;

/**
 * Storage Service
 * Handles image uploads and deletions (S3 or Local storage)
 */
export class StorageService {
  /**
   * Upload processed images (S3 or Local)
   */
  async uploadImages(
    userId: number,
    postId: number,
    processedImages: ProcessedImages
  ): Promise<UploadedImages> {
    try {
      const originalKey = generateImageKey(userId, postId, 'original');
      const thumbnailKey = generateImageKey(userId, postId, 'thumbnail');
      const mediumKey = generateImageKey(userId, postId, 'medium');
      const largeKey = generateImageKey(userId, postId, 'large');

      let originalResult, thumbnailResult, mediumResult, largeResult;

      if (USE_S3) {
        // Upload to S3
        originalResult = await uploadToS3(originalKey, processedImages.original, 'image/jpeg');
        thumbnailResult = await uploadToS3(thumbnailKey, processedImages.thumbnail, 'image/jpeg');
        mediumResult = await uploadToS3(mediumKey, processedImages.medium, 'image/jpeg');
        largeResult = await uploadToS3(largeKey, processedImages.large, 'image/jpeg');
      } else {
        // Upload to local storage
        originalResult = await uploadToLocal(originalKey, processedImages.original, 'image/jpeg');
        thumbnailResult = await uploadToLocal(thumbnailKey, processedImages.thumbnail, 'image/jpeg');
        mediumResult = await uploadToLocal(mediumKey, processedImages.medium, 'image/jpeg');
        largeResult = await uploadToLocal(largeKey, processedImages.large, 'image/jpeg');
      }

      return {
        originalUrl: originalResult.url,
        thumbnailUrl: thumbnailResult.url,
        mediumUrl: mediumResult.url,
        largeUrl: largeResult.url,
      };
    } catch (error: any) {
      // If upload fails, try to clean up already uploaded images
      console.error(`Failed to upload images (${USE_S3 ? 'S3' : 'Local'}):`, error.message);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  /**
   * Delete images (S3 or Local)
   */
  async deleteImages(userId: number, postId: number): Promise<void> {
    try {
      const sizes = ['original', 'thumbnail', 'medium', 'large'];
      
      for (const size of sizes) {
        const key = generateImageKey(userId, postId, size);
        
        if (USE_S3) {
          await deleteFromS3(key);
        } else {
          await deleteFromLocal(key);
        }
      }
    } catch (error: any) {
      console.error(`Failed to delete images (${USE_S3 ? 'S3' : 'Local'}):`, error.message);
      // Don't throw - deletion failure shouldn't break the flow
    }
  }
}

