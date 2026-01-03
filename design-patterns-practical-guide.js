/**
 * ============================================================
 * DESIGN PATTERNS - REAL WORLD PRACTICAL GUIDE
 * ============================================================
 * 
 * Ye guide batata hai:
 * - Real projects mein kaise use karein
 * - Development ke time kya dhyan rakhein
 * - Interview mein kya bolna hai
 * ============================================================
 */

// ============================================================
// 1. OBSERVER PATTERN - PRACTICAL USAGE
// ============================================================

/**
 * ✅ REAL PROJECTS MEIN KAB USE KAREIN:
 * 
 * 1. Event Handling
 *    - Button clicks, form submissions
 *    - User actions track karna
 * 
 * 2. Notifications System
 *    - Email notifications
 *    - Push notifications
 *    - SMS alerts
 * 
 * 3. State Management
 *    - React Redux (state changes)
 *    - Vue.js reactivity
 * 
 * 4. Real-time Updates
 *    - Chat applications
 *    - Live score updates
 *    - Stock prices
 */

// ✅ SIMPLE EXAMPLE - Real Project Style
class NotificationService {
    constructor() {
        this.subscribers = [];
    }

    subscribe(user) {
        this.subscribers.push(user);
    }

    notify(message) {
        this.subscribers.forEach(user => {
            user.receiveNotification(message);
        });
    }
}

// Interview Tip: "Observer pattern use kiya notification system mein,
// jisse multiple users ko simultaneously notify kar sakte hain"

// ============================================================
// 2. STRATEGY PATTERN - PRACTICAL USAGE
// ============================================================

/**
 * ✅ REAL PROJECTS MEIN KAB USE KAREIN:
 * 
 * 1. Payment Gateways
 *    - Razorpay, Stripe, PayPal
 *    - User ko choice dena
 * 
 * 2. Authentication Methods
 *    - OAuth, JWT, Session
 *    - Different login options
 * 
 * 3. Data Export Formats
 *    - PDF, Excel, CSV export
 *    - User preference ke hisab se
 * 
 * 4. Shipping Methods
 *    - Express, Standard, Overnight
 *    - Cost calculation ke liye
 */

// ✅ SIMPLE EXAMPLE - Real Project Style
class PaymentService {
    constructor() {
        this.method = null;
    }

    setPaymentMethod(method) {
        this.method = method;
    }

    processPayment(amount) {
        return this.method.pay(amount);
    }
}

// Interview Tip: "Strategy pattern use kiya payment processing mein,
// jisse user apna preferred payment method choose kar sake"

// ============================================================
// 3. DECORATOR PATTERN - PRACTICAL USAGE
// ============================================================

/**
 * ✅ REAL PROJECTS MEIN KAB USE KAREIN:
 * 
 * 1. Middleware (Express.js)
 *    - Authentication middleware
 *    - Logging middleware
 *    - Error handling middleware
 * 
 * 2. Feature Flags
 *    - Premium features add karna
 *    - Trial vs Paid versions
 * 
 * 3. Request Processing
 *    - Caching layer
 *    - Compression
 *    - Rate limiting
 * 
 * 4. UI Components
 *    - Button with icons
 *    - Form with validation
 *    - Card with borders/shadows
 */

// ✅ SIMPLE EXAMPLE - Real Project Style (Express Middleware)
function authMiddleware(req, res, next) {
    // Check authentication
    if (req.headers.token) {
        req.user = { id: 1, name: "User" };
        next(); // Continue to next middleware
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
}

function loggingMiddleware(req, res, next) {
    console.log(`${req.method} ${req.path} - ${new Date()}`);
    next();
}

// app.use(loggingMiddleware);
// app.use(authMiddleware);
// app.get('/api/data', handler);

// Interview Tip: "Decorator pattern use kiya middleware mein,
// jisse request processing ko step-by-step enhance kar sakte hain"

// ============================================================
// DEVELOPMENT KE TIME KYA DHYAN RAKHEIN
// ============================================================

console.log("\n" + "=".repeat(60));
console.log("DEVELOPMENT KE TIME KYA DHYAN RAKHEIN");
console.log("=".repeat(60));

console.log(`
📌 OBSERVER PATTERN:
   ✅ Memory leaks se bachne ke liye unsubscribe() zaroor call karein
   ✅ Too many observers avoid karein (performance issue)
   ✅ Circular dependencies se bachein
   ✅ Event names consistent rakhein

📌 STRATEGY PATTERN:
   ✅ Strategy interface clear rakhein (same method signature)
   ✅ Context class simple rakhein (strategy ko delegate kare)
   ✅ Strategy selection logic separate rakhein
   ✅ Default strategy provide karein

📌 DECORATOR PATTERN:
   ✅ Decorator order matter karta hai (carefully stack karein)
   ✅ Base component ko modify na karein
   ✅ Too many decorators avoid karein (complexity badhti hai)
   ✅ Each decorator single responsibility rakhein
`);

// ============================================================
// INTERVIEW KE TIME KYA BOLNA HAI
// ============================================================

console.log("\n" + "=".repeat(60));
console.log("INTERVIEW KE TIME KYA BOLNA HAI");
console.log("=".repeat(60));

console.log(`
🎯 OBSERVER PATTERN:
   
   Question: "Observer pattern kya hai?"
   
   Answer: "Observer pattern ek behavioral pattern hai jisme ek subject
   apni state change hone par automatically sabhi observers ko notify karta hai.
   
   Real project mein maine ise use kiya:
   - Notification system mein (email, SMS, push notifications)
   - Event handling mein (user actions track karna)
   - Real-time updates ke liye (chat, live scores)
   
   Benefits:
   - Loose coupling (subject aur observer independent)
   - Dynamic relationships (runtime mein add/remove kar sakte hain)
   - Open/Closed Principle follow karta hai"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 STRATEGY PATTERN:
   
   Question: "Strategy pattern kya hai?"
   
   Answer: "Strategy pattern ek behavioral pattern hai jisme multiple
   algorithms ko encapsulate karke runtime mein select kar sakte hain.
   
   Real project mein maine ise use kiya:
   - Payment processing mein (Razorpay, Stripe, PayPal)
   - Authentication methods mein (OAuth, JWT)
   - Data export formats mein (PDF, Excel, CSV)
   
   Benefits:
   - Algorithm interchangeability (runtime mein change)
   - Code duplication kam hota hai
   - Easy to test (har strategy alag se test kar sakte hain)"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 DECORATOR PATTERN:
   
   Question: "Decorator pattern kya hai?"
   
   Answer: "Decorator pattern ek structural pattern hai jisme objects ko
   dynamically new functionality add kar sakte hain without structure change kiye.
   
   Real project mein maine ise use kiya:
   - Express.js middleware mein (auth, logging, caching)
   - Feature flags mein (premium features add karna)
   - UI components mein (buttons with icons, forms with validation)
   
   Benefits:
   - Runtime mein functionality add kar sakte hain
   - Single Responsibility Principle follow karta hai
   - Composition over Inheritance (multiple decorators combine kar sakte hain)"
`);

// ============================================================
// COMMON MISTAKES TO AVOID
// ============================================================

console.log("\n" + "=".repeat(60));
console.log("COMMON MISTAKES TO AVOID");
console.log("=".repeat(60));

console.log(`
❌ OBSERVER PATTERN:
   - Memory leaks: Observers ko unsubscribe na karna
   - Too many notifications: Har small change par notify karna
   - Tight coupling: Observer directly subject ko modify karna

✅ SOLUTION:
   - Always unsubscribe when component unmounts
   - Batch notifications together
   - Use events/commands instead of direct modification

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ STRATEGY PATTERN:
   - Strategy selection logic context mein mix karna
   - Similar strategies ko duplicate karna
   - Strategy ko stateful banana

✅ SOLUTION:
   - Strategy factory pattern use karein
   - Common code ko base class mein rakhein
   - Strategies ko stateless rakhein

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ DECORATOR PATTERN:
   - Too many decorators stack karna (complexity)
   - Decorator order ko ignore karna
   - Base component ko modify karna

✅ SOLUTION:
   - Maximum 3-4 decorators stack karein
   - Decorator order document karein
   - Base component ko untouched rakhein
`);

// ============================================================
// QUICK DECISION GUIDE
// ============================================================

console.log("\n" + "=".repeat(60));
console.log("QUICK DECISION GUIDE - KAB KAUNSA PATTERN USE KAREIN");
console.log("=".repeat(60));

console.log(`
🤔 OBSERVER PATTERN USE KAREIN JAB:
   ✅ Ek object ki state change par multiple objects ko notify karna ho
   ✅ Event-driven architecture chahiye ho
   ✅ Real-time updates chahiye ho
   ✅ Loose coupling chahiye ho

   Example: Notification system, Chat app, Stock prices

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤔 STRATEGY PATTERN USE KAREIN JAB:
   ✅ Multiple ways se same task karna ho
   ✅ Runtime mein algorithm change karna ho
   ✅ If-else/switch statements zyada ho rahe hain
   ✅ Code duplication kam karna ho

   Example: Payment methods, Sorting algorithms, Authentication

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤔 DECORATOR PATTERN USE KAREIN JAB:
   ✅ Runtime mein functionality add karni ho
   ✅ Base class ko modify kiye bina features add karne ho
   ✅ Multiple features ko combine karna ho
   ✅ Middleware-like behavior chahiye ho

   Example: Middleware, Feature flags, UI enhancements
`);

// ============================================================
// REAL PROJECT CODE SNIPPETS
// ============================================================

console.log("\n" + "=".repeat(60));
console.log("REAL PROJECT CODE SNIPPETS");
console.log("=".repeat(60));

// Example 1: E-commerce Notification System (Observer)
class OrderService {
    constructor() {
        this.observers = [];
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    placeOrder(order) {
        // Order place karo
        console.log(`Order placed: ${order.id}`);
        
        // Sabhi observers ko notify karo
        this.observers.forEach(obs => {
            obs.onOrderPlaced(order);
        });
    }
}

class EmailService {
    onOrderPlaced(order) {
        console.log(`📧 Sending email for order ${order.id}`);
    }
}

class SMSService {
    onOrderPlaced(order) {
        console.log(`📱 Sending SMS for order ${order.id}`);
    }
}

// Usage
const orderService = new OrderService();
orderService.subscribe(new EmailService());
orderService.subscribe(new SMSService());
orderService.placeOrder({ id: "ORD-123", amount: 1000 });

console.log("\n" + "-".repeat(60));

// Example 2: Payment Gateway (Strategy)
class RazorpayPayment {
    pay(amount) {
        console.log(`Processing ₹${amount} via Razorpay`);
        return { success: true, transactionId: "RZ-123" };
    }
}

class StripePayment {
    pay(amount) {
        console.log(`Processing $${amount} via Stripe`);
        return { success: true, transactionId: "ST-456" };
    }
}

class PaymentGateway {
    constructor() {
        this.strategy = null;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    processPayment(amount) {
        return this.strategy.pay(amount);
    }
}

// Usage
const gateway = new PaymentGateway();
gateway.setStrategy(new RazorpayPayment());
gateway.processPayment(1000);

console.log("\n" + "-".repeat(60));

// Example 3: Express Middleware (Decorator)
function withAuth(handler) {
    return (req, res) => {
        if (!req.headers.authorization) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = { id: 1, name: "User" };
        return handler(req, res);
    };
}

function withLogging(handler) {
    return (req, res) => {
        console.log(`[${new Date()}] ${req.method} ${req.path}`);
        return handler(req, res);
    };
}

function getUserHandler(req, res) {
    res.json({ user: req.user });
}

// Usage (conceptually)
// app.get('/user', withLogging(withAuth(getUserHandler)));

console.log("\n✅ Real project examples completed!\n");

