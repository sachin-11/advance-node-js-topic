# AWS Infrastructure Components - Interview Guide

## 📚 Table of Contents
1. [EC2 Instance Types](#1-ec2-instance-types)
2. [Auto Scaling](#2-auto-scaling)
3. [Load Balancers (ALB, NLB, CLB)](#3-load-balancers-alb-nlb-clb)
4. [Security Groups](#4-security-groups)
5. [Interview Questions & Answers](#interview-questions--answers)

---

## 1. EC2 Instance Types

### What are EC2 Instances?

EC2 (Elastic Compute Cloud) instances virtual servers hain jo AWS cloud mein run hote hain. Har instance type different use cases ke liye optimize hota hai.

### Instance Families Explained

#### 1.1 General Purpose Instances (M5, M6i)

**Kya hai?**
- Balanced compute, memory, aur networking resources
- Most common use case ke liye best

**Specifications:**
```
m5.large:   2 vCPU,  8 GB RAM
m5.xlarge:  4 vCPU, 16 GB RAM
m5.2xlarge: 8 vCPU, 32 GB RAM
m5.4xlarge: 16 vCPU, 64 GB RAM
```

**Use Cases:**
- Web servers
- Application servers
- API servers
- Microservices
- Small to medium databases

**Interview Example:**
> "Agar aapko Uber ka API server banana hai jo 1000 requests/second handle kare, to aap m5.xlarge use karenge kyunki yeh balanced performance deta hai aur cost-effective hai."

#### 1.2 Compute Optimized Instances (C5, C6i)

**Kya hai?**
- High-performance processors
- CPU-intensive workloads ke liye optimize

**Specifications:**
```
c5.large:   2 vCPU,  4 GB RAM
c5.xlarge:  4 vCPU,  8 GB RAM
c5.2xlarge: 8 vCPU, 16 GB RAM
```

**Use Cases:**
- High-performance web servers
- Scientific modeling
- Batch processing
- Media transcoding
- Route optimization algorithms

**Interview Example:**
> "Uber mein route optimization CPU-intensive task hai. Isliye hum c5.xlarge use karte hain kyunki yeh fast processors provide karta hai."

#### 1.3 Memory Optimized Instances (R5, R6i)

**Kya hai?**
- High memory-to-CPU ratio
- In-memory databases aur caching ke liye perfect

**Specifications:**
```
r5.large:   2 vCPU, 16 GB RAM
r5.xlarge:  4 vCPU, 32 GB RAM
r5.2xlarge: 8 vCPU, 64 GB RAM
r5.4xlarge: 16 vCPU, 128 GB RAM
```

**Use Cases:**
- In-memory databases (Redis, Memcached)
- Real-time big data analytics
- High-performance databases
- Data warehousing

**Interview Example:**
> "Redis cache ke liye r5.xlarge use karte hain kyunki Redis memory-intensive hai. Yeh instances high RAM provide karte hain."

#### 1.4 Burstable Performance Instances (T3, T4g)

**Kya hai?**
- Baseline performance with ability to burst
- CPU credits system
- Cost-effective for variable workloads

**Specifications:**
```
t3.micro:   2 vCPU,  1 GB RAM (Free tier)
t3.small:   2 vCPU,  2 GB RAM
t3.medium:  2 vCPU,  4 GB RAM
t3.large:   2 vCPU,  8 GB RAM
```

**Use Cases:**
- Development/Testing environments
- Low-traffic web applications
- Background workers
- Small applications

**Interview Example:**
> "Development environment ke liye t3.medium use karte hain kyunki yeh cost-effective hai aur variable workload handle kar leta hai."

### Instance Selection Strategy

```
┌─────────────────────────────────────────────────────────┐
│    How to Choose Instance Type?                        │
└─────────────────────────────────────────────────────────┘

1. Workload Analysis:
   ├─ CPU-intensive? → Compute Optimized (C5)
   ├─ Memory-intensive? → Memory Optimized (R5)
   ├─ Balanced? → General Purpose (M5)
   └─ Variable? → Burstable (T3)

2. Performance Requirements:
   ├─ High throughput? → Larger instance
   ├─ Low latency? → Compute optimized
   └─ Cost-sensitive? → Smaller instance

3. Scalability:
   ├─ Start small, scale up
   ├─ Use Auto Scaling
   └─ Monitor and adjust
```

---

## 2. Auto Scaling

### What is Auto Scaling?

Auto Scaling automatically EC2 instances add/remove karta hai based on demand. Yeh cost optimize karta hai aur high availability ensure karta hai.

### Key Components

#### 2.1 Launch Template

**Kya hai?**
- Template jo define karta hai ki instance kaise launch hoga
- AMI, instance type, security groups, user data, etc.

**Example:**
```json
{
  "LaunchTemplateName": "uber-api-server",
  "ImageId": "ami-0abc123def456",
  "InstanceType": "m5.xlarge",
  "SecurityGroupIds": ["sg-12345"],
  "UserData": "#!/bin/bash\nnpm install\nnpm start",
  "IamInstanceProfile": {
    "Name": "UberAPIRole"
  }
}
```

**Interview Tip:**
> "Launch Template use karte hain consistency ke liye. Har naya instance same configuration ke saath launch hoga."

#### 2.2 Auto Scaling Group (ASG)

**Kya hai?**
- Group of EC2 instances jo automatically scale hote hain
- Min, Desired, aur Max size define karte hain

**Configuration:**
```
Min Size: 3 instances (always running)
Desired Capacity: 5 instances (target)
Max Size: 20 instances (maximum limit)
```

**How it Works:**
```
┌─────────────────────────────────────────────────────────┐
│    Auto Scaling Flow                                    │
└─────────────────────────────────────────────────────────┘

1. CloudWatch monitors metrics (CPU, Memory, Requests)
   │
   ├─ CPU > 70% → Scale Out (add instances)
   │
   └─ CPU < 30% → Scale In (remove instances)

2. ASG launches/terminates instances
   │
   ├─ Uses Launch Template
   │
   └─ Health checks ensure instances are healthy

3. Load Balancer distributes traffic
   │
   └─ New instances automatically registered
```

#### 2.3 Scaling Policies

**Types:**

1. **Target Tracking Scaling**
   - Maintain specific metric at target value
   - Example: Keep CPU at 50%
   - Best for: Steady workloads

2. **Step Scaling**
   - Different actions for different thresholds
   - Example: CPU 50-70% → Add 1, CPU > 90% → Add 3
   - Best for: Granular control

3. **Simple Scaling**
   - Single threshold-based action
   - Example: CPU > 70% → Add 2 instances
   - Best for: Simple scenarios

4. **Scheduled Scaling**
   - Scale at specific times
   - Example: Scale up at 9 AM, scale down at 11 PM
   - Best for: Predictable traffic patterns

**Interview Example:**
```yaml
ScalingPolicy:
  Type: TargetTrackingScaling
  TargetMetric: CPUUtilization
  TargetValue: 50.0
  ScaleOutCooldown: 60 seconds
  ScaleInCooldown: 300 seconds
```

**Why Cooldown?**
- Scale Out: Quick (60s) - need instances fast
- Scale In: Slow (300s) - avoid thrashing

### Real-World Example: Uber API Servers

```
┌─────────────────────────────────────────────────────────┐
│    Scenario: Rush Hour Traffic                          │
└─────────────────────────────────────────────────────────┘

Time: 9:00 AM
├─ Current: 5 instances, CPU: 45%
├─ Traffic: Normal

Time: 9:15 AM (Rush Hour Starts)
├─ CPU increases to 75%
├─ CloudWatch Alarm triggers
├─ Auto Scaling adds 2 instances
└─ New: 7 instances, CPU: 55%

Time: 9:18 AM
├─ New instances healthy
├─ Load balancer distributes traffic
└─ System stable

Time: 11:00 PM (Low Traffic)
├─ CPU decreases to 25%
├─ CloudWatch Alarm triggers
├─ Auto Scaling removes 1 instance
└─ New: 6 instances
```

### Best Practices

1. **Set Appropriate Limits**
   - Min: Ensure availability
   - Max: Control costs
   - Desired: Normal load

2. **Use Health Checks**
   - ELB health checks (better than EC2)
   - Ensures only healthy instances receive traffic

3. **Configure Cooldowns**
   - Prevent rapid scaling
   - Reduce costs

4. **Monitor Metrics**
   - CPU, Memory, Network
   - Custom metrics (requests/sec)
   - Use CloudWatch alarms

---

## 3. Load Balancers (ALB, NLB, CLB)

### What is a Load Balancer?

Load balancer traffic ko multiple servers mein distribute karta hai. Yeh high availability, fault tolerance, aur scalability provide karta hai.

### Types Comparison

#### 3.1 Application Load Balancer (ALB)

**Layer:** Layer 7 (HTTP/HTTPS)

**Features:**
- Path-based routing (`/api/*`, `/ws/*`)
- Host-based routing (`api.uber.com`, `ws.uber.com`)
- SSL/TLS termination
- WebSocket support
- HTTP/2 support
- Health checks
- Sticky sessions

**Use Cases:**
- REST APIs
- WebSocket applications
- Microservices
- Container-based applications

**How it Works:**
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTPS Request
       │ GET /api/rides/request
       ▼
┌─────────────────────────────────────┐
│      Application Load Balancer      │
│                                     │
│  1. SSL Termination                 │
│  2. Route Matching                 │
│     ├─ Path: /api/* → API Group    │
│     └─ Path: /ws/* → WebSocket Group│
│  3. Health Check                    │
│  4. Load Balancing                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐
│ API Server 1│    │ API Server 2│
└─────────────┘    └─────────────┘
```

**Interview Example:**
> "Uber mein ALB use karte hain kyunki humein path-based routing chahiye. `/api/*` API servers ko jata hai aur `/ws/*` WebSocket servers ko."

#### 3.2 Network Load Balancer (NLB)

**Layer:** Layer 4 (TCP/UDP)

**Features:**
- Ultra-low latency (< 100ms)
- High throughput (millions of requests/sec)
- Static IP addresses
- Source IP preservation
- TCP/UDP load balancing

**Use Cases:**
- Real-time applications
- Gaming servers
- High-performance APIs
- IoT applications
- Low-latency requirements

**When to Use:**
- Need extremely low latency
- High throughput required
- Need static IP addresses
- TCP/UDP protocols

**Interview Example:**
> "Real-time location updates ke liye NLB use karte hain kyunki humein ultra-low latency chahiye (< 100ms)."

#### 3.3 Classic Load Balancer (CLB)

**Layer:** Layer 4 & Layer 7 (Legacy)

**Features:**
- Basic HTTP/HTTPS load balancing
- SSL/TLS termination
- Health checks
- Sticky sessions

**Note:** AWS recommends ALB or NLB instead

**When to Use:**
- Legacy applications
- EC2-Classic (old VPC)
- Simple load balancing needs

### Load Balancing Algorithms

1. **Round Robin** (Default)
   - Requests ko sequentially distribute karta hai
   - Simple aur fair

2. **Least Connections**
   - Request ko server ko bhejta hai jiske paas sabse kam connections hain
   - Best for long-lived connections

3. **IP Hash**
   - Client IP ke basis par server select karta hai
   - Sticky sessions ke liye use hota hai

### Health Checks

```
┌─────────────────────────────────────────────────────────┐
│    Health Check Configuration                           │
└─────────────────────────────────────────────────────────┘

Protocol: HTTP
Path: /health
Interval: 30 seconds
Timeout: 5 seconds
Healthy Threshold: 2 consecutive successes
Unhealthy Threshold: 3 consecutive failures

Flow:
1. ALB sends GET /health every 30 seconds
2. If server responds 200 OK → Healthy
3. If 3 failures → Mark unhealthy
4. Stop sending traffic to unhealthy instance
```

### Target Groups

**What are Target Groups?**
- Group of targets (EC2 instances, IPs, Lambda functions)
- Health checks per target group
- Different routing rules

**Example:**
```
Target Group 1: api-servers
├─ Port: 3000
├─ Health Check: /health
└─ Targets: [i-12345, i-12346, i-12347]

Target Group 2: websocket-servers
├─ Port: 3001
├─ Health Check: /ws/health
└─ Targets: [i-12348, i-12349, i-12350]
```

---

## 4. Security Groups

### What are Security Groups?

Security Groups virtual firewalls hain jo EC2 instances aur load balancers ko protect karte hain. Yeh stateful firewalls hain (return traffic automatically allowed).

### Key Concepts

#### 4.1 Stateful Firewalls

**Kya hai?**
- Agar inbound traffic allow hai, to outbound response automatically allow hota hai
- No need to explicitly allow return traffic

**Example:**
```
Inbound Rule: Allow HTTPS (443) from 0.0.0.0/0
→ Outbound response automatically allowed
```

#### 4.2 Default Behavior

**Default Rules:**
- **Inbound:** All traffic DENIED
- **Outbound:** All traffic ALLOWED

**You must explicitly allow inbound traffic.**

#### 4.3 Security Group Rules

**Rule Structure:**
```
Type: HTTPS
Protocol: TCP
Port: 443
Source: 0.0.0.0/0 (or sg-xxxxx)
Description: Allow HTTPS from internet
```

**Source Types:**
- IP Address: `203.0.113.45/32`
- CIDR Block: `10.0.0.0/16`
- Security Group: `sg-12345` (recommended)

### Security Group Architecture

```
┌─────────────────────────────────────────────────────────┐
│    Multi-Tier Architecture                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────┐
│  Internet           │
└──────────┬──────────┘
           │
           │ HTTPS (443)
           ▼
┌─────────────────────┐
│  ALB Security Group │
│  sg-alb-public      │
│                     │
│  Inbound:           │
│  ├─ HTTPS: 443     │
│  └─ HTTP: 80       │
│                     │
│  Outbound:          │
│  └─ All Traffic    │
└──────────┬──────────┘
           │
           │ HTTP (3000)
           ▼
┌─────────────────────┐
│  API Server SG      │
│  sg-api-servers     │
│                     │
│  Inbound:           │
│  ├─ HTTP: 3000     │
│  │  from: sg-alb   │
│  └─ SSH: 22        │
│     from: sg-bastion│
│                     │
│  Outbound:          │
│  ├─ HTTPS: 443     │
│  ├─ Redis: 6379    │
│  │  to: sg-redis   │
│  └─ DB: 5432      │
│     to: sg-db      │
└──────────┬──────────┘
           │
           │ Redis (6379)
           ▼
┌─────────────────────┐
│  Redis Security Group│
│  sg-redis           │
│                     │
│  Inbound:           │
│  └─ Redis: 6379    │
│     from: sg-api    │
│                     │
│  Outbound:          │
│  └─ None           │
└─────────────────────┘
```

### Best Practices

1. **Principle of Least Privilege**
   - Only allow necessary ports
   - Only allow necessary source IPs
   - Deny by default

2. **Use Security Group References**
   - Instead of IP addresses, use `sg-xxxxx`
   - More maintainable
   - Automatically updates

3. **Separate by Function**
   - `sg-api-servers`
   - `sg-database`
   - `sg-redis`
   - `sg-load-balancer`

4. **Never Allow 0.0.0.0/0 for Database**
   - Only allow from application servers
   - Use bastion host for SSH

5. **Regular Audits**
   - Review rules monthly
   - Remove unused rules
   - Use AWS Config

### Common Mistakes

❌ **Wrong:**
```
Database Security Group:
Inbound: PostgreSQL (5432) from 0.0.0.0/0
```

✅ **Correct:**
```
Database Security Group:
Inbound: PostgreSQL (5432) from sg-api-servers
```

❌ **Wrong:**
```
API Server Security Group:
Inbound: HTTP (3000) from 203.0.113.45/32
```

✅ **Correct:**
```
API Server Security Group:
Inbound: HTTP (3000) from sg-alb-public
```

---

## Interview Questions & Answers

### Q1: EC2 Instance Types ke beech difference kya hai?

**Answer:**
```
General Purpose (M5):
- Balanced compute, memory, networking
- Use: Web servers, APIs, microservices
- Example: m5.xlarge (4 vCPU, 16 GB RAM)

Compute Optimized (C5):
- High-performance processors
- Use: CPU-intensive tasks
- Example: c5.xlarge (4 vCPU, 8 GB RAM)

Memory Optimized (R5):
- High memory-to-CPU ratio
- Use: In-memory databases, caching
- Example: r5.xlarge (4 vCPU, 32 GB RAM)

Burstable (T3):
- Baseline with burst capability
- Use: Dev/test, variable workloads
- Example: t3.medium (2 vCPU, 4 GB RAM)
```

### Q2: Auto Scaling kaise kaam karta hai?

**Answer:**
```
1. CloudWatch monitors metrics (CPU, Memory, Requests)
2. When threshold exceeded:
   - CPU > 70% → Scale Out (add instances)
   - CPU < 30% → Scale In (remove instances)
3. Auto Scaling Group uses Launch Template
4. New instances automatically register with Load Balancer
5. Health checks ensure only healthy instances receive traffic
```

### Q3: ALB vs NLB vs CLB - kaun sa kab use karein?

**Answer:**
```
ALB (Application Load Balancer):
- Layer 7 (HTTP/HTTPS)
- Path-based routing, WebSocket support
- Use: REST APIs, microservices, web apps
- Best for: Most applications

NLB (Network Load Balancer):
- Layer 4 (TCP/UDP)
- Ultra-low latency, high throughput
- Use: Real-time apps, gaming, high-performance APIs
- Best for: Low latency requirements

CLB (Classic Load Balancer):
- Legacy (Layer 4 & 7)
- Basic load balancing
- Use: Legacy applications only
- AWS recommends: ALB or NLB instead
```

### Q4: Security Groups vs Network ACLs - difference?

**Answer:**
```
Security Groups:
- Instance level (applied to ENI)
- Stateful (return traffic auto-allowed)
- Default: Deny inbound, Allow outbound
- Rules evaluated: ALL rules checked
- Can reference other security groups

Network ACLs:
- Subnet level
- Stateless (must allow return traffic)
- Default: Allow all traffic
- Rules evaluated: First match wins
- Cannot reference other NACLs
```

### Q5: Auto Scaling mein cooldown period kyu important hai?

**Answer:**
```
Cooldown period prevents rapid scaling:

Scale Out Cooldown (60s):
- Quick response needed
- Add instances fast when traffic spikes
- Prevents over-provisioning

Scale In Cooldown (300s):
- Slower removal
- Avoids thrashing (add/remove repeatedly)
- Ensures traffic stabilizes before removing instances
- Cost optimization
```

### Q6: Load Balancer health checks fail ho rahe hain - kya karein?

**Answer:**
```
1. Check health check configuration:
   - Path correct? (/health)
   - Port correct? (3000)
   - Protocol correct? (HTTP)

2. Check application:
   - Health endpoint working?
   - Application responding?
   - Security groups allowing traffic?

3. Check logs:
   - Application logs
   - CloudWatch logs
   - Health check logs

4. Common issues:
   - Wrong path
   - Security group blocking
   - Application not running
   - Wrong port
```

### Q7: Multiple security groups kaise use karein?

**Answer:**
```
One instance can have multiple security groups:
- Rules are combined (OR logic)
- If ANY security group allows, traffic allowed

Example:
Instance has:
- sg-api-servers (allows HTTP from ALB)
- sg-monitoring (allows port 8080 from monitoring)

Result: Instance accepts both HTTP and monitoring traffic
```

### Q8: Cost optimization ke liye Auto Scaling kaise use karein?

**Answer:**
```
1. Set appropriate limits:
   - Min: Ensure availability (3 instances)
   - Max: Control costs (20 instances)
   - Desired: Normal load (5 instances)

2. Use scheduled scaling:
   - Scale up before rush hour
   - Scale down during low traffic

3. Configure cooldowns:
   - Prevent rapid scaling
   - Reduce unnecessary instance launches

4. Monitor and adjust:
   - Review metrics regularly
   - Adjust thresholds based on actual usage
   - Use Reserved Instances for baseline capacity
```

---

## Quick Reference

### Instance Type Selection
```
CPU-intensive → C5 (Compute Optimized)
Memory-intensive → R5 (Memory Optimized)
Balanced → M5 (General Purpose)
Variable workload → T3 (Burstable)
```

### Load Balancer Selection
```
HTTP/HTTPS apps → ALB
Low latency needed → NLB
Legacy apps → CLB (not recommended)
```

### Security Group Rules
```
Default: Deny inbound, Allow outbound
Stateful: Return traffic auto-allowed
Source: Use sg-xxx instead of IPs
```

### Auto Scaling
```
Min: Availability
Desired: Normal load
Max: Cost control
Cooldown: Prevent thrashing
```

---

*Complete AWS Infrastructure guide for interview preparation!*
