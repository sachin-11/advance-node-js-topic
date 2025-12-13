import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client with region
// Note: If bucket is in different region, we'll auto-detect it
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false, // Use virtual-hosted-style URLs
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'instagram-photos';
const CDN_URL = process.env.S3_CDN_URL || '';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Get bucket region (auto-detect)
 */
async function getBucketRegion(): Promise<string> {
  try {
    const command = new GetBucketLocationCommand({ Bucket: BUCKET_NAME });
    const response = await s3Client.send(command);
    // Bucket location can be null for us-east-1
    return response.LocationConstraint || 'us-east-1';
  } catch (error: any) {
    // If we can't get location, use default from env
    return process.env.AWS_REGION || 'us-east-1';
  }
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  try {
    // Check if bucket name is set
    if (!BUCKET_NAME || BUCKET_NAME === 'instagram-photos') {
      console.warn('⚠️  S3_BUCKET_NAME not set, using default. Make sure bucket exists.');
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // ACL: 'public-read' - Note: Some regions disable ACLs
      // Make sure bucket policy allows public read access
    });

    await s3Client.send(command);

    // Get actual bucket region for URL generation
    const region = await getBucketRegion();
    const url = CDN_URL 
      ? `${CDN_URL}/${key}`
      : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error: any) {
    console.error('S3 Upload Error:', error.message);
    
    // Handle region mismatch error
    if (error.message.includes('endpoint') || error.message.includes('region')) {
      const actualRegion = await getBucketRegion();
      throw new Error(
        `Region mismatch! Bucket "${BUCKET_NAME}" is in region "${actualRegion}". ` +
        `Please update AWS_REGION in .env file to "${actualRegion}"`
      );
    }
    
    // Provide helpful error messages
    if (error.name === 'NoSuchBucket') {
      throw new Error(`S3 bucket "${BUCKET_NAME}" does not exist. Please create it first.`);
    } else if (error.name === 'AccessDenied') {
      throw new Error(`Access denied to S3 bucket. Check IAM permissions and bucket policy.`);
    } else if (error.name === 'InvalidAccessKeyId') {
      throw new Error(`Invalid AWS Access Key ID. Check AWS_ACCESS_KEY_ID in .env file.`);
    } else if (error.name === 'SignatureDoesNotMatch') {
      throw new Error(`Invalid AWS Secret Access Key. Check AWS_SECRET_ACCESS_KEY in .env file.`);
    }
    
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error: any) {
    console.error('S3 Delete Error:', error.message);
    
    // Don't throw error if file doesn't exist (idempotent operation)
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      console.warn(`File ${key} not found in S3, skipping deletion.`);
      return;
    }
    
    throw new Error(`Failed to delete from S3: ${error.message}`);
  }
}

/**
 * Generate S3 key for post image
 */
export function generateImageKey(userId: number, postId: number, size: string = 'original'): string {
  const timestamp = Date.now();
  return `posts/${userId}/${postId}_${size}_${timestamp}.jpg`;
}

export { s3Client, BUCKET_NAME, CDN_URL };

