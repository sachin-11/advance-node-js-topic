# System Design Fundamentals - Visual Diagrams Summary

This file contains all visual diagrams for Day 1 topics in one place for quick reference.

## 📊 Table of Contents
1. [Scalability Concepts](#scalability-concepts)
2. [Load Balancing](#load-balancing)
3. [Caching Strategies](#caching-strategies)
4. [CAP Theorem](#cap-theorem)

---

## 1. Scalability Concepts

### Vertical vs Horizontal Scaling

```
VERTICAL SCALING                    HORIZONTAL SCALING
─────────────────                  ─────────────────

BEFORE          AFTER              BEFORE          AFTER
┌──────┐       ┌──────┐          ┌──────┐       ┌──────┐ ┌──────┐ ┌──────┐
│Server│  ──>  │Server│          │Server│  ──>  │Server│ │Server│ │Server│
│      │       │      │          │      │       │  1   │ │  2   │ │  3   │
│ 2CPU │       │ 8CPU │          │      │       └───┬───┘ └───┬───┘ └───┬───┘
│ 4GB  │       │32GB │          │      │           └─────────┴─────────┘
└──────┘       └──────┘          └──────┘                  │
                                                      Load Balancer
```

**Key Difference:**
- **Vertical**: Upgrade same server (more power)
- **Horizontal**: Add more servers (more instances)

---

## 2. Load Balancing

### Basic Architecture

```
                    ┌──────────────┐
                    │   Clients    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Load Balancer │
                    └──────┬───────┘
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
      ┌─────────┐    ┌─────────┐    ┌─────────┐
      │Server 1 │    │Server 2 │    │Server 3 │
      └─────────┘    └─────────┘    └─────────┘
```

### Load Balancing Algorithms

```
ROUND ROBIN              LEAST CONNECTIONS         IP HASH
────────────            ──────────────────       ────────
Req1 → Server1         Server1: ████ (4)         IP1 → Server1
Req2 → Server2         Server2: ██ (2) ← Select  IP2 → Server2
Req3 → Server3         Server3: █████ (5)         IP3 → Server3
Req4 → Server1 (cycle)                            IP1 → Server1 (same)
```

---

## 3. Caching Strategies

### Cache Layers (Top to Bottom)

```
┌─────────────────────────────────────┐
│  1. Client Cache (Browser/Mobile)   │  ← Fastest, closest to user
├─────────────────────────────────────┤
│  2. CDN (Edge Servers)              │  ← Global distribution
├─────────────────────────────────────┤
│  3. Reverse Proxy Cache (Nginx)     │  ← Application level
├─────────────────────────────────────┤
│  4. Application Cache (Redis)        │  ← In-memory cache
├─────────────────────────────────────┤
│  5. Database Cache                   │  ← Query cache
└─────────────────────────────────────┘
```

### Cache Patterns

```
CACHE-ASIDE                WRITE-THROUGH              WRITE-BACK
───────────                ─────────────              ───────────
1. Check Cache             1. Write Cache            1. Write Cache
2. Cache Miss?             2. Write DB               2. Return Success
3. Fetch from DB           3. Both must succeed      3. Write DB (async)
4. Store in Cache          4. Return                 4. (Later)
5. Return
```

---

## 4. CAP Theorem

### The CAP Triangle

```
                    C (Consistency)
                         /\
                        /  \
                       /    \
                      /      \
                     /        \
                    /          \
                   /            \
                  /              \
                 /                \
                /                  \
               /                    \
              /                      \
             /                        \
            /                          \
           /                            \
          /                              \
    P (Partition) ──────────── A (Availability)
    
    ⚠️ You can only choose 2 out of 3!
```

### CAP System Behaviors

```
CP SYSTEM (Banking)              AP SYSTEM (Social Media)
───────────────────              ───────────────────────

Network Partition:               Network Partition:
  ❌ Block operations              ✅ Continue serving
  ✅ Maintain consistency          ⚠️  May return stale data
  ❌ Sacrifice availability        ✅ Sacrifice consistency
```

### CAP Decision Matrix

| System Type | Consistency | Availability | Partition Tolerance | Example |
|------------|-------------|--------------|---------------------|---------|
| **CA** | ✅ | ✅ | ❌ | Single-node DB |
| **CP** | ✅ | ❌ | ✅ | MongoDB, HBase |
| **AP** | ❌ | ✅ | ✅ | Cassandra, DynamoDB |

---

## Quick Reference

### When to Use What?

**Scalability:**
- **Vertical**: Small apps, simplicity needed
- **Horizontal**: Large scale, high availability needed

**Load Balancing:**
- **Round Robin**: Equal capacity servers
- **Least Connections**: Varying request times
- **IP Hash**: Session persistence needed

**Caching:**
- **Cache-Aside**: Most common, read-heavy
- **Write-Through**: Consistency critical
- **Write-Back**: Write-heavy, can tolerate some loss

**CAP:**
- **CP**: Banking, financial (consistency critical)
- **AP**: Social media, content (availability critical)

---

## Study Tips

1. **Draw these diagrams** yourself to reinforce understanding
2. **Compare** different approaches side-by-side
3. **Think of real-world examples** for each concept
4. **Practice explaining** these diagrams to others
5. **Identify trade-offs** in each design decision

---

*Last Updated: Day 1 - System Design Fundamentals*

