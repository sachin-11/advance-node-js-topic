# 🛒 Quick Commerce System Design (Zepto/Blinkit Style)

High-level system design for 10-minute delivery platform.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Requirements](#requirements)
3. [High-Level Architecture](#high-level-architecture)
4. [Key Components](#key-components)
5. [Data Flow](#data-flow)
6. [Database Design](#database-design)
7. [Key Challenges & Solutions](#key-challenges--solutions)

---

## 🎯 System Overview

**Quick Commerce Platform** - Users ko products 10-15 minutes mein deliver karna.

### Key Features
- Product catalog with real-time inventory
- Order placement and tracking
- Delivery partner assignment
- Real-time location tracking
- Payment processing
- Warehouse/Dark store management

---

## 📊 Requirements

### Functional Requirements

1. **User Features**
   - Browse products by category
   - Search products
   - Add to cart
   - Place order
   - Track order in real-time
   - Payment (COD, UPI, Card)
   - Order history

2. **Inventory Management**
   - Real-time stock updates
   - Multiple warehouses/dark stores
   - Product availability by location
   - Low stock alerts

3. **Order Management**
   - Order placement
   - Order assignment to delivery partner
   - Order status updates
   - Order cancellation

4. **Delivery Management**
   - Delivery partner assignment
   - Route optimization
   - Real-time tracking
   - Delivery confirmation

5. **Warehouse Management**
   - Picking and packing
   - Inventory updates
   - Order fulfillment

### Non-Functional Requirements

- **Latency**: Order placement < 2 seconds
- **Availability**: 99.9% uptime
- **Scalability**: Support 1M+ orders/day
- **Real-time**: Location updates every 5 seconds
- **Accuracy**: Inventory accuracy > 99%

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Web    │  │  Mobile  │  │ Delivery │  │ Warehouse│       │
│  │   App    │  │   App    │  │ Partner  │  │   App    │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │ HTTPS/WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway / CDN                          │
│  - Rate Limiting                                                │
│  - Authentication                                               │
│  - Request Routing                                              │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Services Layer                    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Product    │  │    Order     │  │   Delivery   │        │
│  │   Service    │  │   Service    │  │   Service    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Inventory   │  │   Payment    │  │  Location    │        │
│  │   Service    │  │   Service    │  │   Service    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Warehouse   │  │ Notification │  │   Search     │        │
│  │   Service    │  │   Service    │  │   Service    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  PostgreSQL  │  │    Redis     │  │  MongoDB     │        │
│  │  (Orders,    │  │  (Cache,     │  │  (Products,  │        │
│  │   Users)     │  │   Sessions)  │  │   Catalog)   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Elasticsearch│  │   Kafka      │  │  TimescaleDB │        │
│  │  (Search)    │  │  (Events)    │  │  (Location)  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Payment      │  │   Maps API   │  │   SMS/Email  │        │
│  │ Gateway      │  │  (Google/    │  │   Service    │        │
│  │ (Razorpay)   │  │   OSRM)      │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Key Components

### 1. Product Service

**Responsibilities:**
- Product catalog management
- Category management
- Product search
- Product recommendations

**Key Features:**
- Product CRUD operations
- Category hierarchy
- Product images
- Product ratings/reviews

### 2. Inventory Service

**Responsibilities:**
- Real-time stock management
- Multi-warehouse inventory
- Stock updates
- Low stock alerts

**Key Features:**
- Stock check by location
- Reserve inventory on order
- Release inventory on cancellation
- Inventory sync across warehouses

### 3. Order Service

**Responsibilities:**
- Order creation
- Order status management
- Order assignment
- Order history

**Key Features:**
- Order placement
- Order validation
- Order cancellation
- Order status updates

### 4. Delivery Service

**Responsibilities:**
- Delivery partner management
- Order assignment
- Route optimization
- Real-time tracking

**Key Features:**
- Partner assignment algorithm
- Route calculation
- ETA calculation
- Delivery confirmation

### 5. Location Service

**Responsibilities:**
- Real-time location tracking
- Geocoding
- Distance calculation
- Location-based services

**Key Features:**
- GPS tracking
- Location updates
- Geofencing
- Delivery zone validation

### 6. Warehouse Service

**Responsibilities:**
- Order fulfillment
- Picking and packing
- Inventory updates
- Warehouse operations

**Key Features:**
- Order picking list
- Packing instructions
- Inventory updates
- Fulfillment status

### 7. Payment Service

**Responsibilities:**
- Payment processing
- Payment gateway integration
- Refund management
- Payment history

**Key Features:**
- Multiple payment methods
- Payment status tracking
- Refund processing
- Payment reconciliation

### 8. Notification Service

**Responsibilities:**
- Push notifications
- SMS notifications
- Email notifications
- In-app notifications

**Key Features:**
- Order status updates
- Delivery updates
- Promotional messages
- Transactional notifications

---

## 📈 Data Flow

### Order Placement Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORDER PLACEMENT FLOW                       │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Adds Items to Cart
┌─────────┐
│  User   │───Add to Cart───┐
└─────────┘                 │
                            ▼
                   ┌────────────────┐
                   │ Product Service│
                   │ - Check stock  │
                   │ - Get price    │
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ Inventory      │
                   │ Service        │
                   │ - Reserve stock│
                   └────────────────┘

Step 2: User Places Order
┌─────────┐
│  User   │───Place Order───┐
└─────────┘                 │
                            ▼
                   ┌────────────────┐
                   │  Order Service │
                   │                │
                   │  1. Validate   │
                   │  2. Create Order│
                   │  3. Reserve Inventory│
                   └────────┬───────┘
                            │
                            ├─→ Inventory Service
                            │   (Reserve items)
                            │
                            ├─→ Payment Service
                            │   (Process payment)
                            │
                            └─→ Publish Event (Kafka)
                                "order_created"

Step 3: Order Assignment
┌─────────────────┐
│  Kafka Consumer │←───order_created event
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      Delivery Service                    │
│                                         │
│  1. Get user location                   │
│  2. Find nearest warehouse              │
│  3. Find available delivery partner     │
│  4. Assign order                       │
│  5. Calculate route                    │
│  6. Calculate ETA                      │
└────────┬────────────────────────────────┘
         │
         ├─→ Location Service
         │   (Get user location)
         │
         ├─→ Warehouse Service
         │   (Find nearest warehouse)
         │
         └─→ Update Order Status
             (assigned → preparing)

Step 4: Warehouse Fulfillment
┌─────────────────┐
│ Warehouse App   │───Order Received───┐
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────────────────────────┐
│    Warehouse Service                 │
│                                     │
│  1. Generate picking list          │
│  2. Assign to picker               │
│  3. Update status (picking)        │
│  4. Update status (packed)         │
│  5. Handover to delivery partner   │
└────────┬────────────────────────────┘
         │
         └─→ Update Order Status
             (preparing → ready_for_pickup)

Step 5: Delivery
┌─────────────────┐
│ Delivery Partner│───Pick Order───┐
└────────┬────────┘               │
         │                        │
         ▼                        │
┌─────────────────────────────────┐
│    Delivery Service              │
│                                 │
│  1. Update status (out_for_delivery)│
│  2. Start location tracking     │
│  3. Calculate route             │
│  4. Update ETA                  │
│  5. Mark delivered              │
└────────┬─────────────────────────┘
         │
         └─→ Update Order Status
             (out_for_delivery → delivered)
```

### Real-time Tracking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME TRACKING FLOW                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Delivery Partner│───Location Update (every 5s)───┐
│     App         │                                │
└─────────────────┘                                │
                                                  ▼
                                         ┌────────────────┐
                                         │ Location       │
                                         │ Service        │
                                         └────────┬───────┘
                                                  │
                                                  ├─→ Store in TimescaleDB
                                                  │
                                                  └─→ Publish Event (Kafka)
                                                      "location_updated"
                                                  │
                                                  ▼
                                         ┌────────────────┐
                                         │ WebSocket      │
                                         │ Server         │
                                         └────────┬───────┘
                                                  │
                                                  │ Broadcast to User
                                                  │
                                                  ▼
                                         ┌─────────┐
                                         │  User   │───See real-time location
                                         │  App    │
                                         └─────────┘
```

---

## 🗄️ Database Design

### PostgreSQL Schema

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    unit VARCHAR(50), -- kg, piece, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Warehouses Table
```sql
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    service_radius INTEGER, -- in meters
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Inventory Table
```sql
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, product_id)
);

CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
```

#### Orders Table
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    delivery_partner_id INTEGER,
    
    -- Order Details
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    
    -- Address
    delivery_address TEXT NOT NULL,
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', 
    -- pending, confirmed, preparing, ready_for_pickup, 
    -- out_for_delivery, delivered, cancelled
    
    -- Payment
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    -- pending, paid, failed, refunded
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    prepared_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- ETA
    estimated_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_warehouse ON orders(warehouse_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(20) REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

#### Delivery Partners Table
```sql
CREATE TABLE delivery_partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50), -- bike, bicycle
    vehicle_number VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    current_order_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_partners_available ON delivery_partners(is_available);
CREATE INDEX idx_delivery_partners_location ON delivery_partners(current_latitude, current_longitude);
```

### Redis Schema (Caching)

**Key Patterns:**
- `inventory:{warehouse_id}:{product_id}` - Real-time inventory cache
- `order:{order_id}` - Order details cache
- `user:{user_id}:cart` - User cart cache
- `warehouse:{warehouse_id}:products` - Warehouse product list
- `delivery_partner:{partner_id}:location` - Partner location cache
- `order:{order_id}:tracking` - Order tracking data

### TimescaleDB Schema (Location Tracking)

```sql
-- Location tracking time-series data
CREATE TABLE location_updates (
    time TIMESTAMPTZ NOT NULL,
    delivery_partner_id INTEGER NOT NULL,
    order_id VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    speed DECIMAL(5, 2),
    heading DECIMAL(5, 2)
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('location_updates', 'time');

CREATE INDEX idx_location_partner ON location_updates(delivery_partner_id, time DESC);
CREATE INDEX idx_location_order ON location_updates(order_id, time DESC);
```

---

## 🎯 Key Challenges & Solutions

### Challenge 1: Real-time Inventory Management

**Problem:**
- Multiple users ordering same product simultaneously
- Stock overselling
- Inventory sync across warehouses

**Solution:**
- **Optimistic Locking**: Version-based updates
- **Reservation System**: Reserve inventory on cart, confirm on order
- **Redis for Hot Data**: Cache frequently accessed inventory
- **Event-Driven Updates**: Kafka events for inventory sync

```javascript
// Inventory Reservation
async function reserveInventory(warehouseId, productId, quantity) {
  const key = `inventory:${warehouseId}:${productId}`;
  
  // Use Redis atomic operations
  const result = await redis.eval(`
    local current = redis.call('GET', KEYS[1])
    if current and tonumber(current) >= tonumber(ARGV[1]) then
      return redis.call('DECRBY', KEYS[1], ARGV[1])
    else
      return nil
    end
  `, 1, key, quantity);
  
  if (result === null) {
    throw new Error('Insufficient stock');
  }
  
  return result;
}
```

### Challenge 2: Delivery Partner Assignment

**Problem:**
- Find nearest available partner
- Consider current load
- Optimize for multiple orders

**Solution:**
- **Geospatial Indexing**: Use PostGIS or Redis Geo
- **Scoring Algorithm**: Distance + availability + load
- **Batch Assignment**: Assign multiple orders together
- **Real-time Location**: Track partner location continuously

```javascript
// Partner Assignment Algorithm
async function assignDeliveryPartner(order) {
  const warehouse = await getWarehouse(order.warehouse_id);
  
  // Find available partners within radius
  const partners = await redis.georadius(
    'delivery_partners:available',
    warehouse.longitude,
    warehouse.latitude,
    5000, // 5km radius
    'm',
    'WITHCOORD',
    'WITHDIST'
  );
  
  // Score partners
  const scoredPartners = partners.map(partner => ({
    id: partner.id,
    distance: partner.dist,
    currentLoad: partner.current_orders_count,
    score: calculateScore(partner.dist, partner.currentLoad)
  }));
  
  // Select best partner
  const bestPartner = scoredPartners.sort((a, b) => a.score - b.score)[0];
  
  return bestPartner;
}

function calculateScore(distance, load) {
  return (distance * 0.6) + (load * 1000 * 0.4);
}
```

### Challenge 3: Route Optimization

**Problem:**
- Multiple delivery stops
- Traffic conditions
- Time constraints

**Solution:**
- **OSRM/Google Maps API**: For route calculation
- **TSP Algorithm**: Traveling Salesman Problem for multiple stops
- **Real-time Traffic**: Integrate traffic data
- **Caching**: Cache common routes

### Challenge 4: Real-time Tracking

**Problem:**
- High frequency location updates
- Low latency requirements
- Scale to millions of concurrent users

**Solution:**
- **WebSocket**: For real-time updates
- **TimescaleDB**: For time-series location data
- **Redis Pub/Sub**: For broadcasting updates
- **Geofencing**: For automatic status updates

```javascript
// Real-time Location Update
async function updateLocation(partnerId, lat, lng) {
  // Store in TimescaleDB
  await timescaleDB.query(`
    INSERT INTO location_updates 
    (time, delivery_partner_id, latitude, longitude)
    VALUES (NOW(), $1, $2, $3)
  `, [partnerId, lat, lng]);
  
  // Update Redis cache
  await redis.setex(
    `delivery_partner:${partnerId}:location`,
    60,
    JSON.stringify({ lat, lng, time: Date.now() })
  );
  
  // Publish to WebSocket
  await redis.publish(
    `partner:${partnerId}:location`,
    JSON.stringify({ lat, lng })
  );
}
```

### Challenge 5: Order Fulfillment Speed

**Problem:**
- 10-minute delivery promise
- Warehouse picking time
- Delivery time

**Solution:**
- **Dark Stores**: Small warehouses in residential areas
- **Pre-positioning**: Keep popular items ready
- **Optimized Layout**: Fast-moving items near packing area
- **Parallel Processing**: Pick and pack simultaneously
- **Predictive Analytics**: Pre-allocate based on trends

### Challenge 6: Peak Load Handling

**Problem:**
- Rush hours (lunch, dinner)
- Festival seasons
- Flash sales

**Solution:**
- **Auto-scaling**: Scale services based on load
- **Queue Management**: Queue orders during peak
- **Surge Pricing**: Dynamic delivery fees
- **Partner Pool**: Maintain reserve partner pool
- **Load Balancing**: Distribute load across warehouses

---

## 🚀 Technology Stack

### Backend
- **Runtime**: Node.js / Go
- **Framework**: Express.js / Fastify
- **Language**: TypeScript

### Databases
- **PostgreSQL**: Primary database (orders, users, products)
- **Redis**: Caching, sessions, real-time data
- **TimescaleDB**: Location tracking (time-series)
- **MongoDB**: Product catalog (flexible schema)
- **Elasticsearch**: Product search

### Message Queue
- **Apache Kafka**: Event streaming
- **Redis Pub/Sub**: Real-time notifications

### Real-time
- **WebSocket**: Socket.io for tracking
- **Server-Sent Events**: For order updates

### External Services
- **Payment Gateway**: Razorpay, Stripe
- **Maps API**: Google Maps, OSRM
- **SMS/Email**: Twilio, SendGrid

### Infrastructure
- **Docker**: Containerization
- **Kubernetes**: Orchestration
- **AWS/GCP**: Cloud platform
- **CDN**: CloudFront/Cloudflare

---

## 📊 Scalability Considerations

### Horizontal Scaling
- Stateless services (add more instances)
- Database read replicas
- Cache clusters
- Message queue partitions

### Caching Strategy
- **L1 Cache**: In-memory (Node.js)
- **L2 Cache**: Redis
- **L3 Cache**: CDN (static assets)

### Database Optimization
- Indexing on frequently queried fields
- Partitioning for large tables
- Read replicas for read-heavy operations
- Connection pooling

### Load Balancing
- API Gateway for request routing
- Round-robin / Least connections
- Health checks
- Auto-scaling groups

---

## 🎯 Key Metrics to Monitor

1. **Order Metrics**
   - Orders per minute
   - Average order value
   - Order completion rate
   - Cancellation rate

2. **Delivery Metrics**
   - Average delivery time
   - On-time delivery rate
   - Delivery partner utilization
   - ETA accuracy

3. **Inventory Metrics**
   - Stock accuracy
   - Out-of-stock rate
   - Inventory turnover

4. **System Metrics**
   - API response time
   - Error rate
   - System uptime
   - Database query performance

---

## 🔐 Security Considerations

1. **Authentication**: JWT tokens, OTP verification
2. **Authorization**: Role-based access control
3. **Data Encryption**: HTTPS, encrypted storage
4. **Payment Security**: PCI DSS compliance
5. **Location Privacy**: Anonymize location data
6. **Rate Limiting**: Prevent abuse

---

## 📝 Summary

### Key Components
1. **Product Service** - Catalog management
2. **Inventory Service** - Real-time stock
3. **Order Service** - Order management
4. **Delivery Service** - Partner assignment
5. **Location Service** - Real-time tracking
6. **Warehouse Service** - Fulfillment
7. **Payment Service** - Payment processing
8. **Notification Service** - User notifications

### Key Challenges
1. Real-time inventory management
2. Delivery partner assignment
3. Route optimization
4. Real-time tracking
5. Order fulfillment speed
6. Peak load handling

### Architecture Pattern
- **Microservices**: Independent services
- **Event-Driven**: Kafka for async communication
- **CQRS**: Separate read/write models
- **API Gateway**: Single entry point
- **Service Discovery**: For service communication

---

**End of High-Level Design**

