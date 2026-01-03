# AWS S3 Complete Guide
## Storage Classes, Lifecycle Policies, Versioning & Security

---

## 📚 Table of Contents
1. [S3 Storage Classes](#1-s3-storage-classes)
2. [S3 Lifecycle Policies](#2-s3-lifecycle-policies)
3. [S3 Versioning](#3-s3-versioning)
4. [S3 Security](#4-s3-security)

---

## 1. S3 Storage Classes

### ✅ Concept Explanation

**Storage Classes** = Different storage options jo cost aur performance ke basis par choose kar sakte hain. Har storage class ka apna use case hai.

### 📊 Storage Classes Overview

| Storage Class | Use Case | Availability | Durability | Cost | Retrieval Time |
|--------------|----------|--------------|------------|------|----------------|
| **Standard** | Frequently accessed data | 99.99% | 99.999999999% | High | Instant |
| **Standard-IA** | Infrequently accessed | 99.9% | 99.999999999% | Medium | Instant |
| **One Zone-IA** | Infrequently accessed, single AZ | 99.5% | 99.999999999% | Low | Instant |
| **Glacier Instant Retrieval** | Archive with instant access | 99.9% | 99.999999999% | Low | Instant |
| **Glacier Flexible Retrieval** | Archive (rarely accessed) | 99.99% | 99.999999999% | Very Low | 1-5 min |
| **Glacier Deep Archive** | Long-term archive | 99.99% | 99.999999999% | Lowest | 12 hours |
| **Intelligent-Tiering** | Auto-optimize cost | 99.9% | 99.999999999% | Variable | Instant |

---

### 🎯 1.1 Standard Storage Class

**Kya Hai:**
- Default storage class
- Frequently accessed data ke liye
- Highest performance, highest cost

**Use Cases:**
- Active website content
- Mobile app data
- Real-time analytics
- Frequently accessed files

**Features:**
- ✅ 99.99% availability
- ✅ Instant retrieval
- ✅ No retrieval fees
- ✅ Designed for 99.999999999% durability

**Cost Example:**
- First 50 TB: $0.023 per GB/month
- Next 450 TB: $0.022 per GB/month

**When to Use:**
- Data jo regularly access hota hai
- Performance critical applications
- Real-time data processing

---

### 🎯 1.2 Standard-IA (Infrequent Access)

**Kya Hai:**
- Infrequently accessed data ke liye
- Lower cost than Standard
- Retrieval fee lagta hai

**Use Cases:**
- Backup files
- Disaster recovery
- Long-term storage
- Data jo rarely access hota hai

**Features:**
- ✅ 99.9% availability
- ✅ Instant retrieval
- ⚠️ Retrieval fee: $0.01 per GB
- ✅ Minimum storage duration: 30 days
- ✅ Minimum object size: 128 KB

**Cost Example:**
- Storage: $0.0125 per GB/month
- Retrieval: $0.01 per GB

**When to Use:**
- Data jo monthly ya quarterly access hota hai
- Backup aur disaster recovery
- Cost optimization ke liye

---

### 🎯 1.3 One Zone-IA

**Kya Hai:**
- Standard-IA se bhi sasta
- Single Availability Zone mein store hota hai
- Lower availability (99.5%)

**Use Cases:**
- Secondary backup copies
- Recreatable data
- Data jo easily replaceable hai

**Features:**
- ✅ 99.5% availability (single AZ)
- ✅ Instant retrieval
- ⚠️ Retrieval fee: $0.01 per GB
- ⚠️ Data loss risk (single AZ)
- ✅ Minimum storage duration: 30 days

**Cost Example:**
- Storage: $0.01 per GB/month
- Retrieval: $0.01 per GB

**When to Use:**
- Data jo recreate kar sakte hain
- Secondary backups
- Cost-sensitive applications

---

### 🎯 1.4 Glacier Instant Retrieval

**Kya Hai:**
- Archive storage with instant access
- Glacier se sasta, Standard se mehnga
- Millisecond retrieval

**Use Cases:**
- Archive data jo occasionally access hota hai
- Medical images
- News media assets
- Compliance data

**Features:**
- ✅ 99.9% availability
- ✅ Instant retrieval (milliseconds)
- ✅ No retrieval fees
- ✅ Minimum storage duration: 90 days
- ✅ Minimum object size: 128 KB

**Cost Example:**
- Storage: $0.004 per GB/month
- No retrieval fees

**When to Use:**
- Archive data jo rarely access hota hai
- Long-term storage with instant access
- Cost optimization

---

### 🎯 1.5 Glacier Flexible Retrieval

**Kya Hai:**
- Archive storage with flexible retrieval options
- 3 retrieval options: Expedited, Standard, Bulk

**Use Cases:**
- Long-term backups
- Disaster recovery
- Compliance archives
- Data jo rarely access hota hai

**Features:**
- ✅ 99.99% availability
- ✅ 3 retrieval options:
  - **Expedited**: 1-5 minutes ($0.03/GB)
  - **Standard**: 3-5 hours ($0.01/GB)
  - **Bulk**: 5-12 hours ($0.0025/GB)
- ✅ Minimum storage duration: 90 days

**Cost Example:**
- Storage: $0.0036 per GB/month
- Retrieval: Based on option chosen

**When to Use:**
- Long-term archives
- Data jo rarely access hota hai
- Cost-effective long-term storage

---

### 🎯 1.6 Glacier Deep Archive

**Kya Hai:**
- Lowest cost storage option
- Longest retrieval time (12 hours)
- Long-term archive ke liye

**Use Cases:**
- Compliance archives (7+ years)
- Long-term backups
- Digital preservation
- Data jo almost never access hota hai

**Features:**
- ✅ 99.99% availability
- ✅ Retrieval time: 12 hours
- ✅ Lowest cost
- ✅ Minimum storage duration: 180 days

**Cost Example:**
- Storage: $0.00099 per GB/month
- Retrieval: $0.02 per GB

**When to Use:**
- Compliance requirements (7+ years)
- Data jo almost never access hota hai
- Maximum cost savings

---

### 🎯 1.7 Intelligent-Tiering

**Kya Hai:**
- Automatic cost optimization
- Data ko automatically move karta hai based on access patterns
- No retrieval fees

**Use Cases:**
- Unknown access patterns
- Data jo variable access hota hai
- Automatic optimization chahiye

**Features:**
- ✅ Automatic optimization
- ✅ No retrieval fees
- ✅ Monitoring fee: $0.0025 per 1,000 objects
- ✅ Moves data between tiers automatically
- ✅ 2 tiers: Frequent Access, Infrequent Access

**Cost Example:**
- Frequent Access: $0.023 per GB/month
- Infrequent Access: $0.0125 per GB/month
- Monitoring: $0.0025 per 1,000 objects

**When to Use:**
- Unknown access patterns
- Automatic cost optimization chahiye
- Variable data access

---

### 📝 Storage Class Selection Guide

```
Frequently Accessed?
├─ Yes → Standard
└─ No → How often accessed?
    ├─ Monthly/Quarterly → Standard-IA
    ├─ Rarely (can recreate) → One Zone-IA
    ├─ Rarely (instant access needed) → Glacier Instant Retrieval
    ├─ Rarely (can wait hours) → Glacier Flexible Retrieval
    └─ Almost Never → Glacier Deep Archive

Unknown Pattern? → Intelligent-Tiering
```

---

## 2. S3 Lifecycle Policies

### ✅ Concept Explanation

**Lifecycle Policies** = Automatic rules jo data ko automatically move/delete karte hain based on age, access patterns, etc. Cost optimization ke liye use hota hai.

### 🎯 Why Use Lifecycle Policies?

1. **Cost Optimization** - Old data ko cheaper storage mein move karein
2. **Automation** - Manual work nahi karna padega
3. **Compliance** - Automatic data retention/deletion
4. **Efficiency** - Set and forget approach

---

### 📋 2.1 Lifecycle Policy Actions

#### Transition Actions (Move Data)
- **Transition to Standard-IA**: After X days
- **Transition to One Zone-IA**: After X days
- **Transition to Glacier Instant Retrieval**: After X days
- **Transition to Glacier Flexible Retrieval**: After X days
- **Transition to Glacier Deep Archive**: After X days

#### Expiration Actions (Delete Data)
- **Expire current versions**: Delete after X days
- **Expire incomplete multipart uploads**: Delete incomplete uploads
- **Expire delete markers**: Clean up delete markers

---

### 🎯 2.2 Common Lifecycle Policy Examples

#### Example 1: Cost Optimization Policy

**Scenario:** Log files jo 30 days baad rarely access hote hain

```json
{
  "Rules": [
    {
      "Id": "LogFilesLifecycle",
      "Status": "Enabled",
      "Prefix": "logs/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555  // 7 years
      }
    }
  ]
}
```

**Flow:**
1. Day 0-30: Standard (frequently accessed)
2. Day 30-90: Standard-IA (less frequently accessed)
3. Day 90-365: Glacier (rarely accessed)
4. Day 365-2555: Deep Archive (almost never accessed)
5. Day 2555+: Deleted

---

#### Example 2: Backup Retention Policy

**Scenario:** Daily backups, 30 days current, 1 year archive

```json
{
  "Rules": [
    {
      "Id": "BackupLifecycle",
      "Status": "Enabled",
      "Prefix": "backups/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365  // Keep for 1 year
      }
    }
  ]
}
```

**Flow:**
1. Day 0-30: Standard (active backups)
2. Day 30-365: Glacier (archived backups)
3. Day 365+: Deleted

---

#### Example 3: Media Files Policy

**Scenario:** User uploads, 90 days active, then archive

```json
{
  "Rules": [
    {
      "Id": "MediaFilesLifecycle",
      "Status": "Enabled",
      "Prefix": "media/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER_INSTANT_RETRIEVAL"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 1825  // 5 years
      }
    }
  ]
}
```

---

#### Example 4: Temporary Files Cleanup

**Scenario:** Temporary uploads cleanup

```json
{
  "Rules": [
    {
      "Id": "TempFilesCleanup",
      "Status": "Enabled",
      "Prefix": "temp/",
      "Expiration": {
        "Days": 7  // Delete after 7 days
      },
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 1  // Delete incomplete uploads after 1 day
      }
    }
  ]
}
```

---

### 🎯 2.3 Lifecycle Policy Best Practices

#### ✅ Do's:
1. **Start Conservative** - Pehle test karein, phir expand karein
2. **Monitor Costs** - Policy apply hone ke baad costs check karein
3. **Use Prefixes** - Specific folders ke liye policies
4. **Test First** - Test bucket mein pehle test karein
5. **Document Policies** - Har policy ka reason document karein

#### ❌ Don'ts:
1. **Don't Delete Too Early** - Important data ko jaldi delete mat karein
2. **Don't Ignore Minimum Duration** - Storage class minimum duration check karein
3. **Don't Set and Forget** - Regularly review karein
4. **Don't Over-Complicate** - Simple policies better hain

---

### 📊 2.4 Lifecycle Policy Cost Savings Example

**Scenario:** 1 TB log files, 1 year retention

**Without Lifecycle Policy:**
- Standard: 1 TB × $0.023 × 12 = **$276/year**

**With Lifecycle Policy:**
- Standard (30 days): 1 TB × $0.023 × 1 = $23
- Standard-IA (60 days): 1 TB × $0.0125 × 2 = $25
- Glacier (300 days): 1 TB × $0.0036 × 10 = $36
- Deep Archive (remaining): 1 TB × $0.00099 × remaining = minimal
- **Total: ~$84/year**

**Savings: $192/year (70% reduction)**

---

## 3. S3 Versioning

### ✅ Concept Explanation

**Versioning** = S3 bucket mein multiple versions of same object store kar sakte hain. Accidentally delete ya overwrite hone par previous versions recover kar sakte hain.

### 🎯 Why Use Versioning?

1. **Data Protection** - Accidental deletion se bachne ke liye
2. **Rollback** - Previous versions restore kar sakte hain
3. **Compliance** - Audit trail maintain karne ke liye
4. **Recovery** - Data loss se recover karne ke liye

---

### 🎯 3.1 How Versioning Works

#### Without Versioning:
```
Object: photo.jpg
Version: (only current)
Delete: Permanent deletion
```

#### With Versioning:
```
Object: photo.jpg
Versions:
  - photo.jpg (version: null) - Current
  - photo.jpg (version: abc123) - Previous
  - photo.jpg (version: xyz789) - Older
Delete: Creates delete marker, versions preserved
```

---

### 🎯 3.2 Versioning States

#### 1. Unversioned (Default)
- No versioning enabled
- Only current version exists
- Delete = permanent deletion

#### 2. Versioning Enabled
- Multiple versions stored
- Each version has unique ID
- Delete creates delete marker
- Previous versions recoverable

#### 3. Versioning Suspended
- New versions not created
- Existing versions preserved
- Can re-enable later

---

### 🎯 3.3 Versioning Use Cases

#### Use Case 1: Accidental Deletion Protection

**Scenario:** Developer accidentally deletes important file

**Without Versioning:**
- ❌ File permanently lost
- ❌ Need backup restore

**With Versioning:**
- ✅ Delete marker created
- ✅ Previous version recoverable
- ✅ Restore in seconds

---

#### Use Case 2: Rollback to Previous Version

**Scenario:** New file upload corrupts data

**Without Versioning:**
- ❌ Corrupt version is only version
- ❌ Need external backup

**With Versioning:**
- ✅ Previous version available
- ✅ Rollback to working version
- ✅ No data loss

---

#### Use Case 3: Compliance & Audit Trail

**Scenario:** Need to track all file changes

**With Versioning:**
- ✅ All versions stored
- ✅ Complete audit trail
- ✅ Compliance requirements met

---

### 🎯 3.4 Versioning Best Practices

#### ✅ Do's:
1. **Enable for Critical Data** - Important buckets mein enable karein
2. **Use Lifecycle Policies** - Old versions ko automatically delete karein
3. **Monitor Costs** - Multiple versions cost badha sakte hain
4. **Use MFA Delete** - Extra security ke liye MFA enable karein
5. **Regular Cleanup** - Unnecessary versions delete karein

#### ❌ Don'ts:
1. **Don't Enable Everywhere** - Only where needed
2. **Don't Ignore Costs** - Multiple versions = more storage cost
3. **Don't Forget Lifecycle** - Old versions automatically cleanup karein
4. **Don't Disable Abruptly** - Suspended state use karein

---

### 📊 3.5 Versioning Cost Impact

**Example:** 100 GB file, 10 versions

**Storage Cost:**
- Without Versioning: 100 GB × $0.023 = $2.30/month
- With Versioning: 100 GB × 10 × $0.023 = $23/month

**Solution:** Use lifecycle policy to delete old versions
- Keep current + 2 recent versions
- Delete versions older than 90 days

---

### 🎯 3.6 MFA Delete

**MFA Delete** = Multi-Factor Authentication required for permanent deletion

**Benefits:**
- Extra security layer
- Prevents accidental permanent deletion
- Compliance requirement

**How It Works:**
- Delete requires MFA token
- Only bucket owner can enable
- Cannot disable once enabled (without MFA)

---

## 4. S3 Security

### ✅ Concept Explanation

**S3 Security** = Multiple layers of security jo data ko protect karte hain. Defense in depth approach follow karte hain.

---

### 🔐 4.1 Security Layers

#### Layer 1: Access Control
- IAM Policies
- Bucket Policies
- ACLs (Access Control Lists)

#### Layer 2: Encryption
- Encryption at Rest
- Encryption in Transit

#### Layer 3: Network Security
- VPC Endpoints
- Public Access Block

#### Layer 4: Monitoring
- CloudTrail
- CloudWatch
- Access Logging

---

### 🎯 4.2 Access Control Methods

#### 1. IAM Policies (Identity-Based)

**Kya Hai:** User/role ke liye permissions define karte hain

**Example Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

**Use Cases:**
- User-specific access
- Role-based access
- Application access

---

#### 2. Bucket Policies (Resource-Based)

**Kya Hai:** Bucket level par permissions define karte hain

**Example Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/public/*"
    },
    {
      "Sid": "DenyPublicWrite",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-bucket/public/*"
    }
  ]
}
```

**Use Cases:**
- Public read access
- Cross-account access
- IP-based restrictions

---

#### 3. ACLs (Access Control Lists)

**Kya Hai:** Legacy access control method

**Use Cases:**
- Simple permissions
- Object-level permissions
- Legacy compatibility

**Note:** IAM policies preferred method hai

---

### 🔐 4.3 Encryption

#### Encryption at Rest

**Options:**

1. **SSE-S3 (Server-Side Encryption with S3)**
   - AWS managed keys
   - Default encryption
   - No additional cost
   - Use Case: General purpose

2. **SSE-KMS (Server-Side Encryption with KMS)**
   - AWS KMS managed keys
   - Audit trail
   - Additional cost
   - Use Case: Compliance requirements

3. **SSE-C (Server-Side Encryption with Customer Keys)**
   - Customer provided keys
   - Full control
   - Complex management
   - Use Case: Maximum control

4. **Client-Side Encryption**
   - Encrypt before upload
   - Customer manages keys
   - Maximum security
   - Use Case: Highly sensitive data

---

#### Encryption in Transit

**Methods:**
- HTTPS/TLS for API calls
- SSL/TLS for data transfer
- VPC endpoints for private access

**Best Practice:** Always use HTTPS

---

### 🛡️ 4.4 Public Access Block

**Kya Hai:** Bucket ko public access se protect karta hai

**Settings:**
1. **Block Public ACLs** - Public ACLs block
2. **Ignore Public ACLs** - Public ACLs ignore
3. **Block Public Bucket Policies** - Public policies block
4. **Restrict Public Bucket Policies** - Public policies restrict

**Best Practice:** All settings enable karein unless public access needed

---

### 🔒 4.5 VPC Endpoints

**Kya Hai:** Private connection between VPC aur S3

**Benefits:**
- No internet gateway needed
- Private communication
- Lower latency
- Better security

**Types:**
1. **Gateway Endpoint** - Free, route table updates
2. **Interface Endpoint** - Paid, ENI based

---

### 📊 4.6 Monitoring & Logging

#### CloudTrail
- API calls log
- Who did what, when
- Audit trail
- Compliance

#### CloudWatch
- Metrics monitoring
- Alarms
- Performance tracking

#### Access Logging
- Bucket access logs
- Request tracking
- Security analysis

---

### 🎯 4.7 Security Best Practices

#### ✅ Do's:
1. **Enable Encryption** - Always encrypt at rest
2. **Use IAM Policies** - Principle of least privilege
3. **Block Public Access** - Unless specifically needed
4. **Enable Versioning** - For critical data
5. **Enable MFA Delete** - Extra protection
6. **Use VPC Endpoints** - Private access
7. **Enable Logging** - CloudTrail + Access Logs
8. **Regular Audits** - Review permissions regularly
9. **Use Bucket Policies** - Resource-level control
10. **Rotate Keys** - KMS keys rotate karein

#### ❌ Don'ts:
1. **Don't Use Root Account** - IAM users/roles use karein
2. **Don't Make Public** - Unless absolutely necessary
3. **Don't Share Access Keys** - Use IAM roles
4. **Don't Ignore Logs** - Regular monitoring
5. **Don't Skip Encryption** - Always encrypt
6. **Don't Use Weak Policies** - Principle of least privilege
7. **Don't Forget MFA** - Enable MFA for admin accounts
8. **Don't Skip Updates** - Security patches apply karein

---

### 🚨 4.8 Common Security Mistakes

#### Mistake 1: Public Bucket
**Problem:** Bucket publicly accessible
**Solution:** Public access block enable karein

#### Mistake 2: Weak IAM Policies
**Problem:** Overly permissive policies
**Solution:** Principle of least privilege follow karein

#### Mistake 3: No Encryption
**Problem:** Data unencrypted
**Solution:** Default encryption enable karein

#### Mistake 4: Exposed Access Keys
**Problem:** Access keys in code
**Solution:** IAM roles use karein

#### Mistake 5: No Monitoring
**Problem:** No visibility into access
**Solution:** CloudTrail + Access Logs enable karein

---

### 📋 4.9 Security Checklist

- [ ] **Encryption Enabled** - At rest encryption
- [ ] **HTTPS Only** - In transit encryption
- [ ] **Public Access Blocked** - Unless needed
- [ ] **IAM Policies** - Least privilege
- [ ] **Bucket Policies** - Resource-level control
- [ ] **Versioning Enabled** - For critical data
- [ ] **MFA Delete** - Extra protection
- [ ] **CloudTrail Enabled** - Audit trail
- [ ] **Access Logging** - Bucket access logs
- [ ] **VPC Endpoints** - Private access (if needed)
- [ ] **Regular Audits** - Permission reviews
- [ ] **Key Rotation** - KMS keys rotate

---

## 🎯 Quick Reference Guide

### Storage Class Selection
```
Frequent Access → Standard
Monthly Access → Standard-IA
Rarely Access → Glacier
Never Access → Deep Archive
Unknown → Intelligent-Tiering
```

### Lifecycle Policy Flow
```
Standard → Standard-IA → Glacier → Deep Archive → Delete
```

### Security Layers
```
IAM Policies → Bucket Policies → Encryption → Monitoring
```

---

## 📚 Summary

### Key Takeaways:

1. **Storage Classes** - Cost aur performance ke basis par choose karein
2. **Lifecycle Policies** - Automatic cost optimization
3. **Versioning** - Data protection aur recovery
4. **Security** - Multiple layers of protection

### Best Practices:

- ✅ Right storage class choose karein
- ✅ Lifecycle policies use karein
- ✅ Versioning enable karein (where needed)
- ✅ Security best practices follow karein
- ✅ Regular monitoring aur audits

---

**Remember:** S3 configuration ek iterative process hai. Start simple, monitor, aur optimize karte rahein! 🚀

