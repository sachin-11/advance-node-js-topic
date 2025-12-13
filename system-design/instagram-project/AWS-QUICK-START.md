# AWS S3 Quick Start (Hindi)

## 🚀 Tez Setup (5 Minutes)

### Step 1: .env File Mein Credentials Add Karein

`.env` file mein ye add/update karein:

```env
USE_S3=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=apna_access_key_id
AWS_SECRET_ACCESS_KEY=apna_secret_access_key
S3_BUCKET_NAME=instagram-photos
```

### Step 2: AWS Config Check Karein

```bash
cd instagram-project
npm run check-aws
```

Agar sab kuch sahi hai, to aapko ye dikhega:
```
✅ AWS Configuration successfully verified!
🚀 Ab aap S3 upload use kar sakte hain.
```

### Step 3: S3 Upload Test Karein

```bash
npm run test-s3
```

Agar test pass ho gaya, to:
```
🎉 S3 Upload test successful!
```

### Step 4: Server Start Karein

```bash
npm run dev
```

Ab jab bhi aap post create karenge, images automatically S3 mein upload ho jayengi! 🎉

---

## 📝 Important Notes

1. **Bucket Create Karna Zaroori Hai:**
   - AWS Console se bucket create karein
   - Ya AWS CLI se: `aws s3 mb s3://instagram-photos --region us-east-1`

2. **Public Access Enable Karein:**
   - Bucket → Permissions → Block public access → Disable
   - Bucket policy add karein (AWS-S3-SETUP.md dekhain)

3. **IAM User Permissions:**
   - IAM user ko `AmazonS3FullAccess` policy attach karein

---

## 🔧 Troubleshooting

### Problem: "NoSuchBucket" Error
**Solution:** Bucket create karein AWS Console se

### Problem: "AccessDenied" Error  
**Solution:** IAM user permissions check karein

### Problem: "InvalidAccessKeyId" Error
**Solution:** `.env` file mein correct `AWS_ACCESS_KEY_ID` set karein

### Problem: Images Local Storage Mein Upload Ho Rahi Hain
**Solution:** `.env` file mein `USE_S3=true` set karein aur server restart karein

---

## 📚 Detailed Guide

Complete setup guide ke liye `AWS-S3-SETUP.md` file dekhain.

---

## ✅ Checklist

- [ ] AWS account hai
- [ ] S3 bucket create ho gaya
- [ ] IAM user create ho gaya aur access keys generate kiye
- [ ] `.env` file mein sab variables set kiye
- [ ] `npm run check-aws` successfully run hua
- [ ] `npm run test-s3` successfully run hua
- [ ] Server start karke post create kiya aur S3 URL verify kiya

---

**Happy Coding! 🎉**

