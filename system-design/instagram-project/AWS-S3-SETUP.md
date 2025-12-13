# AWS S3 Setup Guide (Hindi)

## Overview

Ye guide aapko AWS S3 configuration aur image upload setup karne mein help karega.

---

## Quick Start

### 1. AWS Account Setup

1. **AWS Account banaein** (agar nahi hai): https://aws.amazon.com/
2. **S3 Console** mein jayein: https://console.aws.amazon.com/s3/
3. **Bucket create karein:**
   - Bucket name: `instagram-photos` (ya koi bhi unique name)
   - Region: `us-east-1` (ya apna preferred region)
   - Public access: Enable karein (images publicly accessible hone ke liye)

### 2. AWS Credentials Generate Karein

1. **IAM Console** mein jayein: https://console.aws.amazon.com/iam/
2. **Users** → **Create User**
3. **User name** enter karein (e.g., `instagram-s3-user`)
4. **Attach policies directly** → **AmazonS3FullAccess** select karein
5. **Create user** click karein
6. **Access keys** tab mein jayein
7. **Create access key** → **Application running outside AWS** select karein
8. **Access Key ID** aur **Secret Access Key** copy karein (ye sirf ek baar dikhayi deti hai!)

### 3. Environment Variables Setup

`.env` file mein ye variables add/update karein:

```env
# AWS S3 Configuration
USE_S3=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
S3_BUCKET_NAME=instagram-photos
S3_CDN_URL=  # Optional: CDN URL agar use kar rahe ho
```

**Important:**
- `USE_S3=true` zaroor set karein
- `AWS_REGION` wahi hona chahiye jahan bucket create kiya hai
- `S3_BUCKET_NAME` exactly wahi hona chahiye jo bucket ka name hai

---

## Configuration Check

### Step 1: AWS Config Verify Karein

```bash
npm run check-aws
```

Ye script check karega:
- ✅ Environment variables set hain ya nahi
- ✅ AWS credentials valid hain ya nahi
- ✅ Bucket exists aur accessible hai ya nahi

**Expected Output:**
```
🔍 AWS Configuration Check kar rahe hain...

📋 Environment Variables Check:
   USE_S3: ✅ true
   AWS_REGION: ✅ us-east-1
   AWS_ACCESS_KEY_ID: ✅ Set (hidden)
   AWS_SECRET_ACCESS_KEY: ✅ Set (hidden)
   S3_BUCKET_NAME: ✅ instagram-photos

✅ S3 enabled hai aur credentials present hain.

🌐 AWS Connection Test kar rahe hain...
   Testing credentials...
   ✅ AWS credentials valid hain!
   📦 Total buckets: 1
   Available buckets:
      - instagram-photos

   Checking bucket: instagram-photos...
   ✅ Bucket "instagram-photos" exists aur accessible hai!

✅ AWS Configuration successfully verified!
🚀 Ab aap S3 upload use kar sakte hain.
```

### Step 2: S3 Upload Test Karein

```bash
npm run test-s3
```

Ye script ek test image upload karke verify karega ki S3 upload properly kaam kar raha hai.

**Expected Output:**
```
🧪 S3 Upload Test kar rahe hain...

✅ S3 configuration verified.

📤 Test image upload kar rahe hain...
   Key: posts/999/999_test_1234567890.jpg
   Bucket: instagram-photos

✅ Upload successful!
   URL: https://instagram-photos.s3.us-east-1.amazonaws.com/posts/999/999_test_1234567890.jpg
   Key: posts/999/999_test_1234567890.jpg

🔗 Testing URL accessibility...
✅ Image URL accessible hai!
   Status: 200
   Content-Type: image/png

🎉 S3 Upload test successful!

💡 Ab aap post create karke actual images upload kar sakte hain.
```

---

## Common Issues & Solutions

### Issue 1: "NoSuchBucket" Error

**Problem:** Bucket exist nahi karta.

**Solution:**
```bash
# AWS CLI se bucket create karein
aws s3 mb s3://instagram-photos --region us-east-1

# Ya AWS Console se manually create karein
```

### Issue 2: "AccessDenied" Error

**Problem:** Bucket permissions issue.

**Solution:**
1. IAM user ko `AmazonS3FullAccess` policy attach karein
2. Bucket policy check karein - public read access enable hona chahiye

### Issue 3: "InvalidAccessKeyId" Error

**Problem:** AWS_ACCESS_KEY_ID galat hai.

**Solution:**
- `.env` file mein correct `AWS_ACCESS_KEY_ID` set karein
- IAM Console se verify karein ki key active hai

### Issue 4: "SignatureDoesNotMatch" Error

**Problem:** AWS_SECRET_ACCESS_KEY galat hai.

**Solution:**
- `.env` file mein correct `AWS_SECRET_ACCESS_KEY` set karein
- Agar key lost ho gayi hai, to nayi key generate karein

### Issue 5: "USE_S3=false" ya Local Storage Use Ho Raha Hai

**Problem:** S3 enabled nahi hai.

**Solution:**
- `.env` file mein `USE_S3=true` set karein
- Server restart karein

---

## Bucket Policy (Public Read Access)

Agar images publicly accessible chahiye, to bucket policy mein ye add karein:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::instagram-photos/*"
    }
  ]
}
```

**Steps:**
1. S3 Console → Bucket → **Permissions** tab
2. **Bucket policy** → **Edit**
3. Above policy paste karein (bucket name update karein)
4. **Save changes**

---

## Production Best Practices

### 1. IAM User Permissions

Production mein **least privilege** principle follow karein:
- S3FullAccess ki jagah specific bucket ke liye custom policy use karein
- Only required actions allow karein (PutObject, GetObject, DeleteObject)

### 2. CDN Setup (Optional)

CloudFront CDN use karein better performance ke liye:
1. CloudFront distribution create karein
2. S3 bucket ko origin banayein
3. `.env` mein `S3_CDN_URL` set karein

### 3. Environment Variables Security

- `.env` file ko `.gitignore` mein add karein (already added)
- Production mein environment variables directly set karein (not in files)
- AWS Secrets Manager use karein sensitive data ke liye

### 4. Bucket Versioning

Production bucket mein versioning enable karein:
- S3 Console → Bucket → **Properties** → **Versioning** → **Enable**

---

## Testing

### Manual Test

1. **Server start karein:**
   ```bash
   npm run dev
   ```

2. **Post create karein** (Swagger UI se):
   - http://localhost:3000/api-docs
   - `/api/posts` POST endpoint
   - Image upload karein
   - Response mein S3 URL check karein

3. **Image URL verify karein:**
   - Response mein mili URL browser mein open karein
   - Image properly load honi chahiye

### Automated Test

```bash
# AWS config check
npm run check-aws

# S3 upload test
npm run test-s3
```

---

## Code Structure

### S3 Configuration
- **File:** `src/config/s3.ts`
- **Functions:**
  - `uploadToS3()` - File upload karta hai
  - `deleteFromS3()` - File delete karta hai
  - `generateImageKey()` - Unique key generate karta hai

### Storage Service
- **File:** `src/services/storageService.ts`
- **Class:** `StorageService`
- **Methods:**
  - `uploadImages()` - Multiple sizes upload karta hai (original, thumbnail, medium, large)
  - `deleteImages()` - All sizes delete karta hai

### Usage in Post Service
- **File:** `src/services/postService.ts`
- Post create hote hi automatically images S3 mein upload ho jati hain
- Post delete hote hi images S3 se delete ho jati hain

---

## Cost Estimation

### S3 Pricing (us-east-1)

- **Storage:** $0.023 per GB/month (first 50 TB)
- **PUT requests:** $0.005 per 1,000 requests
- **GET requests:** $0.0004 per 1,000 requests

**Example:**
- 10,000 images (average 2MB each) = 20 GB
- Monthly storage cost: ~$0.46
- 10,000 uploads/month: ~$0.05
- 100,000 views/month: ~$0.04
- **Total: ~$0.55/month**

---

## Support

Agar koi issue aaye:
1. `npm run check-aws` se configuration verify karein
2. AWS Console mein bucket aur IAM user check karein
3. Error messages carefully read karein
4. `.env` file mein variables double-check karein

---

## Summary

✅ **Setup Steps:**
1. AWS account aur bucket create karein
2. IAM user create karke access keys generate karein
3. `.env` file mein credentials set karein
4. `npm run check-aws` se verify karein
5. `npm run test-s3` se upload test karein
6. Server start karke actual post create karein

🎉 **Ab aapka S3 upload setup ready hai!**

