import dotenv from 'dotenv';
import { S3Client, ListBucketsCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

dotenv.config();

/**
 * AWS Configuration Checker
 * Ye script check karti hai ki AWS S3 properly configured hai ya nahi
 */
async function checkAWSConfig() {
  console.log('🔍 AWS Configuration Check kar rahe hain...\n');

  // 1. Check Environment Variables
  console.log('📋 Environment Variables Check:');
  const requiredVars = {
    'USE_S3': process.env.USE_S3,
    'AWS_REGION': process.env.AWS_REGION,
    'AWS_ACCESS_KEY_ID': process.env.AWS_ACCESS_KEY_ID,
    'AWS_SECRET_ACCESS_KEY': process.env.AWS_SECRET_ACCESS_KEY,
    'S3_BUCKET_NAME': process.env.S3_BUCKET_NAME,
  };

  let allVarsPresent = true;
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      // Hide sensitive values
      const displayValue = key.includes('SECRET') || key.includes('KEY') 
        ? '✅ Set (hidden)' 
        : `✅ ${value}`;
      console.log(`   ${key}: ${displayValue}`);
    } else {
      console.log(`   ${key}: ❌ Missing`);
      allVarsPresent = false;
    }
  }

  console.log('');

  // 2. Check if S3 is enabled
  const USE_S3 = process.env.USE_S3 === 'true';
  const hasCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (!USE_S3) {
    console.log('⚠️  USE_S3=false hai. S3 use nahi hoga.');
    console.log('   Agar S3 use karna hai, to .env mein USE_S3=true set karein.\n');
    return;
  }

  if (!hasCredentials) {
    console.log('❌ AWS credentials missing hain!');
    console.log('   AWS_ACCESS_KEY_ID aur AWS_SECRET_ACCESS_KEY set karein.\n');
    return;
  }

  console.log('✅ S3 enabled hai aur credentials present hain.\n');

  // 3. Test AWS Connection
  console.log('🌐 AWS Connection Test kar rahe hain...');
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Test 1: List buckets (to verify credentials)
    console.log('   Testing credentials...');
    const listCommand = new ListBucketsCommand({});
    const response = await s3Client.send(listCommand);
    
    console.log(`   ✅ AWS credentials valid hain!`);
    console.log(`   📦 Total buckets: ${response.Buckets?.length || 0}`);
    
    if (response.Buckets && response.Buckets.length > 0) {
      console.log('   Available buckets:');
      response.Buckets.forEach(bucket => {
        console.log(`      - ${bucket.Name}`);
      });
    }

    // Test 2: Check if specified bucket exists
    const bucketName = process.env.S3_BUCKET_NAME || 'instagram-photos';
    console.log(`\n   Checking bucket: ${bucketName}...`);
    
    try {
      const headCommand = new HeadBucketCommand({ Bucket: bucketName });
      await s3Client.send(headCommand);
      console.log(`   ✅ Bucket "${bucketName}" exists aur accessible hai!`);
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log(`   ⚠️  Bucket "${bucketName}" exist nahi karta.`);
        console.log(`   💡 Bucket create karein AWS Console se ya is command se:`);
        console.log(`      aws s3 mb s3://${bucketName} --region ${process.env.AWS_REGION || 'us-east-1'}`);
      } else if (error.name === 'Forbidden' || error.$metadata?.httpStatusCode === 403) {
        console.log(`   ⚠️  Bucket "${bucketName}" access nahi kar sakte (permission issue).`);
        console.log(`   💡 Bucket permissions check karein.`);
      } else {
        console.log(`   ❌ Error checking bucket: ${error.message}`);
      }
    }

    console.log('\n✅ AWS Configuration successfully verified!');
    console.log('🚀 Ab aap S3 upload use kar sakte hain.\n');

  } catch (error: any) {
    console.log(`\n❌ AWS Connection failed: ${error.message}`);
    
    if (error.name === 'InvalidAccessKeyId') {
      console.log('   💡 AWS_ACCESS_KEY_ID invalid hai. Check karein.');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('   💡 AWS_SECRET_ACCESS_KEY invalid hai. Check karein.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('   💡 Internet connection check karein.');
    } else {
      console.log('   💡 AWS credentials aur region check karein.');
    }
    console.log('');
  }
}

// Run the check
checkAWSConfig().catch(console.error);

