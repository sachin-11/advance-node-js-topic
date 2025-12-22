# OOP Principles (SOLID) & Design Patterns

## 1. SOLID Principles
SOLID is an acronym for five design principles intended to make software designs more understandable, flexible, and maintainable.

### S - Single Responsibility Principle (SRP)
**Definition:** A class (or function/module) should have one, and only one, reason to change. Meaning, it should have only one job.

**Why?** If a class does too many things, changing one thing might break others.

**Example (Violation):**
```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  saveToDatabase() {
    // Database logic here... ❌ Violation: Mixing data with persistence
    console.log(`Saving ${this.name} to DB`);
  }

  sendWelcomeEmail() {
    // Email logic here... ❌ Violation: Mixing data with email service
    console.log(`Sending email to ${this.email}`);
  }
}
```

**Example (Correct):**
```javascript
// 1. Data handling
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

// 2. Database management
class UserRepository {
  save(user) {
    console.log(`Saving ${user.name} to DB`);
  }
}

// 3. Email service
class EmailService {
  sendWelcome(user) {
    console.log(`Sending email to ${user.email}`);
  }
}
```

### O - Open/Closed Principle (OCP)
**Definition:** Software entities should be **open for extension**, but **closed for modification**.

**Why?** You should be able to add new functionality without changing existing code (which could introduce bugs).

**Example (Violation):**
```javascript
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

class Circle {
  constructor(radius) {
    this.radius = radius;
  }
}

class AreaCalculator {
  calculate(shape) {
    if (shape instanceof Rectangle) {
      return shape.width * shape.height;
    } else if (shape instanceof Circle) {
      return Math.PI * shape.radius * shape.radius;
    }
    // If we add Triangle, we have to modify this class! ❌
  }
}
```

**Example (Correct):**
```javascript
class Shape {
  area() {
    throw new Error('Area method must be implemented');
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  area() {
    return this.width * this.height;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  area() {
    return Math.PI * this.radius * this.radius;
  }
}

class AreaCalculator {
  calculate(shape) {
    return shape.area(); // Works for any new shape! ✅
  }
}
```

### L - Liskov Substitution Principle (LSP)
**Definition:** Subtypes must be substitutable for their base types. If `B` extends `A`, you should be able to use `B` wherever you use `A` without breaking the app.

**Why?** Ensures inheritance is used correctly and derived classes don't change the behavior of the parent in unexpected ways.

**Example (Violation):**
```javascript
class Bird {
  fly() {
    console.log("I can fly");
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error("Cannot fly!"); // ❌ Violation: Penguin cannot substitute Bird behaviorally
  }
}
```

**Example (Correct):**
```javascript
class Bird {
}

class FlyingBird extends Bird {
  fly() {
    console.log("I can fly");
  }
}

class SwimmingBird extends Bird {
  swim() {
    console.log("I can swim");
  }
}

class Penguin extends SwimmingBird {
  // Good structure
}
```

### I - Interface Segregation Principle (ISP)
**Definition:** Clients should not be forced to depend on interfaces (methods) they do not use.

**Note in JS:** Since JS doesn't have Interfaces like Java/C#, this applies to how we design base classes or modules. Don't create "God Objects" with massive lists of methods.

**Example (Violation):**
```javascript
class Entity {
  move() {}
  attack() {}
  fly() {} // Not all entities fly
  eat() {}
}
```

**Example (Correct):**
Use composition or smaller base classes.
```javascript
const mover = {
  move() { console.log('moving'); }
};

const flyer = {
  fly() { console.log('flying'); }
};

class SuperHero {
  constructor(name) {
    this.name = name;
    Object.assign(this, mover, flyer);
  }
}
```

### D - Dependency Inversion Principle (DIP)
**Definition:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Why?** Decoupling. You can easily swap out the low-level details (like swapping MySQL for MongoDB) without changing the high-level business logic.

**Example (Violation):**
```javascript
class MySQLDatabase {
  save(data) { /* ... */ }
}

class UserController {
  constructor() {
    this.db = new MySQLDatabase(); // ❌ Hard dependency on MySQL
  }
}
```

**Example (Correct):**
```javascript
class MySQLDatabase {
  save(data) { /* ... */ }
}

class MongoDatabase {
  save(data) { /* ... */ }
}

class UserController {
  constructor(database) {
    this.db = database; // ✅ Dependency injected. Doesn't care which DB.
  }
  
  saveUser(user) {
    this.db.save(user);
  }
}

const db = new MongoDatabase();
const userController = new UserController(db);
```

---

## 2. Design Patterns Introduction

**What are Design Patterns?**
Design patterns are typical solutions to common problems in software design. They are like blueprints that you can customize to solve a recurring design problem in your code.

**Why use them?**
1.  **Proven Solutions:** You are using solutions that have been vetted by thousands of developers.
2.  **Common Language:** Easier to say "Let's use a Singleton here" than explaining the whole logic.
3.  **Scalability:** Promotes loosely coupled and maintainable code.

**Types of Design Patterns:**
*   **Creational:** Dealing with object creation mechanisms (e.g., Singleton, Factory, Builder).
*   **Structural:** Dealing with object composition (e.g., Adapter, Decorator, Proxy).
*   **Behavioral:** Dealing with communication between objects (e.g., Observer, Strategy, Iterator).

---

## 3. Singleton Pattern

**Goal:** Ensure a class has only one instance and provide a global point of access to it.

**Use Cases:**
*   Database connections (create one pool and reuse).
*   Logging services.
*   Configuration settings manager.

**Implementation in Node.js:**
Node.js module caching system actually behaves like a Singleton by default.

**Approach 1: Object Literal (Simplest)**
```javascript
const Config = {
  apiKey: '12345',
  url: 'https://api.example.com',
  log() {
    console.log(this.apiKey);
  }
};

Object.freeze(Config); // Prevent modification
module.exports = Config;
```

**Approach 2: Class with Static Instance**
```javascript
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = "Active Connection";
    Database.instance = this;
  }
  
  query(sql) {
    console.log(`Executing: ${sql}`);
  }
}

const db1 = new Database();
const db2 = new Database();

console.log(db1 === db2); // true
```

---

## 4. Factory Pattern

**Goal:** Create objects without specifying the exact class of object that will be created. It provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.

**Use Cases:**
*   When the setup of an object is complex.
*   When we need to handle different object types based on input (e.g., creating different types of Users: Admin, Member, Guest).
*   Cross-platform UI components.

**Simple Factory (Most Common in JS)**
```javascript
class Car {
  constructor(options) {
    this.type = 'Car';
    this.doors = options.doors || 4;
  }
}

class Truck {
  constructor(options) {
    this.type = 'Truck';
    this.doors = options.doors || 2;
  }
}

class VehicleFactory {
  createVehicle(options) {
    switch(options.vehicleType) {
      case 'car':
        return new Car(options);
      case 'truck':
        return new Truck(options);
      default:
        return new Car(options);
    }
  }
}

const factory = new VehicleFactory();

const myCar = factory.createVehicle({ vehicleType: 'car', doors: 4 });
const myTruck = factory.createVehicle({ vehicleType: 'truck', doors: 2 });

console.log(myCar.type); // Car
console.log(myTruck.type); // Truck
```

**Factory Method (Advanced)**
Instead of one factory creating everything, subclasses decide which class to instantiate.

```javascript
class Logistics {
  createTransport() {
    throw new Error('This method must be overridden');
  }
  
  planDelivery() {
    const transport = this.createTransport();
    return transport.deliver();
  }
}

class RoadLogistics extends Logistics {
  createTransport() {
    return new Truck();
  }
}

class SeaLogistics extends Logistics {
  createTransport() {
    return new Ship();
  }
}

// Usage
const logistics = new RoadLogistics();
logistics.planDelivery(); // Creates a Truck and calls deliver()
```
