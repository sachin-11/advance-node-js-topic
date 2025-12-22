# OOP Principles (SOLID) aur Design Patterns (Hindi Explanation)

## 1. SOLID Principles
SOLID 5 design principles ka ek group hai jo software design ko samajhne mein aasaan, flexible aur maintainable banata hai.

### S - Single Responsibility Principle (SRP)
**Definition:** Ek class (ya function/module) ke paas change hone ka sirf ek hi reason hona chahiye. Matlab, uska sirf **ek hi kaam** hona chahiye.

**Kyun?** Agar ek class bahut saare kaam karegi, toh ek cheez change karne se doosri cheez toot sakti hai.

**Example (Galat Tarika - Violation):**
```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  saveToDatabase() {
    // Database logic yahan hai... ❌ Galat: Data ko save karne ka logic yahan nahi hona chahiye
    console.log(`Saving ${this.name} to DB`);
  }

  sendWelcomeEmail() {
    // Email logic yahan hai... ❌ Galat: Email bhejne ka kaam alag service ka hai
    console.log(`Sending email to ${this.email}`);
  }
}
```

**Example (Sahi Tarika - Correct):**
Kaam ko alag-alag classes mein baant do.
```javascript
// 1. Data handling (Sirf data maintain karega)
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

// 2. Database management (Sirf DB ka kaam karega)
class UserRepository {
  save(user) {
    console.log(`Saving ${user.name} to DB`);
  }
}

// 3. Email service (Sirf Email ka kaam karega)
class EmailService {
  sendWelcome(user) {
    console.log(`Sending email to ${user.email}`);
  }
}
```

### O - Open/Closed Principle (OCP)
**Definition:** Software entities extension ke liye **open** honi chahiye, lekin modification ke liye **closed**.

**Matlab:** Aapko purane code ko change kiye bina naya feature add kar paana chahiye.

**Real-Life Analogy:**
Jaise ek **Power Socket (Plug Point)**:
- ✅ **Open for Extension**: Aap naye devices (phone, laptop, fan) plug kar sakte hain
- ✅ **Closed for Modification**: Socket ka design change nahi karna padta

---

## 📱 Real-Life Example 1: Payment Gateway Integration

### ❌ Galat Tarika (Violation):

```javascript
class PaymentProcessor {
  processPayment(amount, paymentType) {
    if (paymentType === 'credit_card') {
      // Credit card logic
      console.log(`Processing ₹${amount} via Credit Card`);
      // Call credit card API...
    } else if (paymentType === 'debit_card') {
      // Debit card logic
      console.log(`Processing ₹${amount} via Debit Card`);
      // Call debit card API...
    } else if (paymentType === 'upi') {
      // UPI logic
      console.log(`Processing ₹${amount} via UPI`);
      // Call UPI API...
    }
    // ❌ Problem: Naya payment method (PayPal) add karne ke liye
    //    is class ko edit karna padega!
  }
}

// Usage
const processor = new PaymentProcessor();
processor.processPayment(1000, 'credit_card');
processor.processPayment(500, 'upi');

// ❌ PayPal add karne ke liye class ko modify karna padega!
```

### ✅ Sahi Tarika (Correct):

```javascript
// Base class - Extension ke liye open, modification ke liye closed
class PaymentMethod {
  process(amount) {
    throw new Error('process method must be implemented');
  }
}

// Credit Card implementation
class CreditCardPayment extends PaymentMethod {
  process(amount) {
    console.log(`Processing ₹${amount} via Credit Card`);
    // Credit card specific logic
    return { success: true, transactionId: 'CC_123' };
  }
}

// UPI implementation
class UPIPayment extends PaymentMethod {
  process(amount) {
    console.log(`Processing ₹${amount} via UPI`);
    // UPI specific logic
    return { success: true, transactionId: 'UPI_456' };
  }
}

// Debit Card implementation
class DebitCardPayment extends PaymentMethod {
  process(amount) {
    console.log(`Processing ₹${amount} via Debit Card`);
    // Debit card specific logic
    return { success: true, transactionId: 'DC_789' };
  }
}

// Payment Processor - Ab yeh class change nahi hogi!
class PaymentProcessor {
  processPayment(paymentMethod, amount) {
    // ✅ Koi bhi naya payment method aaye, yeh code change nahi hoga!
    return paymentMethod.process(amount);
  }
}

// Usage
const processor = new PaymentProcessor();

// Existing methods
processor.processPayment(new CreditCardPayment(), 1000);
processor.processPayment(new UPIPayment(), 500);

// ✅ Naya method add karna - BINA PURANE CODE KO CHANGE KIYE!
class PayPalPayment extends PaymentMethod {
  process(amount) {
    console.log(`Processing ₹${amount} via PayPal`);
    // PayPal specific logic
    return { success: true, transactionId: 'PP_999' };
  }
}

// Ab PayPal bhi use kar sakte hain - purana code change nahi hua!
processor.processPayment(new PayPalPayment(), 2000);
```

**Fayda:** 
- ✅ Naya payment method add karne ke liye purane code ko touch nahi karna padega
- ✅ Purane code mein bug nahi aayega
- ✅ Testing aasaan hai

---

## 🚗 Real-Life Example 2: Vehicle Insurance Calculator

### ❌ Galat Tarika:

```javascript
class InsuranceCalculator {
  calculatePremium(vehicle) {
    if (vehicle.type === 'car') {
      return vehicle.value * 0.05; // 5% of car value
    } else if (vehicle.type === 'bike') {
      return vehicle.value * 0.03; // 3% of bike value
    } else if (vehicle.type === 'truck') {
      return vehicle.value * 0.08; // 8% of truck value
    }
    // ❌ Naya vehicle (scooter) add karne ke liye yahan edit karna padega!
  }
}

const calculator = new InsuranceCalculator();
console.log(calculator.calculatePremium({ type: 'car', value: 500000 }));
// Output: 25000
```

### ✅ Sahi Tarika:

```javascript
// Base class
class Vehicle {
  constructor(value) {
    this.value = value;
  }
  
  calculatePremium() {
    throw new Error('calculatePremium must be implemented');
  }
}

// Car implementation
class Car extends Vehicle {
  calculatePremium() {
    return this.value * 0.05; // 5%
  }
}

// Bike implementation
class Bike extends Vehicle {
  calculatePremium() {
    return this.value * 0.03; // 3%
  }
}

// Truck implementation
class Truck extends Vehicle {
  calculatePremium() {
    return this.value * 0.08; // 8%
  }
}

// Calculator - Ab yeh class change nahi hogi!
class InsuranceCalculator {
  calculatePremium(vehicle) {
    // ✅ Koi bhi naya vehicle aaye, yeh code change nahi hoga!
    return vehicle.calculatePremium();
  }
}

// Usage
const calculator = new InsuranceCalculator();

const car = new Car(500000);
const bike = new Bike(100000);
const truck = new Truck(2000000);

console.log(calculator.calculatePremium(car));   // 25000
console.log(calculator.calculatePremium(bike));  // 3000
console.log(calculator.calculatePremium(truck));  // 160000

// ✅ Naya vehicle add karna - BINA PURANE CODE KO CHANGE KIYE!
class Scooter extends Vehicle {
  calculatePremium() {
    return this.value * 0.025; // 2.5%
  }
}

const scooter = new Scooter(80000);
console.log(calculator.calculatePremium(scooter)); // 2000
// Purana calculator code change nahi hua! ✅
```

---

## 🎮 Real-Life Example 3: Game Character System

### ❌ Galat Tarika:

```javascript
class Game {
  attack(character) {
    if (character.type === 'warrior') {
      return character.strength * 2;
    } else if (character.type === 'mage') {
      return character.magic * 1.5;
    } else if (character.type === 'archer') {
      return character.agility * 1.8;
    }
    // ❌ Naya character (ninja) add karne ke liye yahan edit karna padega!
  }
}
```

### ✅ Sahi Tarika:

```javascript
// Base class
class Character {
  attack() {
    throw new Error('attack method must be implemented');
  }
}

// Warrior
class Warrior extends Character {
  constructor(strength) {
    super();
    this.strength = strength;
  }
  
  attack() {
    return this.strength * 2;
  }
}

// Mage
class Mage extends Character {
  constructor(magic) {
    super();
    this.magic = magic;
  }
  
  attack() {
    return this.magic * 1.5;
  }
}

// Archer
class Archer extends Character {
  constructor(agility) {
    super();
    this.agility = agility;
  }
  
  attack() {
    return this.agility * 1.8;
  }
}

// Game - Ab yeh class change nahi hogi!
class Game {
  performAttack(character) {
    // ✅ Koi bhi naya character aaye, yeh code change nahi hoga!
    return character.attack();
  }
}

// Usage
const game = new Game();
const warrior = new Warrior(100);
const mage = new Mage(80);

console.log(game.performAttack(warrior)); // 200
console.log(game.performAttack(mage));    // 120

// ✅ Naya character add karna - BINA PURANE CODE KO CHANGE KIYE!
class Ninja extends Character {
  constructor(speed, stealth) {
    super();
    this.speed = speed;
    this.stealth = stealth;
  }
  
  attack() {
    return (this.speed + this.stealth) * 1.2;
  }
}

const ninja = new Ninja(90, 70);
console.log(game.performAttack(ninja)); // 192
// Purana game code change nahi hua! ✅
```

---

## 💡 Key Points (Mukhy Baatein)

### Open for Extension:
- ✅ Naye classes add kar sakte hain (extend)
- ✅ Naye features add kar sakte hain
- ✅ Naye implementations add kar sakte hain

### Closed for Modification:
- ✅ Purane code ko change nahi karna padta
- ✅ Purane code mein bug nahi aayega
- ✅ Testing aasaan hai

### Real-World Analogy:
```
🔌 Power Socket:
- Open: Naye devices plug kar sakte hain (extension)
- Closed: Socket ka design change nahi hota (modification)

🚪 Door:
- Open: Naye locks lagaye ja sakte hain (extension)
- Closed: Door frame change nahi hota (modification)
```

---

## 🎯 Summary

**OCP ka matlab:**
1. **Extension ke liye Open**: Naye features add kar sakte hain
2. **Modification ke liye Closed**: Purane code ko change nahi karna padta

**Kaise implement karein:**
- Base class/interface banao
- Har naya feature ek nayi class bana kar extend karo
- Main class ko generic rakho (polymorphism use karo)

**Fayde:**
- ✅ Code maintainable rehta hai
- ✅ Bugs kam aate hain
- ✅ Testing aasaan hai
- ✅ Team mein parallel kaam kar sakte hain

### L - Liskov Substitution Principle (LSP)
**Definition:** Child class ko apne Parent class ki jagah bina kisi problem ke use kiya jaana chahiye.

**Matlab:** Inheritance sahi tarike se use hona chahiye. Aisa nahi hona chahiye ki Child class Parent ka behavior tod de.

**Example (Galat Tarika):**
Penguin Bird hai, par udd (fly) nahi sakti. Agar hum `Bird` class mein `fly()` method rakh dein, toh Penguin usse use karke error dega.
```javascript
class Bird {
  fly() { console.log("I can fly"); }
}

class Penguin extends Bird {
  fly() {
    throw new Error("Cannot fly!"); // ❌ Galat: Parent ka behavior tod diya
  }
}
```

**Sudhaar:** `FlyingBird` aur `SwimmingBird` alag banao.

### I - Interface Segregation Principle (ISP)
**Definition:** Clients ko wo methods implement karne ke liye majboor nahi karna chahiye jo wo use nahi karte.

**JS Note:** JS mein Interfaces nahi hote, par iska matlab hai ki badi "God Classes" na banao jisme sab kuch ho. Choti classes ya composition use karo.

**Example (Galat):**
Ek `Entity` class jisme `fly()`, `swim()`, `walk()` sab hai. Ab ek `Dog` class ko `fly()` method bhi zabardasti milega jo wo use nahi karega.

### D - Dependency Inversion Principle (DIP)
**Definition:** High-level modules ko low-level modules par depend nahi karna chahiye. Dono ko abstractions par depend karna chahiye.

**Matlab:** Seedha database (MySQL) connect mat karo, balki ek general interface ke through connect karo taaki kal ko MongoDB use karna ho toh code change na karna pade.

**Example (Sahi Tarika - Dependency Injection):**
`UserController` ko `new MySQLDatabase()` mat karne do. Use bahar se pass karo.

```javascript
class UserController {
  constructor(database) {
    this.db = database; // ✅ Ab hum MySQL dein ya Mongo, isse fark nahi padta.
  }
}
```

---

## 2. Design Patterns Introduction

**Design Patterns kya hain?**
Ye software design mein aane wali common problems ke bane-banaye solutions (blueprints) hain. Jaise real life mein architecture mein standard designs hote hain (jaise ghar banane ka tarika), waise hi programming mein bhi proven solutions hote hain.

**Real-Life Analogy:**
Jaise ek **Architect** ghar banane ke liye ek blueprint use karta hai jo pehle se test ho chuka hai, waise hi **Developer** bhi code likhne ke liye proven patterns use karta hai.

**Kyun use karein?**
1.  **Proven Solutions:** Ye solutions hazaron developers dwara test kiye gaye hain. Aapko khud se sochna nahi padta.
2.  **Common Language:** Team mein baat karna aasaan hota hai. (Jaise: "Yahan Singleton laga do" - sabko pata hai kya karna hai).
3.  **Maintainability:** Code saaf aur manage karne layak rehta hai.
4. **Time Saving:** Common problems ke liye ready-made solutions.

**Types of Design Patterns:**
- **Creational Patterns**: Objects kaise banayein (Singleton, Factory)
- **Structural Patterns**: Objects ko kaise organize karein (Adapter, Decorator)
- **Behavioral Patterns**: Objects kaise communicate karein (Observer, Strategy)

---

## 3. Singleton Pattern

**Maqsad (Goal):** Class ka pure application mein **sirf ek hi instance** (object) hona chahiye aur sab jagah wahi use hona chahiye.

**Real-Life Analogy:**
Jaise ek **Company ka CEO** sirf ek hi hota hai, sab jagah wahi CEO hota hai. Ya ek **Country ka Prime Minister** sirf ek hi hota hai.

### ❌ Problem (Bina Singleton):

```javascript
// database.js
class Database {
  constructor() {
    this.connection = "New Connection";
    console.log("Creating new database connection...");
  }
}

// Har baar naya connection banta hai - Waste of resources!
const db1 = new Database(); // "Creating new database connection..."
const db2 = new Database(); // "Creating new database connection..."
const db3 = new Database(); // "Creating new database connection..."

console.log(db1 === db2); // false (Dono alag hain!)
// ❌ Problem: 3 connections ban gaye, jabki ek hi chahiye!
```

### ✅ Solution (With Singleton):

```javascript
// database.js
class Database {
  constructor() {
    // Agar pehle se instance hai, wahi return kar do
    if (Database.instance) {
      console.log("Returning existing database connection");
      return Database.instance;
    }
    
    // Pehli baar hi connection banao
    console.log("Creating new database connection...");
    this.connection = "Active Connection";
    this.connectedAt = new Date();
    
    // Instance ko store kar lo
    Database.instance = this;
  }

  query(sql) {
    console.log(`Executing: ${sql}`);
    return { data: "result" };
  }
}

// Usage
const db1 = new Database(); // "Creating new database connection..."
const db2 = new Database(); // "Returning existing database connection"
const db3 = new Database(); // "Returning existing database connection"

console.log(db1 === db2); // true ✅ (Dono same hain!)
console.log(db2 === db3); // true ✅ (Sab same hain!)

// Sab same connection use kar rahe hain!
db1.query("SELECT * FROM users");
db2.query("SELECT * FROM products");
// Dono same connection use kar rahe hain!
```

### 📱 Real-Life Example: Configuration Manager

```javascript
// config.js - Application ka configuration sirf ek baar load hona chahiye
class ConfigManager {
  constructor() {
    if (ConfigManager.instance) {
      return ConfigManager.instance;
    }
    
    // Configuration load karo (expensive operation)
    this.settings = {
      apiKey: process.env.API_KEY,
      databaseUrl: process.env.DB_URL,
      port: process.env.PORT || 3000
    };
    
    console.log("Configuration loaded");
    ConfigManager.instance = this;
  }

  get(key) {
    return this.settings[key];
  }
}

// Usage - Har jagah same config use hoga
const config1 = new ConfigManager(); // "Configuration loaded"
const config2 = new ConfigManager(); // Returns existing

console.log(config1 === config2); // true ✅
console.log(config1.get('port')); // 3000
console.log(config2.get('port')); // 3000 (same instance)
```

### 🗄️ Real-Life Example: Database Connection Pool

```javascript
// dbConnection.js
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    
    // Expensive operation - sirf ek baar karo
    this.pool = {
      maxConnections: 10,
      activeConnections: 0,
      connections: []
    };
    
    console.log("Database connection pool created");
    DatabaseConnection.instance = this;
  }

  getConnection() {
    if (this.pool.activeConnections < this.pool.maxConnections) {
      this.pool.activeConnections++;
      return { id: this.pool.activeConnections, status: 'active' };
    }
    throw new Error("Connection pool exhausted");
  }
}

// Usage
const db1 = new DatabaseConnection();
const db2 = new DatabaseConnection();
const db3 = new DatabaseConnection();

console.log(db1 === db2 && db2 === db3); // true ✅
// Sab same connection pool use kar rahe hain!
```

### Node.js Mein Natural Singleton

```javascript
// database.js
class Database {
  constructor() {
    this.connection = "Connected";
  }
  
  query(sql) {
    return `Result of: ${sql}`;
  }
}

// Node.js mein module cache hota hai
// Jab aap require() karte ho, same instance return hota hai
module.exports = new Database(); // ✅ Already singleton!

// Usage in other files
// file1.js
const db = require('./database');
db.query("SELECT * FROM users");

// file2.js
const db = require('./database'); // Same instance!
db.query("SELECT * FROM products");
```

### ✅ Use Cases:
- ✅ **Database Connection**: Ek hi connection reuse karo
- ✅ **Configuration**: Settings ek baar load karo
- ✅ **Logger**: Ek hi logger instance
- ✅ **Cache Manager**: Ek hi cache instance
- ✅ **File Manager**: Ek hi file handler

### ❌ Avoid When:
- ❌ Multiple instances chahiye ho
- ❌ Testing mein mock objects chahiye ho
- ❌ Thread safety zaroori ho (Node.js mein usually nahi)

---

## 4. Factory Pattern

**Maqsad (Goal):** Object banane ka process encapsulate (chupa) karna. Hamein exactly class ka naam batane ki zaroorat nahi honi chahiye, bas type batao aur object mil jaye.

**Real-Life Analogy:**
Jaise ek **Car Factory** mein aap bolte ho "Mujhe ek car chahiye", factory aapko car de deti hai. Aapko yeh nahi batana padta ki engine kaise lagana hai, body kaise banana hai - factory sab handle karti hai.

### ❌ Problem (Bina Factory):

```javascript
// Direct object creation - Complex logic har jagah repeat hota hai
class Car {
  constructor(type) {
    this.type = type;
    this.engine = type === 'sports' ? 'V8' : 'V4';
    this.color = type === 'sports' ? 'red' : 'blue';
  }
}

class Truck {
  constructor(type) {
    this.type = type;
    this.engine = 'V12';
    this.capacity = type === 'heavy' ? 10000 : 5000;
  }
}

// Har jagah complex logic repeat karna padta hai
const sportsCar = new Car('sports');
const truck = new Truck('heavy');
// ❌ Problem: Object creation logic har jagah scattered hai
```

### ✅ Solution (With Factory):

```javascript
// Base Vehicle class
class Vehicle {
  drive() {
    throw new Error('drive method must be implemented');
  }
}

// Car implementation
class Car extends Vehicle {
  constructor(type) {
    super();
    this.type = 'Car';
    this.engine = type === 'sports' ? 'V8' : 'V4';
    this.color = type === 'sports' ? 'red' : 'blue';
  }
  
  drive() {
    console.log(`Driving ${this.color} car with ${this.engine} engine`);
  }
}

// Truck implementation
class Truck extends Vehicle {
  constructor(type) {
    super();
    this.type = 'Truck';
    this.engine = 'V12';
    this.capacity = type === 'heavy' ? 10000 : 5000;
  }
  
  drive() {
    console.log(`Driving truck with ${this.capacity}kg capacity`);
  }
}

// Bike implementation
class Bike extends Vehicle {
  constructor(type) {
    super();
    this.type = 'Bike';
    this.cc = type === 'sports' ? 1000 : 250;
  }
  
  drive() {
    console.log(`Riding ${this.cc}cc bike`);
  }
}

// ✅ Factory - Object creation logic yahan centralize hai
class VehicleFactory {
  createVehicle(vehicleType, subType = 'standard') {
    // Object creation logic ek jagah hai
    switch(vehicleType.toLowerCase()) {
      case 'car':
        return new Car(subType);
      
      case 'truck':
        return new Truck(subType);
      
      case 'bike':
        return new Bike(subType);
      
      default:
        throw new Error(`Unknown vehicle type: ${vehicleType}`);
    }
  }
}

// Usage - Simple aur clean!
const factory = new VehicleFactory();

const car = factory.createVehicle('car', 'sports');
car.drive(); // "Driving red car with V8 engine"

const truck = factory.createVehicle('truck', 'heavy');
truck.drive(); // "Driving truck with 10000kg capacity"

const bike = factory.createVehicle('bike', 'sports');
bike.drive(); // "Riding 1000cc bike"

// ✅ Naya vehicle add karna - Factory ko extend karo, client code change nahi!
```

### 📱 Real-Life Example 1: Notification Factory

```javascript
// Base Notification class
class Notification {
  send(message) {
    throw new Error('send method must be implemented');
  }
}

// Email Notification
class EmailNotification extends Notification {
  send(message) {
    console.log(`📧 Sending email: ${message}`);
    // Email sending logic
  }
}

// SMS Notification
class SMSNotification extends Notification {
  send(message) {
    console.log(`📱 Sending SMS: ${message}`);
    // SMS sending logic
  }
}

// Push Notification
class PushNotification extends Notification {
  send(message) {
    console.log(`🔔 Sending push: ${message}`);
    // Push notification logic
  }
}

// WhatsApp Notification
class WhatsAppNotification extends Notification {
  send(message) {
    console.log(`💬 Sending WhatsApp: ${message}`);
    // WhatsApp API logic
  }
}

// ✅ Notification Factory
class NotificationFactory {
  createNotification(type) {
    switch(type.toLowerCase()) {
      case 'email':
        return new EmailNotification();
      
      case 'sms':
        return new SMSNotification();
      
      case 'push':
        return new PushNotification();
      
      case 'whatsapp':
        return new WhatsAppNotification();
      
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}

// Usage - Simple!
const factory = new NotificationFactory();

// User preference ke hisaab se notification banao
const userPreference = 'email';
const notification = factory.createNotification(userPreference);
notification.send("Your order has been confirmed!");

// Ya multiple notifications
const notifications = ['email', 'sms', 'push'].map(
  type => factory.createNotification(type)
);

notifications.forEach(notif => {
  notif.send("Important update!");
});
```

### 🍕 Real-Life Example 2: Pizza Factory

```javascript
// Base Pizza class
class Pizza {
  prepare() {
    throw new Error('prepare method must be implemented');
  }
  
  bake() {
    console.log("Baking pizza...");
  }
  
  cut() {
    console.log("Cutting pizza...");
  }
  
  box() {
    console.log("Boxing pizza...");
  }
}

// Margherita Pizza
class MargheritaPizza extends Pizza {
  prepare() {
    console.log("Preparing Margherita: Tomato sauce, Mozzarella, Basil");
  }
}

// Pepperoni Pizza
class PepperoniPizza extends Pizza {
  prepare() {
    console.log("Preparing Pepperoni: Tomato sauce, Mozzarella, Pepperoni");
  }
}

// Veggie Pizza
class VeggiePizza extends Pizza {
  prepare() {
    console.log("Preparing Veggie: Tomato sauce, Mozzarella, Vegetables");
  }
}

// ✅ Pizza Factory
class PizzaFactory {
  createPizza(type) {
    let pizza;
    
    switch(type.toLowerCase()) {
      case 'margherita':
        pizza = new MargheritaPizza();
        break;
      
      case 'pepperoni':
        pizza = new PepperoniPizza();
        break;
      
      case 'veggie':
        pizza = new VeggiePizza();
        break;
      
      default:
        throw new Error(`Unknown pizza type: ${type}`);
    }
    
    // Standard process
    pizza.prepare();
    pizza.bake();
    pizza.cut();
    pizza.box();
    
    return pizza;
  }
}

// Usage
const factory = new PizzaFactory();

// Customer order
const pizza1 = factory.createPizza('margherita');
// Output:
// "Preparing Margherita: Tomato sauce, Mozzarella, Basil"
// "Baking pizza..."
// "Cutting pizza..."
// "Boxing pizza..."

const pizza2 = factory.createPizza('pepperoni');
// Output:
// "Preparing Pepperoni: Tomato sauce, Mozzarella, Pepperoni"
// "Baking pizza..."
// ...
```

### 🎨 Real-Life Example 3: UI Component Factory

```javascript
// Base Button class
class Button {
  render() {
    throw new Error('render method must be implemented');
  }
}

// Primary Button
class PrimaryButton extends Button {
  constructor(text) {
    super();
    this.text = text;
    this.style = 'primary';
  }
  
  render() {
    return `<button class="btn btn-primary">${this.text}</button>`;
  }
}

// Secondary Button
class SecondaryButton extends Button {
  constructor(text) {
    super();
    this.text = text;
    this.style = 'secondary';
  }
  
  render() {
    return `<button class="btn btn-secondary">${this.text}</button>`;
  }
}

// Danger Button
class DangerButton extends Button {
  constructor(text) {
    super();
    this.text = text;
    this.style = 'danger';
  }
  
  render() {
    return `<button class="btn btn-danger">${this.text}</button>`;
  }
}

// ✅ Button Factory
class ButtonFactory {
  createButton(type, text) {
    switch(type.toLowerCase()) {
      case 'primary':
        return new PrimaryButton(text);
      
      case 'secondary':
        return new SecondaryButton(text);
      
      case 'danger':
        return new DangerButton(text);
      
      default:
        return new PrimaryButton(text); // Default
    }
  }
}

// Usage
const factory = new ButtonFactory();

const submitBtn = factory.createButton('primary', 'Submit');
const cancelBtn = factory.createButton('secondary', 'Cancel');
const deleteBtn = factory.createButton('danger', 'Delete');

console.log(submitBtn.render()); // <button class="btn btn-primary">Submit</button>
console.log(cancelBtn.render()); // <button class="btn btn-secondary">Cancel</button>
console.log(deleteBtn.render()); // <button class="btn btn-danger">Delete</button>
```

### 💡 Factory Pattern ke Fayde:

1. **Centralized Logic**: Object creation logic ek jagah hai
2. **Easy to Extend**: Naya type add karna aasaan hai
3. **Decoupling**: Client code ko exact class ka naam nahi pata
4. **Consistency**: Har object same process se banta hai

### 🎯 Factory Pattern Types:

#### 1. Simple Factory (Yeh humne upar dekha)
```javascript
class VehicleFactory {
  createVehicle(type) {
    if (type === 'car') return new Car();
    if (type === 'truck') return new Truck();
  }
}
```

#### 2. Factory Method (Har type ka apna factory)
```javascript
class CarFactory {
  create() {
    return new Car();
  }
}

class TruckFactory {
  create() {
    return new Truck();
  }
}
```

#### 3. Abstract Factory (Related objects ka group)
```javascript
class UIFactory {
  createButton() { }
  createInput() { }
  createDialog() { }
}

class WindowsUIFactory extends UIFactory {
  createButton() { return new WindowsButton(); }
  createInput() { return new WindowsInput(); }
}

class MacUIFactory extends UIFactory {
  createButton() { return new MacButton(); }
  createInput() { return new MacInput(); }
}
```

### ✅ Use Cases:
- ✅ **UI Components**: Buttons, inputs, dialogs
- ✅ **Database Drivers**: MySQL, PostgreSQL, MongoDB
- ✅ **Notification Systems**: Email, SMS, Push
- ✅ **File Formats**: PDF, Excel, CSV
- ✅ **Payment Methods**: Credit Card, UPI, PayPal

---

## 🎯 Summary

### Singleton Pattern:
- **Goal**: Ek hi instance
- **Use**: Database connection, Config, Logger
- **Analogy**: CEO, Prime Minister

### Factory Pattern:
- **Goal**: Object creation ko simplify karo
- **Use**: UI components, Notifications, Vehicles
- **Analogy**: Car Factory, Pizza Shop

**Dono patterns real-world problems solve karte hain aur code ko maintainable banate hain!**
