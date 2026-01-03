# 🛒 Amazon E-Commerce System Design - HLD & LLD

Complete High-Level Design (HLD) and Low-Level Design (LLD) for Amazon-like E-Commerce Platform

## 📚 Table of Contents

### High-Level Design (HLD)
1. [System Overview](#system-overview)
2. [Core Components](#core-components)
3. [System Architecture](#system-architecture)
4. [Complete Flow](#complete-flow)
5. [Key Algorithms](#key-algorithms)
6. [Scalability & Performance](#scalability--performance)

### Low-Level Design (LLD)
7. [Database Design](#database-design)
8. [API Design](#api-design)
9. [Component Design](#component-design)
10. [Data Flow](#data-flow)
11. [Caching Strategy](#caching-strategy)
12. [Security & Reliability](#security--reliability)

---

## 🎯 System Overview

### Problem Statement

Design और implement करना है एक Amazon-like e-commerce platform जो support करे:
- **Product Catalog** - Millions of products को efficiently store और retrieve करना
- **Shopping Cart** - User carts को manage करना (persistent और session-based)
- **Recommendations** - Personalized product recommendations provide करना
- User authentication और authorization
- Order management और payment processing
- Real-time inventory management
- Search और filtering capabilities

### Key Requirements

**Functional Requirements:**
- Users can browse और search products
- Users can add/remove items from shopping cart
- System provides personalized product recommendations
- Users can view product details, reviews, ratings
- Real-time inventory updates
- Order placement और tracking
- Multiple payment methods support

**Non-Functional Requirements:**
- Product catalog load: < 100ms
- Shopping cart operations: < 50ms
- Recommendations API: < 200ms
- System capacity: 100M+ users, 1B+ products
- High availability: 99.99% uptime
- Handle 1M+ requests per second during peak
- Support for multiple regions और languages

### Key Stats (Amazon Scale):
- 📊 **300+ Million** active users
- 🛍️ **12+ Million** products
- 💰 **$575 Billion** annual revenue
- ⚡ **<100ms** average page load time
- 🖥️ **Millions** of servers worldwide

---

## 🏗️ Core Components

### 1. **Product Catalog Service** 📦
Products को store, index, और retrieve करता है। Millions of products को efficiently manage करता है।

**Key Features:**
- Product information storage
- Product search और filtering
- Category management
- Inventory tracking
- Product images और media storage

### 2. **Shopping Cart Service** 🛒
User shopping carts को manage करता है। Both authenticated और guest users के लिए support।

**Key Features:**
- Add/remove/update cart items
- Cart persistence (database + cache)
- Cart expiration management
- Price calculations
- Multi-item operations

### 3. **Recommendation Service** 🎯
Personalized product recommendations provide करता है using various algorithms।

**Key Features:**
- Collaborative filtering
- Content-based filtering
- Popular products
- "Frequently bought together"
- User behavior analysis

### 4. **User Service** 👤
User authentication, authorization, और profile management।

### 5. **Order Service** 📋
Order placement, processing, और tracking।

### 6. **Payment Service** 💳
Payment processing और transaction management।

### 7. **Search Service** 🔍
Full-text search और filtering capabilities।

### 8. **Inventory Service** 📊
Real-time inventory management और stock updates।

---

## 🔄 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│         (Web App, Mobile App, API Clients)                  │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   CDN (CloudFront)                          │
│         Static assets, Product images, Media                │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway / Load Balancer                     │
│         Request routing, Rate limiting, SSL termination      │
└───────────────────────┬───────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Product    │ │   Shopping   │ │ Recommendation│
│   Catalog    │ │     Cart     │ │   Service     │
│   Service    │ │   Service    │ │               │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                 │
       │                │                 │
┌──────▼────────────────▼─────────────────▼───────┐
│              Application Services Layer         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  User    │  │  Order   │  │  Search  │     │
│  │ Service  │  │ Service  │  │ Service  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Payment │  │Inventory │  │  Review  │     │
│  │ Service │  │ Service  │  │ Service  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└──────┬──────────────────────────────────────────┘
       │
       │
┌──────▼──────────────────────────────────────────┐
│              Data Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │PostgreSQL│  │   Redis  │  │Elasticsearch│   │
│  │(Primary) │  │  (Cache) │  │  (Search) │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ MongoDB  │  │   S3      │  │  Kafka   │     │
│  │(Catalog) │  │ (Storage) │  │(Events)  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Request Flow:
1. User → API Gateway → Service (Product/Cart/Recommendation)
2. Service checks Cache (Redis)
3. If cache miss → Database query
4. Response cached → Return to user

Shopping Cart Flow:
1. Add to Cart → Cart Service
2. Update Redis (fast access)
3. Persist to PostgreSQL (durability)
4. Trigger recommendation update

Recommendation Flow:
1. User action → Event to Kafka
2. Recommendation Service processes event
3. Pre-compute recommendations → Store in Redis
4. User requests → Return from cache
```

---

## 🔄 Complete Flow

### 1. Product Catalog Flow

```
User browses products:
┌─────────┐
│  User   │
└────┬────┘
     │ 1. GET /api/products?category=electronics&page=1
     ▼
┌─────────────────┐
│  API Gateway    │
└────┬────────────┘
     │ 2. Route to Product Catalog Service
     ▼
┌─────────────────────────┐
│ Product Catalog Service │
└────┬────────────────────┘
     │ 3. Check Redis cache
     │    Key: "products:category:electronics:page:1"
     │
     ├─ Cache HIT ──────────┐
     │                       │
     │ Cache MISS            │
     ▼                       │
┌─────────────────┐         │
│   PostgreSQL    │◄────────┘
│  (Product DB)   │
└────┬────────────┘
     │ 4. Query products with pagination
     │    SELECT * FROM products 
     │    WHERE category = 'electronics'
     │    LIMIT 20 OFFSET 0
     │
     ▼
┌─────────────────┐
│  Cache Result   │
│  (Redis)        │
└────┬────────────┘
     │ 5. Store in cache (TTL: 5 minutes)
     │
     ▼
┌─────────────────┐
│  Return to User │
└─────────────────┘
```

### 2. Shopping Cart Flow

```
Add to Cart Flow:
┌─────────┐
│  User   │
└────┬────┘
     │ 1. POST /api/cart/add
     │    { productId: "123", quantity: 2 }
     ▼
┌─────────────────┐
│  API Gateway    │
└────┬────────────┘
     │ 2. Authenticate user
     │    Extract userId from JWT token
     ▼
┌─────────────────────┐
│ Shopping Cart Service│
└────┬─────────────────┘
     │ 3. Validate product exists
     │    Check inventory availability
     │
     ├─ Check Redis Cart ────┐
     │  Key: "cart:userId:123"│
     │                       │
     │ Cart exists           │
     ▼                       │
┌─────────────────┐         │
│   Redis Cache   │         │
│  (Cart Data)    │         │
└────┬────────────┘         │
     │ 4. Update cart in Redis│
     │    - Add/update item   │
     │    - Recalculate total │
     │                       │
     │                       │
     ▼                       │
┌─────────────────┐         │
│   PostgreSQL    │◄────────┘
│  (Cart DB)      │
└────┬────────────┘
     │ 5. Persist cart (async)
     │    INSERT/UPDATE cart_items
     │
     ▼
┌─────────────────┐
│  Return Success │
│  { cartId, total, items }│
└─────────────────┘

Get Cart Flow:
┌─────────┐
│  User   │
└────┬────┘
     │ 1. GET /api/cart
     ▼
┌─────────────────────┐
│ Shopping Cart Service│
└────┬─────────────────┘
     │ 2. Get from Redis (fast)
     │    Key: "cart:userId:123"
     │
     ├─ Cache HIT ──────────┐
     │                       │
     │ Cache MISS            │
     ▼                       │
┌─────────────────┐         │
│   PostgreSQL    │◄────────┘
│  (Cart DB)      │
└────┬────────────┘
     │ 3. Load cart from DB
     │    JOIN with products table
     │    Calculate current prices
     │
     ▼
┌─────────────────┐
│  Cache in Redis │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Return Cart    │
└─────────────────┘
```

### 3. Recommendation Flow

```
User Views Product:
┌─────────┐
│  User   │
└────┬────┘
     │ 1. GET /api/products/123
     ▼
┌─────────────────────┐
│ Product Catalog     │
│      Service        │
└────┬────────────────┘
     │ 2. Return product details
     │
     │ 3. Publish event to Kafka
     │    Topic: "user-events"
     │    { userId, productId, event: "view", timestamp }
     ▼
┌─────────────────┐
│  Kafka Queue    │
└────┬────────────┘
     │
     ▼
┌─────────────────────────┐
│ Recommendation Service  │
│   (Event Consumer)      │
└────┬────────────────────┘
     │ 4. Process event
     │    - Update user behavior model
     │    - Trigger recommendation refresh
     │
     ▼
┌─────────────────────────┐
│ Recommendation Engine    │
│                         │
│  Algorithms:            │
│  - Collaborative Filter │
│  - Content-based Filter │
│  - Popular Products     │
│  - Frequently Bought    │
└────┬────────────────────┘
     │ 5. Generate recommendations
     │
     ▼
┌─────────────────┐
│   Redis Cache   │
│  Key: "rec:userId:123"│
│  Value: [productIds]   │
└────┬────────────┘
     │ 6. Store recommendations
     │    TTL: 1 hour
     │
     ▼

User Requests Recommendations:
┌─────────┐
│  User   │
└────┬────┘
     │ 1. GET /api/recommendations
     ▼
┌─────────────────────────┐
│ Recommendation Service  │
└────┬────────────────────┘
     │ 2. Check Redis cache
     │    Key: "rec:userId:123"
     │
     ├─ Cache HIT ──────────┐
     │                       │
     │ Cache MISS            │
     ▼                       │
┌─────────────────┐         │
│ Generate on fly │◄────────┘
│ (fallback)      │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Return Products │
└─────────────────┘
```

---

## 🧮 Key Algorithms

### 1. Product Search Algorithm

**Elasticsearch-based Search:**
- Full-text search with relevance scoring
- Faceted filtering (category, price, rating)
- Fuzzy matching for typos
- Autocomplete suggestions

**Search Query Example:**
```json
{
  "query": {
    "multi_match": {
      "query": "laptop",
      "fields": ["title^3", "description", "category"],
      "fuzziness": "AUTO"
    }
  },
  "filter": {
    "range": {
      "price": { "gte": 500, "lte": 2000 }
    }
  },
  "sort": [
    { "rating": "desc" },
    { "_score": "desc" }
  ]
}
```

### 2. Recommendation Algorithms

#### A. Collaborative Filtering
```
User-Item Matrix:
        Product1  Product2  Product3  Product4
User1     5        4         0         3
User2     4        0         5         4
User3     0        3         4         5
User4     5        4         0         0

Similarity Calculation (Cosine Similarity):
sim(User1, User2) = (5*4 + 4*0 + 0*5 + 3*4) / 
                    (sqrt(5²+4²+3²) * sqrt(4²+5²+4²))
                  = 0.65

Recommendation:
- Find users similar to current user
- Recommend products they liked
```

#### B. Content-Based Filtering
```
Product Features:
Product1: { category: "electronics", brand: "Apple", price: 1000 }
Product2: { category: "electronics", brand: "Samsung", price: 800 }
Product3: { category: "clothing", brand: "Nike", price: 50 }

User Profile (from purchase history):
{ electronics: 0.8, Apple: 0.9, price_range: [500-1500] }

Recommendation Score:
Product1: 0.8 * 0.9 * 1.0 = 0.72
Product2: 0.8 * 0.3 * 1.0 = 0.24
Product3: 0.1 * 0.0 * 0.5 = 0.00
```

#### C. Popular Products
```
Score = (views * 0.3) + (purchases * 0.5) + (rating * 0.2)

Product1: (1000 * 0.3) + (100 * 0.5) + (4.5 * 0.2) = 350.9
Product2: (500 * 0.3) + (200 * 0.5) + (4.8 * 0.2) = 250.96
```

#### D. Frequently Bought Together
```
Association Rule Mining:
If {Product A} purchased → {Product B} also purchased (confidence: 75%)

Example:
Laptop → Laptop Bag (75%)
Laptop → Mouse (60%)
Laptop → Keyboard (55%)
```

### 3. Cart Management Algorithm

**Cart Expiration:**
- Guest carts: 7 days TTL
- Authenticated carts: 30 days TTL
- Abandoned cart recovery: Email after 24 hours

**Price Calculation:**
```
Total = Σ (item_price * quantity) + shipping - discount

Item Price:
- Check current price from product catalog
- Apply any user-specific discounts
- Apply bulk quantity discounts
```

---

## 📈 Scalability & Performance

### 1. Horizontal Scaling

**Service Scaling:**
- Each service can scale independently
- Auto-scaling based on CPU/memory metrics
- Load balancer distributes traffic

**Database Scaling:**
- **Read Replicas**: Multiple read replicas for read-heavy operations
- **Sharding**: Partition data by user_id or product_id
- **Caching**: Redis for frequently accessed data

### 2. Caching Strategy

**Multi-Level Caching:**
```
Level 1: CDN (Static assets, product images)
  └─ TTL: 24 hours

Level 2: Application Cache (Redis)
  ├─ Product details: TTL 5 minutes
  ├─ Shopping cart: TTL 1 hour
  ├─ Recommendations: TTL 1 hour
  └─ Search results: TTL 10 minutes

Level 3: Database Query Cache
  └─ Frequently executed queries
```

**Cache Invalidation:**
- Product update → Invalidate product cache
- Cart update → Update cart cache immediately
- Price change → Invalidate related caches

### 3. Database Optimization

**Indexing Strategy:**
```sql
-- Products table
CREATE INDEX idx_category ON products(category);
CREATE INDEX idx_price ON products(price);
CREATE INDEX idx_rating ON products(rating DESC);
CREATE INDEX idx_search ON products USING GIN(to_tsvector('english', title || ' ' || description));

-- Cart table
CREATE INDEX idx_user_cart ON cart_items(user_id, created_at);
CREATE INDEX idx_cart_product ON cart_items(product_id);

-- Recommendations
CREATE INDEX idx_user_rec ON user_recommendations(user_id, score DESC);
```

**Query Optimization:**
- Use pagination (LIMIT/OFFSET or cursor-based)
- Avoid N+1 queries (use JOINs)
- Use materialized views for complex aggregations

### 4. Performance Targets

| Operation | Target Latency | Throughput |
|-----------|---------------|------------|
| Product Search | < 100ms | 10K req/s |
| Get Cart | < 50ms | 20K req/s |
| Add to Cart | < 100ms | 15K req/s |
| Recommendations | < 200ms | 5K req/s |
| Product Details | < 50ms | 30K req/s |

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │         │   products   │         │   categories │
│              │         │              │         │              │
│ - id (PK)    │         │ - id (PK)    │         │ - id (PK)    │
│ - email      │         │ - title      │         │ - name       │
│ - name       │         │ - description│         │ - parent_id  │
│ - password   │         │ - price      │         │ - slug       │
│ - created_at │         │ - category_id│────────►│ - created_at │
└──────┬───────┘         │ - stock      │         └──────────────┘
       │                 │ - rating     │
       │                 │ - image_urls │
       │                 │ - created_at │
       │                 └──────┬───────┘
       │                        │
       │                        │
       │                 ┌──────▼───────┐
       │                 │  cart_items  │
       │                 │              │
       │                 │ - id (PK)   │
       │                 │ - user_id   │──────┐
       │                 │ - product_id│──┐   │
       │                 │ - quantity  │  │   │
       │                 │ - price     │  │   │
       │                 │ - created_at│  │   │
       │                 └─────────────┘  │   │
       │                                  │   │
       │                 ┌────────────────┘   │
       │                 │                     │
       │                 │                     │
┌──────▼─────────────────▼─────────────────────▼──────┐
│              orders                                  │
│                                                      │
│ - id (PK)                                            │
│ - user_id                                            │
│ - total_amount                                       │
│ - status                                             │
│ - shipping_address                                   │
│ - created_at                                         │
└──────┬───────────────────────────────────────────────┘
       │
       │
┌──────▼──────────────────────────────────────────────┐
│              order_items                             │
│                                                      │
│ - id (PK)                                            │
│ - order_id                                           │
│ - product_id                                         │
│ - quantity                                           │
│ - price                                              │
└──────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐
│   reviews    │         │recommendations│
│              │         │              │
│ - id (PK)    │         │ - id (PK)    │
│ - user_id    │         │ - user_id    │
│ - product_id │         │ - product_id │
│ - rating     │         │ - score      │
│ - comment    │         │ - algorithm  │
│ - created_at │         │ - created_at │
└──────────────┘         └──────────────┘
```

### Database Schema

#### 1. **users** Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

#### 2. **categories** Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

#### 3. **products** Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    stock INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    image_urls TEXT[], -- Array of image URLs
    specifications JSONB, -- Flexible schema for product specs
    seller_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

#### 4. **cart_items** Table
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL, -- Price at time of adding
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_user ON cart_items(user_id, created_at DESC);
CREATE INDEX idx_cart_product ON cart_items(product_id);
```

#### 5. **orders** Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
```

#### 6. **order_items** Table
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Price at time of purchase
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

#### 7. **reviews** Table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id, created_at DESC);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

#### 8. **user_recommendations** Table
```sql
CREATE TABLE user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    score DECIMAL(10, 6) NOT NULL, -- Recommendation score
    algorithm VARCHAR(50) NOT NULL, -- collaborative, content-based, popular, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, algorithm)
);

CREATE INDEX idx_rec_user ON user_recommendations(user_id, score DESC);
CREATE INDEX idx_rec_product ON user_recommendations(product_id);
```

#### 9. **user_behavior** Table (for recommendations)
```sql
CREATE TABLE user_behavior (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- view, add_to_cart, purchase, review
    metadata JSONB, -- Additional event data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_behavior_user ON user_behavior(user_id, created_at DESC);
CREATE INDEX idx_behavior_product ON user_behavior(product_id);
CREATE INDEX idx_behavior_event ON user_behavior(event_type, created_at DESC);
```

---

## 🔌 API Design

### Product Catalog APIs

#### 1. Get Products (with pagination and filters)
```http
GET /api/v1/products?category=electronics&minPrice=100&maxPrice=1000&page=1&limit=20&sort=rating:desc

Response:
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "title": "iPhone 15 Pro",
        "description": "...",
        "price": 999.99,
        "category": "electronics",
        "stock": 50,
        "rating": 4.5,
        "reviewCount": 1234,
        "imageUrls": ["url1", "url2"],
        "specifications": {...}
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5000,
      "totalPages": 250
    }
  }
}
```

#### 2. Get Product Details
```http
GET /api/v1/products/{productId}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "iPhone 15 Pro",
    "description": "...",
    "price": 999.99,
    "category": {...},
    "stock": 50,
    "rating": 4.5,
    "reviewCount": 1234,
    "imageUrls": ["url1", "url2"],
    "specifications": {...},
    "reviews": [...],
    "relatedProducts": [...]
  }
}
```

#### 3. Search Products
```http
GET /api/v1/products/search?q=laptop&page=1&limit=20

Response:
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {...},
    "facets": {
      "categories": [...],
      "priceRanges": [...],
      "brands": [...]
    }
  }
}
```

### Shopping Cart APIs

#### 1. Get Cart
```http
GET /api/v1/cart

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "data": {
    "cartId": "uuid",
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "title": "iPhone 15 Pro",
          "price": 999.99,
          "imageUrl": "url"
        },
        "quantity": 2,
        "price": 999.99,
        "subtotal": 1999.98
      }
    ],
    "subtotal": 1999.98,
    "shipping": 0,
    "discount": 0,
    "total": 1999.98
  }
}
```

#### 2. Add to Cart
```http
POST /api/v1/cart/items

Headers:
  Authorization: Bearer {jwt_token}

Body:
{
  "productId": "uuid",
  "quantity": 2
}

Response:
{
  "success": true,
  "data": {
    "cartItem": {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "price": 999.99
    },
    "cart": {
      "totalItems": 2,
      "total": 1999.98
    }
  }
}
```

#### 3. Update Cart Item
```http
PUT /api/v1/cart/items/{itemId}

Headers:
  Authorization: Bearer {jwt_token}

Body:
{
  "quantity": 3
}

Response:
{
  "success": true,
  "data": {
    "cartItem": {
      "id": "uuid",
      "quantity": 3,
      "subtotal": 2999.97
    }
  }
}
```

#### 4. Remove from Cart
```http
DELETE /api/v1/cart/items/{itemId}

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "message": "Item removed from cart"
}
```

### Recommendation APIs

#### 1. Get Recommendations
```http
GET /api/v1/recommendations?type=personalized&limit=20

Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "product": {
          "id": "uuid",
          "title": "Product Name",
          "price": 99.99,
          "rating": 4.5,
          "imageUrl": "url"
        },
        "score": 0.85,
        "reason": "Users with similar preferences also bought this"
      }
    ],
    "type": "personalized",
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get "Frequently Bought Together"
```http
GET /api/v1/products/{productId}/frequently-bought-together

Response:
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "title": "Product Name",
        "price": 29.99,
        "confidence": 0.75
      }
    ]
  }
}
```

---

## 🧩 Component Design

### 1. Product Catalog Service

**Class Structure:**
```typescript
class ProductCatalogService {
  // Dependencies
  private productRepository: ProductRepository;
  private cacheService: CacheService;
  private searchService: SearchService;
  
  // Methods
  async getProducts(filters: ProductFilters): Promise<PaginatedProducts>;
  async getProductById(id: string): Promise<Product>;
  async searchProducts(query: string, filters: SearchFilters): Promise<SearchResults>;
  async updateProductStock(productId: string, quantity: number): Promise<void>;
}
```

**Key Methods:**
- `getProducts()`: Fetch products with filters, pagination, caching
- `getProductById()`: Get single product with related data
- `searchProducts()`: Full-text search using Elasticsearch
- `updateProductStock()`: Atomic stock update

### 2. Shopping Cart Service

**Class Structure:**
```typescript
class ShoppingCartService {
  // Dependencies
  private cartRepository: CartRepository;
  private productService: ProductCatalogService;
  private cacheService: CacheService;
  private eventPublisher: EventPublisher;
  
  // Methods
  async getCart(userId: string): Promise<Cart>;
  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem>;
  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartItem>;
  async removeFromCart(userId: string, itemId: string): Promise<void>;
  async clearCart(userId: string): Promise<void>;
  async calculateCartTotal(cart: Cart): Promise<CartTotal>;
}
```

**Key Methods:**
- `getCart()`: Get cart from cache or DB, merge with current prices
- `addToCart()`: Validate product, check stock, add/update item
- `calculateCartTotal()`: Calculate subtotal, shipping, discounts, total

### 3. Recommendation Service

**Class Structure:**
```typescript
class RecommendationService {
  // Dependencies
  private recommendationRepository: RecommendationRepository;
  private userBehaviorRepository: UserBehaviorRepository;
  private productService: ProductCatalogService;
  private cacheService: CacheService;
  private eventConsumer: EventConsumer;
  
  // Algorithms
  private collaborativeFilter: CollaborativeFilter;
  private contentBasedFilter: ContentBasedFilter;
  private popularProducts: PopularProductsAlgorithm;
  private frequentlyBoughtTogether: AssociationRuleMiner;
  
  // Methods
  async getRecommendations(userId: string, type: string, limit: number): Promise<Product[]>;
  async generateRecommendations(userId: string): Promise<void>;
  async updateUserBehavior(userId: string, productId: string, event: string): Promise<void>;
  async getFrequentlyBoughtTogether(productId: string): Promise<Product[]>;
}
```

**Key Methods:**
- `getRecommendations()`: Get cached or generate recommendations
- `generateRecommendations()`: Run all algorithms, combine results
- `updateUserBehavior()`: Record user actions for future recommendations

---

## 🔄 Data Flow

### Complete User Journey Flow

```
1. User Registration/Login
   User → User Service → PostgreSQL → JWT Token

2. Browse Products
   User → API Gateway → Product Catalog Service
   → Check Redis Cache
   → If miss: Query PostgreSQL
   → Cache result → Return products

3. View Product Details
   User → Product Catalog Service
   → Get product from cache/DB
   → Get reviews
   → Get related products
   → Publish "view" event to Kafka
   → Return product details

4. Add to Cart
   User → Shopping Cart Service
   → Validate product (stock, price)
   → Update Redis cart (fast)
   → Persist to PostgreSQL (async)
   → Publish "add_to_cart" event to Kafka
   → Return updated cart

5. Get Recommendations
   User → Recommendation Service
   → Check Redis cache
   → If miss: Generate recommendations
   → Store in cache → Return

6. Checkout
   User → Order Service
   → Validate cart
   → Reserve inventory
   → Create order
   → Process payment
   → Update inventory
   → Clear cart
   → Send confirmation
```

### Event-Driven Architecture

```
User Actions → Kafka Topics:

1. user-events Topic:
   - Product views
   - Add to cart
   - Purchases
   - Reviews

2. inventory-events Topic:
   - Stock updates
   - Low stock alerts

3. order-events Topic:
   - Order created
   - Order status changes
   - Payment processed

Consumers:
- Recommendation Service (user-events)
- Analytics Service (all events)
- Notification Service (order-events)
- Inventory Service (inventory-events)
```

---

## 💾 Caching Strategy

### Cache Keys Design

```
Product Cache:
- products:category:{categoryId}:page:{page} → List of products
- product:{productId} → Product details
- product:{productId}:reviews → Product reviews
- TTL: 5 minutes

Cart Cache:
- cart:user:{userId} → User's cart
- TTL: 1 hour (extended on access)

Recommendation Cache:
- rec:user:{userId}:type:{type} → Recommendations
- rec:product:{productId}:fbt → Frequently bought together
- TTL: 1 hour

Search Cache:
- search:query:{queryHash}:filters:{filterHash} → Search results
- TTL: 10 minutes
```

### Cache Invalidation Strategy

```typescript
// Product update
productService.updateProduct(productId) {
  // Update database
  await db.update(product);
  
  // Invalidate caches
  await cache.delete(`product:${productId}`);
  await cache.deletePattern(`products:category:*`); // Invalidate category pages
  await cache.deletePattern(`search:*`); // Invalidate search results
}

// Cart update
cartService.addToCart(userId, productId) {
  // Update cache immediately
  await cache.set(`cart:user:${userId}`, updatedCart);
  
  // Persist to DB async
  await db.save(updatedCart);
}
```

---

## 🔒 Security & Reliability

### Security Measures

1. **Authentication & Authorization**
   - JWT tokens for API authentication
   - Role-based access control (RBAC)
   - Rate limiting per user/IP

2. **Data Protection**
   - Encrypt sensitive data (passwords, payment info)
   - HTTPS for all communications
   - SQL injection prevention (parameterized queries)

3. **Input Validation**
   - Validate all user inputs
   - Sanitize data before storage
   - Prevent XSS attacks

### Reliability Measures

1. **High Availability**
   - Multiple instances of each service
   - Load balancers with health checks
   - Database replication (master-slave)

2. **Fault Tolerance**
   - Circuit breakers for external services
   - Retry mechanisms with exponential backoff
   - Graceful degradation (show cached data if DB fails)

3. **Data Consistency**
   - Transaction management for critical operations
   - Eventual consistency for non-critical data
   - Idempotent operations

4. **Monitoring & Alerting**
   - Application metrics (response time, error rate)
   - Infrastructure metrics (CPU, memory, disk)
   - Real-time alerts for critical issues

---

## 📊 Performance Optimization Summary

### Database Optimizations
- ✅ Proper indexing on frequently queried columns
- ✅ Read replicas for read-heavy operations
- ✅ Connection pooling
- ✅ Query optimization (avoid N+1, use JOINs)

### Caching Optimizations
- ✅ Multi-level caching (CDN → Redis → DB)
- ✅ Cache warming for popular data
- ✅ Smart cache invalidation
- ✅ Cache compression for large objects

### Application Optimizations
- ✅ Async processing for non-critical operations
- ✅ Batch operations where possible
- ✅ Lazy loading for related data
- ✅ Pagination for large datasets

### Infrastructure Optimizations
- ✅ CDN for static assets
- ✅ Load balancing
- ✅ Auto-scaling
- ✅ Geographic distribution

---

## 🎯 Summary

यह Amazon-like e-commerce system design document में हमने cover किया:

### High-Level Design (HLD):
1. ✅ System overview और requirements
2. ✅ Core components (Product Catalog, Shopping Cart, Recommendations)
3. ✅ System architecture diagram
4. ✅ Complete flow diagrams
5. ✅ Key algorithms (Search, Recommendations)
6. ✅ Scalability strategies

### Low-Level Design (LLD):
1. ✅ Detailed database schema
2. ✅ API design और endpoints
3. ✅ Component design (classes, methods)
4. ✅ Data flow diagrams
5. ✅ Caching strategy
6. ✅ Security और reliability measures

यह design Amazon-scale के लिए scalable, performant, और reliable system provide करता है जो millions of users और billions of products को handle कर सकता है।

---

**Note:** यह एक comprehensive design document है। Actual implementation में specific technologies (Node.js, Express, PostgreSQL, Redis, etc.) के according code लिखना होगा।
