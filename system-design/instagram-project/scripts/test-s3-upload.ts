import dotenv from 'dotenv';
import { uploadToS3, generateImageKey } from '../src/config/s3';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * S3 Upload Test Script
 * Ye script ek test image upload karke S3 functionality test karti hai
 */
async function testS3Upload() {
  console.log('🧪 S3 Upload Test kar rahe hain...\n');

  // Check if S3 is enabled
  const USE_S3 = process.env.USE_S3 === 'true';
  const hasCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (!USE_S3 || !hasCredentials) {
    console.log('❌ S3 enabled nahi hai!');
    console.log('   .env file mein ye set karein:');
    console.log('   USE_S3=true');
    console.log('   AWS_ACCESS_KEY_ID=your_key');
    console.log('   AWS_SECRET_ACCESS_KEY=your_secret');
    console.log('   AWS_REGION=us-east-1');
    console.log('   S3_BUCKET_NAME=your-bucket-name\n');
    return;
  }

  console.log('✅ S3 configuration verified.\n');

  // Create a test image buffer (1x1 pixel PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const testUserId = 999;
  const testPostId = 999;
  const testKey = generateImageKey(testUserId, testPostId, 'test');

  try {
    console.log(`📤 Test image upload kar rahe hain...`);
    console.log(`   Key: ${testKey}`);
    console.log(`   Bucket: ${process.env.S3_BUCKET_NAME || 'instagram-photos'}\n`);

    const result = await uploadToS3(testKey, testImageBuffer, 'image/png');

    console.log('✅ Upload successful!');
    console.log(`   URL: ${result.url}`);
    console.log(`   Key: ${result.key}\n`);

    // Test if URL is accessible
    console.log('🔗 Testing URL accessibility...');
    try {
      const response = await fetch(result.url);
      if (response.ok) {
        console.log('✅ Image URL accessible hai!');
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}\n`);
      } else {
        console.log(`⚠️  URL accessible nahi hai. Status: ${response.status}\n`);
      }
    } catch (error: any) {
      console.log(`⚠️  URL test failed: ${error.message}\n`);
    }

    console.log('🎉 S3 Upload test successful!\n');
    console.log('💡 Ab aap post create karke actual images upload kar sakte hain.\n');

  } catch (error: any) {
    console.log(`❌ Upload failed: ${error.message}\n`);
    
    if (error.message.includes('NoSuchBucket')) {
      console.log('💡 Bucket exist nahi karta. Pehle bucket create karein.');
    } else if (error.message.includes('AccessDenied')) {
      console.log('💡 Bucket permissions check karein.');
    } else if (error.message.includes('InvalidAccessKeyId')) {
      console.log('💡 AWS_ACCESS_KEY_ID check karein.');
    } else if (error.message.includes('SignatureDoesNotMatch')) {
      console.log('💡 AWS_SECRET_ACCESS_KEY check karein.');
    }
    
    console.log('');
  }
}

// Run the test
testS3Upload().catch(console.error);

