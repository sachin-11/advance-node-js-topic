import { S3Client, PutObjectCommand, DeleteObjectCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client with region
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'whatsapp-media';
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
    return response.LocationConstraint || 'us-east-1';
  } catch (error: any) {
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
    if (!BUCKET_NAME || BUCKET_NAME === 'whatsapp-media') {
      console.warn('⚠️  S3_BUCKET_NAME not set, using default. Make sure bucket exists.');
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const region = await getBucketRegion();
    const url = CDN_URL 
      ? `${CDN_URL}/${key}`
      : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error: any) {
    console.error('S3 Upload Error:', error.message);
    
    if (error.message.includes('endpoint') || error.message.includes('region')) {
      const actualRegion = await getBucketRegion();
      throw new Error(
        `Region mismatch! Bucket "${BUCKET_NAME}" is in region "${actualRegion}". ` +
        `Please update AWS_REGION in .env file to "${actualRegion}"`
      );
    }
    
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
    
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      console.warn(`File ${key} not found in S3, skipping deletion.`);
      return;
    }
    
    throw new Error(`Failed to delete from S3: ${error.message}`);
  }
}

/**
 * Generate S3 key for media file
 */
export function generateMediaKey(userId: number, messageId: number, type: string, extension: string = 'jpg'): string {
  const timestamp = Date.now();
  return `media/${userId}/${messageId}_${type}_${timestamp}.${extension}`;
}

export { s3Client, BUCKET_NAME, CDN_URL };
