# Day 2: Database Tables Summary

## 📊 Total Tables Created: **8 Tables**

### Entity-Based Tables (8)

1. **`users`** - User information
   - Fields: id, phone, email, name, address, latitude, longitude, created_at
   - Relations: OneToMany with Orders

2. **`categories`** - Product categories
   - Fields: id, name, description, image_url, parent_id, is_active, created_at
   - Relations: OneToMany with Products, Self-referencing (parent-child)

3. **`products`** - Product catalog
   - Fields: id, name, description, category_id, price, image_url, unit, is_active, created_at
   - Relations: ManyToOne with Category, OneToMany with OrderItems & Inventories

4. **`warehouses`** - Warehouse locations
   - Fields: id, name, address, latitude, longitude, service_radius, is_active, created_at
   - Relations: OneToMany with Orders & Inventories

5. **`inventories`** - Stock management
   - Fields: id, warehouse_id, product_id, quantity, reserved_quantity, available_quantity, updated_at
   - Relations: ManyToOne with Warehouse & Product
   - Unique Constraint: (warehouse_id, product_id)

6. **`orders`** - Order management
   - Fields: id, order_id (unique), user_id, warehouse_id, delivery_partner_id, total_amount, delivery_fee, discount, final_amount, delivery_address, delivery_latitude, delivery_longitude, status, payment_method, payment_status, timestamps (created_at, confirmed_at, prepared_at, picked_up_at, delivered_at, cancelled_at), estimated_delivery_time, actual_delivery_time
   - Relations: ManyToOne with User, Warehouse, DeliveryPartner; OneToMany with OrderItems
   - Enums: OrderStatus, PaymentStatus

7. **`order_items`** - Order line items
   - Fields: id, order_id, product_id, quantity, price, total_price
   - Relations: ManyToOne with Order & Product

8. **`delivery_partners`** - Delivery partner information
   - Fields: id, name, phone, vehicle_type, vehicle_number, is_available, current_latitude, current_longitude, current_order_id, created_at
   - Relations: OneToMany with Orders

## 🔄 Additional Database Objects Created

### Enums (2)
- `orders_status_enum` - Order status values
- `orders_payment_status_enum` - Payment status values

### Indexes
- Unique index on `orders.order_id`
- Unique constraint on `users.phone`
- Unique constraint on `delivery_partners.phone`
- Unique constraint on `inventories(warehouse_id, product_id)`

### Foreign Keys
- Categories → Categories (self-reference for parent-child)
- Products → Categories
- OrderItems → Orders & Products
- Inventories → Warehouses & Products
- Orders → Users, Warehouses, DeliveryPartners

## 📝 Seeder vs Migration

### **Seeder (Seed Script)**
- **Purpose**: Initial data insert karta hai
- **Tables Create Karta Hai**: ❌ Nahi (sirf data insert karta hai)
- **Current Setup**: `synchronize: true` hai, isliye tables auto-create ho rahi hain
- **Data Inserted**:
  - 5 Categories
  - 3 Warehouses
  - 10 Products
  - 3 Users

### **Migration**
- **Purpose**: Database schema changes track karta hai
- **Tables Create Karta Hai**: ✅ Haan (schema define karta hai)
- **Current Setup**: Migrations directory ready hai, lekin abhi koi migration file nahi hai
- **Usage**: Production me migrations use karni chahiye

## 🎯 Summary

- **Total Tables**: 8
- **Total Enums**: 2
- **Seed Data**: 21 records (5 categories + 3 warehouses + 10 products + 3 users)
- **Relations**: 8 foreign key relationships

## 📋 Next Steps

1. ✅ Tables created via synchronize (development)
2. ⏭️ Create migrations for production use
3. ✅ Seed data loaded successfully

