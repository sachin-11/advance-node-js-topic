# AWS S3 Quick Reference
## Cheat Sheet for Interviews & Daily Use

---

## 📊 Storage Classes Quick Comparison

| Class | Cost | Access | Use When |
|------|------|--------|----------|
| **Standard** | High | Instant | Frequently accessed |
| **Standard-IA** | Medium | Instant | Monthly/Quarterly access |
| **One Zone-IA** | Low | Instant | Recreatable data |
| **Glacier Instant** | Low | Instant | Archive, instant access |
| **Glacier Flexible** | Very Low | 1-12 hours | Long-term archive |
| **Glacier Deep** | Lowest | 12 hours | Compliance (7+ years) |
| **Intelligent** | Variable | Instant | Unknown patterns |

---

## 💰 Cost Comparison (per GB/month)

```
Standard:           $0.023
Standard-IA:        $0.0125
One Zone-IA:        $0.01
Glacier Instant:    $0.004
Glacier Flexible:   $0.0036
Deep Archive:       $0.00099
```

**Cost Savings:** Standard → Deep Archive = **95% savings**

---

## 🔄 Lifecycle Policy Flow

```
Day 0-30:    Standard (Active)
Day 30-90:   Standard-IA (Less Active)
Day 90-365:  Glacier (Archive)
Day 365+:    Deep Archive (Long-term)
Day X+:       Delete (Expiration)
```

---

## 🔐 Security Checklist

### Must Have:
- ✅ Encryption at Rest (SSE-S3/SSE-KMS)
- ✅ Encryption in Transit (HTTPS)
- ✅ Public Access Blocked
- ✅ IAM Policies (Least Privilege)
- ✅ CloudTrail Enabled
- ✅ Access Logging

### Good to Have:
- ✅ Versioning (Critical Data)
- ✅ MFA Delete
- ✅ VPC Endpoints
- ✅ Bucket Policies
- ✅ Key Rotation

---

## 📝 Common Use Cases

### Web Application
- **Storage:** Standard
- **Lifecycle:** Move to IA after 30 days
- **Versioning:** Enabled
- **Security:** Public read for static assets

### Backup System
- **Storage:** Standard → Glacier
- **Lifecycle:** Move to Glacier after 7 days
- **Versioning:** Enabled
- **Security:** Private, encrypted

### Log Files
- **Storage:** Standard → IA → Glacier → Deep Archive
- **Lifecycle:** 30/90/365 days transitions
- **Versioning:** Optional
- **Security:** Private, encrypted

### Media Files
- **Storage:** Standard → Glacier Instant
- **Lifecycle:** Move after 90 days
- **Versioning:** Enabled
- **Security:** CDN + S3

---

## 🎯 Interview Questions & Answers

### Q: Which storage class should I use for frequently accessed data?
**A:** Standard - Highest performance, instant access, designed for frequent access.

### Q: How to reduce S3 costs?
**A:** 
1. Use lifecycle policies to move old data
2. Choose right storage class
3. Delete unnecessary data
4. Use Intelligent-Tiering for unknown patterns

### Q: What is S3 versioning?
**A:** Multiple versions of same object store karna. Accidental deletion se protect karta hai.

### Q: How to secure S3 bucket?
**A:**
1. Enable encryption (at rest + in transit)
2. Block public access
3. Use IAM policies (least privilege)
4. Enable CloudTrail logging
5. Use VPC endpoints for private access

### Q: What is lifecycle policy?
**A:** Automatic rules jo data ko move/delete karte hain based on age. Cost optimization ke liye.

### Q: Difference between Standard-IA and Glacier?
**A:**
- **Standard-IA:** Instant retrieval, retrieval fee, 99.9% availability
- **Glacier:** 1-12 hours retrieval, lower cost, 99.99% availability

### Q: When to use Intelligent-Tiering?
**A:** Unknown access patterns ke liye. Automatically optimize karta hai.

### Q: What is MFA Delete?
**A:** Multi-factor authentication required for permanent deletion. Extra security layer.

---

## 🚨 Common Mistakes

1. ❌ **Public Bucket** - Always block unless needed
2. ❌ **No Encryption** - Always enable encryption
3. ❌ **Wrong Storage Class** - Choose based on access pattern
4. ❌ **No Lifecycle Policy** - Old data expensive rehta hai
5. ❌ **No Versioning** - Critical data ke liye enable karein
6. ❌ **Weak IAM Policies** - Overly permissive policies
7. ❌ **No Monitoring** - CloudTrail enable karein

---

## 📋 Quick Commands (AWS CLI)

```bash
# Create bucket
aws s3 mb s3://my-bucket

# Upload file
aws s3 cp file.txt s3://my-bucket/

# Download file
aws s3 cp s3://my-bucket/file.txt ./

# Sync directory
aws s3 sync ./local-folder s3://my-bucket/folder/

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket my-bucket \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket my-bucket \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# Block public access
aws s3api put-public-access-block \
  --bucket my-bucket \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## 🎯 Decision Tree

```
Need to store data?
├─ Frequently accessed?
│  └─ Yes → Standard
│  └─ No → How often?
│     ├─ Monthly → Standard-IA
│     ├─ Rarely (instant needed) → Glacier Instant
│     ├─ Rarely (can wait) → Glacier Flexible
│     └─ Almost never → Deep Archive
└─ Unknown pattern?
   └─ Yes → Intelligent-Tiering
```

---

## 💡 Pro Tips

1. **Start with Standard** - Optimize later with lifecycle policies
2. **Use Lifecycle Policies** - Automatic cost optimization
3. **Enable Versioning** - For critical data only (costs increase)
4. **Monitor Costs** - Use Cost Explorer regularly
5. **Test First** - Test policies in test bucket
6. **Document Everything** - Policies ka reason document karein
7. **Regular Audits** - Security aur costs review karein

---

**Quick Tip:** Production mein pehle Standard use karein, phir lifecycle policies se optimize karein! 🚀

