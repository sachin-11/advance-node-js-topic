/**
 * ============================================================
 * DESIGN PATTERNS - DEEP EXPLANATION WITH CODE EXAMPLES
 * ============================================================
 * 
 * Ye file teen design patterns ko deeply explain karti hai:
 * 1. Observer Pattern
 * 2. Strategy Pattern  
 * 3. Decorator Pattern
 * 
 * Har pattern ke liye:
 * - Theory aur concept explanation
 * - Real-world use cases
 * - Step-by-step code implementation
 * - Multiple examples
 * ============================================================
 */

// ============================================================
// 1. OBSERVER PATTERN (Publisher-Subscriber Pattern)
// ============================================================

/**
 * OBSERVER PATTERN - CONCEPT EXPLANATION
 * --------------------------------------
 * 
 * Observer Pattern ek behavioral design pattern hai jo ek-to-many dependency
 * establish karta hai. Jab ek object (Subject/Observable) ki state change hoti hai,
 * to automatically sabhi dependent objects (Observers) ko notify kiya jata hai.
 * 
 * Real-world Example:
 * - YouTube: Jab aap kisi channel ko subscribe karte ho, naye video aane par
 *   notification milta hai
 * - News App: Breaking news aane par sabhi users ko notification
 * - Event Listeners: DOM events (click, scroll, etc.)
 * 
 * Components:
 * 1. Subject/Observable: State ko maintain karta hai aur observers ko notify karta hai
 * 2. Observer: Update method ke through notifications receive karta hai
 * 3. ConcreteSubject: Actual implementation jo state change karta hai
 * 4. ConcreteObserver: Actual implementation jo notifications handle karta hai
 * 
 * Benefits:
 * - Loose coupling: Subject aur Observer independent hote hain
 * - Dynamic relationships: Runtime mein observers add/remove kar sakte hain
 * - Open/Closed Principle: Naye observers add karne ke liye existing code change nahi
 */

// ============ OBSERVER PATTERN - BASIC IMPLEMENTATION ============

// Step 1: Observer Interface (Abstract class ya interface)
class Observer {
    update(data) {
        throw new Error("update() method must be implemented");
    }
}

// Step 2: Subject/Observable Class
class Subject {
    constructor() {
        this.observers = []; // List of all observers
        this.state = null;   // Current state
    }

    // Observer ko subscribe karna
    subscribe(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
            console.log(`Observer subscribed. Total observers: ${this.observers.length}`);
        }
    }

    // Observer ko unsubscribe karna
    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
        console.log(`Observer unsubscribed. Total observers: ${this.observers.length}`);
    }

    // Sabhi observers ko notify karna
    notify(data) {
        console.log(`\n📢 Notifying ${this.observers.length} observer(s)...`);
        this.observers.forEach(observer => {
            observer.update(data);
        });
    }

    // State change karna aur notify karna
    setState(newState) {
        console.log(`\n🔄 State changing from "${this.state}" to "${newState}"`);
        this.state = newState;
        this.notify(this.state);
    }

    getState() {
        return this.state;
    }
}

// Step 3: Concrete Observers (Different types of observers)
class EmailObserver extends Observer {
    constructor(name) {
        super();
        this.name = name;
    }

    update(data) {
        console.log(`📧 [${this.name}] Email notification: "${data}"`);
    }
}

class SMSObserver extends Observer {
    constructor(name) {
        super();
        this.name = name;
    }

    update(data) {
        console.log(`📱 [${this.name}] SMS notification: "${data}"`);
    }
}

class PushNotificationObserver extends Observer {
    constructor(name) {
        super();
        this.name = name;
    }

    update(data) {
        console.log(`🔔 [${this.name}] Push notification: "${data}"`);
    }
}

// ============ OBSERVER PATTERN - EXAMPLE 1: News Publisher ============

class NewsPublisher extends Subject {
    constructor() {
        super();
        this.news = [];
    }

    publishNews(headline) {
        this.news.push(headline);
        this.setState(`Breaking News: ${headline}`);
    }

    getNewsHistory() {
        return this.news;
    }
}

// Example Usage - News Publisher
console.log("\n" + "=".repeat(60));
console.log("OBSERVER PATTERN - EXAMPLE 1: News Publisher");
console.log("=".repeat(60));

const newsPublisher = new NewsPublisher();

// Create different types of observers
const emailSubscriber1 = new EmailObserver("User1@gmail.com");
const emailSubscriber2 = new EmailObserver("User2@gmail.com");
const smsSubscriber = new SMSObserver("+91-9876543210");
const pushSubscriber = new PushNotificationObserver("Mobile App");

// Subscribe observers
newsPublisher.subscribe(emailSubscriber1);
newsPublisher.subscribe(emailSubscriber2);
newsPublisher.subscribe(smsSubscriber);
newsPublisher.subscribe(pushSubscriber);

// Publish news - automatically notifies all observers
newsPublisher.publishNews("India wins the World Cup!");

// Unsubscribe one observer
newsPublisher.unsubscribe(emailSubscriber2);

// Publish another news
newsPublisher.publishNews("Stock market hits all-time high!");

// ============ OBSERVER PATTERN - EXAMPLE 2: Stock Price Tracker ============

class StockPrice extends Subject {
    constructor(symbol, initialPrice) {
        super();
        this.symbol = symbol;
        this.price = initialPrice;
    }

    setPrice(newPrice) {
        const oldPrice = this.price;
        this.price = newPrice;
        
        const change = newPrice - oldPrice;
        const changePercent = ((change / oldPrice) * 100).toFixed(2);
        
        const data = {
            symbol: this.symbol,
            oldPrice,
            newPrice,
            change,
            changePercent
        };
        
        this.setState(data);
    }
}

class StockTrader extends Observer {
    constructor(name, buyThreshold, sellThreshold) {
        super();
        this.name = name;
        this.buyThreshold = buyThreshold;  // Buy if price drops below this %
        this.sellThreshold = sellThreshold; // Sell if price rises above this %
    }

    update(data) {
        const { symbol, newPrice, changePercent } = data;
        
        console.log(`\n👤 [${this.name}] Stock Update:`);
        console.log(`   Symbol: ${symbol}, Price: $${newPrice}, Change: ${changePercent}%`);
        
        if (changePercent <= this.buyThreshold) {
            console.log(`   ✅ BUY SIGNAL - Price dropped ${Math.abs(changePercent)}%`);
        } else if (changePercent >= this.sellThreshold) {
            console.log(`   ✅ SELL SIGNAL - Price rose ${changePercent}%`);
        } else {
            console.log(`   ⏸️  HOLD - No action needed`);
        }
    }
}

// Example Usage - Stock Price Tracker
console.log("\n" + "=".repeat(60));
console.log("OBSERVER PATTERN - EXAMPLE 2: Stock Price Tracker");
console.log("=".repeat(60));

const appleStock = new StockPrice("AAPL", 150);

const trader1 = new StockTrader("Rahul", -5, 10);  // Buy if drops 5%, Sell if rises 10%
const trader2 = new StockTrader("Priya", -3, 8);   // Buy if drops 3%, Sell if rises 8%

appleStock.subscribe(trader1);
appleStock.subscribe(trader2);

// Simulate price changes
appleStock.setPrice(145);  // Price dropped
appleStock.setPrice(155);  // Price rose
appleStock.setPrice(160);  // Price rose more

// ============ OBSERVER PATTERN - EXAMPLE 3: Event Emitter (Node.js Style) ============

class EventEmitter {
    constructor() {
        this.events = {}; // { eventName: [listeners] }
    }

    // Event listener add karna
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
        console.log(`✅ Listener added for event: "${eventName}"`);
    }

    // Event listener remove karna
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
            console.log(`❌ Listener removed for event: "${eventName}"`);
        }
    }

    // Event emit karna (sabhi listeners ko call karna)
    emit(eventName, data) {
        if (this.events[eventName]) {
            console.log(`\n📢 Emitting event: "${eventName}" to ${this.events[eventName].length} listener(s)`);
            this.events[eventName].forEach(callback => {
                callback(data);
            });
        }
    }

    // Ek baar hi listener add karna (one-time listener)
    once(eventName, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(eventName, wrapper);
        };
        this.on(eventName, wrapper);
    }
}

// Example Usage - Event Emitter
console.log("\n" + "=".repeat(60));
console.log("OBSERVER PATTERN - EXAMPLE 3: Event Emitter (Node.js Style)");
console.log("=".repeat(60));

const emitter = new EventEmitter();

// Multiple listeners for same event
emitter.on("user-login", (userData) => {
    console.log(`🔐 Login handler 1: Welcome ${userData.name}!`);
});

emitter.on("user-login", (userData) => {
    console.log(`📊 Login handler 2: Logging login event for ${userData.email}`);
});

emitter.on("user-login", (userData) => {
    console.log(`📧 Login handler 3: Sending welcome email to ${userData.email}`);
});

// One-time listener
emitter.once("first-purchase", (data) => {
    console.log(`🎉 First purchase bonus applied! Order: ${data.orderId}`);
});

// Emit events
emitter.emit("user-login", { name: "Sachin", email: "sachin@example.com" });
emitter.emit("first-purchase", { orderId: "ORD-123" });
emitter.emit("first-purchase", { orderId: "ORD-124" }); // Won't trigger (one-time)

// ============================================================
// 2. STRATEGY PATTERN
// ============================================================

/**
 * STRATEGY PATTERN - CONCEPT EXPLANATION
 * --------------------------------------
 * 
 * Strategy Pattern ek behavioral design pattern hai jo runtime mein algorithm
 * select karne ki flexibility deta hai. Isme multiple algorithms ko encapsulate
 * karke, unhein interchangeable banaya jata hai.
 * 
 * Real-world Example:
 * - Payment Methods: Credit Card, PayPal, UPI - same interface, different implementation
 * - Sorting Algorithms: Quick Sort, Merge Sort, Bubble Sort - choose at runtime
 * - Navigation: Google Maps, Apple Maps - different strategies, same goal
 * - Compression: ZIP, RAR, 7Z - different algorithms, same purpose
 * 
 * Components:
 * 1. Strategy Interface: Common interface jo sabhi strategies implement karti hain
 * 2. Concrete Strategies: Different algorithm implementations
 * 3. Context: Class jo strategy use karti hai aur runtime mein change kar sakti hai
 * 
 * Benefits:
 * - Algorithm interchangeability: Runtime mein algorithm change kar sakte hain
 * - Open/Closed Principle: Naye strategies add kar sakte hain without modifying context
 * - Eliminates conditional statements: if-else/switch statements ki jagah
 * - Better code organization: Har strategy apne file mein ho sakti hai
 */

// ============ STRATEGY PATTERN - BASIC IMPLEMENTATION ============

// Step 1: Strategy Interface
class PaymentStrategy {
    pay(amount) {
        throw new Error("pay() method must be implemented");
    }
}

// Step 2: Concrete Strategies
class CreditCardStrategy extends PaymentStrategy {
    constructor(cardNumber, cvv, name) {
        super();
        this.cardNumber = cardNumber;
        this.cvv = cvv;
        this.name = name;
    }

    pay(amount) {
        console.log(`💳 Paying $${amount} using Credit Card`);
        console.log(`   Card: ****${this.cardNumber.slice(-4)}`);
        console.log(`   Name: ${this.name}`);
        return { success: true, method: "Credit Card", amount };
    }
}

class PayPalStrategy extends PaymentStrategy {
    constructor(email) {
        super();
        this.email = email;
    }

    pay(amount) {
        console.log(`🔵 Paying $${amount} using PayPal`);
        console.log(`   Email: ${this.email}`);
        return { success: true, method: "PayPal", amount };
    }
}

class UPIPaymentStrategy extends PaymentStrategy {
    constructor(upiId) {
        super();
        this.upiId = upiId;
    }

    pay(amount) {
        console.log(`📱 Paying ₹${amount} using UPI`);
        console.log(`   UPI ID: ${this.upiId}`);
        return { success: true, method: "UPI", amount };
    }
}

class CryptoStrategy extends PaymentStrategy {
    constructor(walletAddress) {
        super();
        this.walletAddress = walletAddress;
    }

    pay(amount) {
        console.log(`₿ Paying $${amount} using Cryptocurrency`);
        console.log(`   Wallet: ${this.walletAddress.slice(0, 10)}...`);
        return { success: true, method: "Crypto", amount };
    }
}

// Step 3: Context Class
class PaymentProcessor {
    constructor() {
        this.strategy = null;
    }

    // Strategy set karna
    setStrategy(strategy) {
        this.strategy = strategy;
        console.log(`\n✅ Payment strategy set to: ${strategy.constructor.name}`);
    }

    // Payment process karna using current strategy
    processPayment(amount) {
        if (!this.strategy) {
            throw new Error("No payment strategy set!");
        }
        return this.strategy.pay(amount);
    }
}

// ============ STRATEGY PATTERN - EXAMPLE 1: Payment Processing ============

console.log("\n" + "=".repeat(60));
console.log("STRATEGY PATTERN - EXAMPLE 1: Payment Processing");
console.log("=".repeat(60));

const paymentProcessor = new PaymentProcessor();

// Different payment strategies
const creditCard = new CreditCardStrategy("1234567890123456", "123", "Sachin Kumar");
const paypal = new PayPalStrategy("sachin@paypal.com");
const upi = new UPIPaymentStrategy("sachin@paytm");
const crypto = new CryptoStrategy("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");

// Use different strategies
paymentProcessor.setStrategy(creditCard);
paymentProcessor.processPayment(100);

paymentProcessor.setStrategy(paypal);
paymentProcessor.processPayment(50);

paymentProcessor.setStrategy(upi);
paymentProcessor.processPayment(500);

paymentProcessor.setStrategy(crypto);
paymentProcessor.processPayment(200);

// ============ STRATEGY PATTERN - EXAMPLE 2: Sorting Algorithms ============

class SortStrategy {
    sort(array) {
        throw new Error("sort() method must be implemented");
    }
}

class QuickSortStrategy extends SortStrategy {
    sort(array) {
        console.log("🔀 Using Quick Sort algorithm...");
        // Simplified quick sort
        if (array.length <= 1) return array;
        
        const pivot = array[Math.floor(array.length / 2)];
        const left = array.filter(x => x < pivot);
        const middle = array.filter(x => x === pivot);
        const right = array.filter(x => x > pivot);
        
        return [...this.sort(left), ...middle, ...this.sort(right)];
    }
}

class MergeSortStrategy extends SortStrategy {
    sort(array) {
        console.log("🔀 Using Merge Sort algorithm...");
        if (array.length <= 1) return array;
        
        const mid = Math.floor(array.length / 2);
        const left = this.sort(array.slice(0, mid));
        const right = this.sort(array.slice(mid));
        
        return this.merge(left, right);
    }

    merge(left, right) {
        const result = [];
        let i = 0, j = 0;
        
        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }
        
        return result.concat(left.slice(i)).concat(right.slice(j));
    }
}

class BubbleSortStrategy extends SortStrategy {
    sort(array) {
        console.log("🔀 Using Bubble Sort algorithm...");
        const arr = [...array];
        const n = arr.length;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
            }
        }
        
        return arr;
    }
}

class Sorter {
    constructor() {
        this.strategy = null;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    sort(array) {
        if (!this.strategy) {
            throw new Error("No sort strategy set!");
        }
        const startTime = Date.now();
        const result = this.strategy.sort(array);
        const endTime = Date.now();
        console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
        return result;
    }
}

// Example Usage - Sorting
console.log("\n" + "=".repeat(60));
console.log("STRATEGY PATTERN - EXAMPLE 2: Sorting Algorithms");
console.log("=".repeat(60));

const numbers = [64, 34, 25, 12, 22, 11, 90, 5, 77, 50];
console.log("Original array:", numbers);

const sorter = new Sorter();

sorter.setStrategy(new QuickSortStrategy());
console.log("Sorted:", sorter.sort([...numbers]));

sorter.setStrategy(new MergeSortStrategy());
console.log("Sorted:", sorter.sort([...numbers]));

sorter.setStrategy(new BubbleSortStrategy());
console.log("Sorted:", sorter.sort([...numbers]));

// ============ STRATEGY PATTERN - EXAMPLE 3: Navigation Routes ============

class NavigationStrategy {
    calculateRoute(start, end) {
        throw new Error("calculateRoute() method must be implemented");
    }
}

class FastestRouteStrategy extends NavigationStrategy {
    calculateRoute(start, end) {
        console.log(`🚗 Calculating FASTEST route from ${start} to ${end}...`);
        // Simulate: Highway route (faster but longer distance)
        return {
            route: `${start} → Highway → ${end}`,
            distance: "25 km",
            time: "30 minutes",
            type: "Fastest"
        };
    }
}

class ShortestRouteStrategy extends NavigationStrategy {
    calculateRoute(start, end) {
        console.log(`🚶 Calculating SHORTEST route from ${start} to ${end}...`);
        // Simulate: City route (shorter but slower)
        return {
            route: `${start} → City Roads → ${end}`,
            distance: "18 km",
            time: "45 minutes",
            type: "Shortest"
        };
    }
}

class ScenicRouteStrategy extends NavigationStrategy {
    calculateRoute(start, end) {
        console.log(`🌄 Calculating SCENIC route from ${start} to ${end}...`);
        // Simulate: Scenic route (beautiful but longer)
        return {
            route: `${start} → Coastal Road → ${end}`,
            distance: "35 km",
            time: "60 minutes",
            type: "Scenic"
        };
    }
}

class NavigationApp {
    constructor() {
        this.strategy = null;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    navigate(start, end) {
        if (!this.strategy) {
            throw new Error("No navigation strategy set!");
        }
        return this.strategy.calculateRoute(start, end);
    }
}

// Example Usage - Navigation
console.log("\n" + "=".repeat(60));
console.log("STRATEGY PATTERN - EXAMPLE 3: Navigation Routes");
console.log("=".repeat(60));

const navApp = new NavigationApp();

navApp.setStrategy(new FastestRouteStrategy());
console.log(navApp.navigate("Home", "Office"));

navApp.setStrategy(new ShortestRouteStrategy());
console.log(navApp.navigate("Home", "Office"));

navApp.setStrategy(new ScenicRouteStrategy());
console.log(navApp.navigate("Home", "Office"));

// ============================================================
// 3. DECORATOR PATTERN
// ============================================================

/**
 * DECORATOR PATTERN - CONCEPT EXPLANATION
 * ---------------------------------------
 * 
 * Decorator Pattern ek structural design pattern hai jo objects ko dynamically
 * new functionality add karne ki permission deta hai, without unki structure
 * change kiye. Yeh "wrapper" pattern hai jo existing object ko wrap karke
 * additional features add karta hai.
 * 
 * Real-world Example:
 * - Coffee Shop: Base coffee + Milk + Sugar + Whipped Cream (each is a decorator)
 * - Pizza: Base pizza + Cheese + Pepperoni + Olives (each topping is a decorator)
 * - Web Development: Middleware in Express.js (each middleware is a decorator)
 * - Text Formatting: Plain text + Bold + Italic + Underline
 * 
 * Components:
 * 1. Component Interface: Base interface jo sabhi components implement karte hain
 * 2. Concrete Component: Base implementation
 * 3. Decorator: Abstract decorator class jo component ko wrap karta hai
 * 4. Concrete Decorators: Specific decorators jo additional features add karte hain
 * 
 * Benefits:
 * - Runtime mein functionality add kar sakte hain
 * - Single Responsibility: Har decorator ek specific feature add karta hai
 * - Open/Closed Principle: Naye decorators add kar sakte hain without modifying existing code
 * - Composition over Inheritance: Multiple decorators combine kar sakte hain
 */

// ============ DECORATOR PATTERN - BASIC IMPLEMENTATION ============

// Step 1: Component Interface
class Coffee {
    getDescription() {
        return "Coffee";
    }

    getCost() {
        return 5; // Base price
    }
}

// Step 2: Base Decorator (Abstract)
class CoffeeDecorator extends Coffee {
    constructor(coffee) {
        super();
        this.coffee = coffee; // Wrapped component
    }

    getDescription() {
        return this.coffee.getDescription();
    }

    getCost() {
        return this.coffee.getCost();
    }
}

// Step 3: Concrete Decorators
class MilkDecorator extends CoffeeDecorator {
    getDescription() {
        return this.coffee.getDescription() + ", Milk";
    }

    getCost() {
        return this.coffee.getCost() + 1.5;
    }
}

class SugarDecorator extends CoffeeDecorator {
    getDescription() {
        return this.coffee.getDescription() + ", Sugar";
    }

    getCost() {
        return this.coffee.getCost() + 0.5;
    }
}

class WhippedCreamDecorator extends CoffeeDecorator {
    getDescription() {
        return this.coffee.getDescription() + ", Whipped Cream";
    }

    getCost() {
        return this.coffee.getCost() + 2.0;
    }
}

class CaramelDecorator extends CoffeeDecorator {
    getDescription() {
        return this.coffee.getDescription() + ", Caramel";
    }

    getCost() {
        return this.coffee.getCost() + 1.0;
    }
}

// ============ DECORATOR PATTERN - EXAMPLE 1: Coffee Shop ============

console.log("\n" + "=".repeat(60));
console.log("DECORATOR PATTERN - EXAMPLE 1: Coffee Shop");
console.log("=".repeat(60));

// Simple coffee
let coffee = new Coffee();
console.log(`\n☕ Order: ${coffee.getDescription()}`);
console.log(`💰 Cost: $${coffee.getCost()}`);

// Coffee with milk
coffee = new MilkDecorator(coffee);
console.log(`\n☕ Order: ${coffee.getDescription()}`);
console.log(`💰 Cost: $${coffee.getCost()}`);

// Coffee with milk + sugar
coffee = new SugarDecorator(coffee);
console.log(`\n☕ Order: ${coffee.getDescription()}`);
console.log(`💰 Cost: $${coffee.getCost()}`);

// Coffee with milk + sugar + whipped cream
coffee = new WhippedCreamDecorator(coffee);
console.log(`\n☕ Order: ${coffee.getDescription()}`);
console.log(`💰 Cost: $${coffee.getCost()}`);

// Different combination: Coffee + Caramel + Whipped Cream
let fancyCoffee = new Coffee();
fancyCoffee = new CaramelDecorator(fancyCoffee);
fancyCoffee = new WhippedCreamDecorator(fancyCoffee);
console.log(`\n☕ Order: ${fancyCoffee.getDescription()}`);
console.log(`💰 Cost: $${fancyCoffee.getCost()}`);

// ============ DECORATOR PATTERN - EXAMPLE 2: Text Formatting ============

class TextComponent {
    constructor(text) {
        this.text = text;
    }

    format() {
        return this.text;
    }
}

class TextDecorator extends TextComponent {
    constructor(component) {
        super();
        this.component = component;
    }

    format() {
        return this.component.format();
    }
}

class BoldDecorator extends TextDecorator {
    format() {
        return `<b>${this.component.format()}</b>`;
    }
}

class ItalicDecorator extends TextDecorator {
    format() {
        return `<i>${this.component.format()}</i>`;
    }
}

class UnderlineDecorator extends TextDecorator {
    format() {
        return `<u>${this.component.format()}</u>`;
    }
}

class ColorDecorator extends TextDecorator {
    constructor(component, color) {
        super(component);
        this.color = color;
    }

    format() {
        return `<span style="color: ${this.color}">${this.component.format()}</span>`;
    }
}

class FontSizeDecorator extends TextDecorator {
    constructor(component, size) {
        super(component);
        this.size = size;
    }

    format() {
        return `<span style="font-size: ${this.size}px">${this.component.format()}</span>`;
    }
}

// Example Usage - Text Formatting
console.log("\n" + "=".repeat(60));
console.log("DECORATOR PATTERN - EXAMPLE 2: Text Formatting");
console.log("=".repeat(60));

let text = new TextComponent("Hello, World!");

// Plain text
console.log("\nPlain text:", text.format());

// Bold text
let boldText = new BoldDecorator(text);
console.log("Bold:", boldText.format());

// Bold + Italic
let boldItalicText = new ItalicDecorator(boldText);
console.log("Bold + Italic:", boldItalicText.format());

// Bold + Italic + Underline
let formattedText = new UnderlineDecorator(boldItalicText);
console.log("Bold + Italic + Underline:", formattedText.format());

// Bold + Italic + Underline + Color
let colorfulText = new ColorDecorator(formattedText, "blue");
console.log("Bold + Italic + Underline + Color:", colorfulText.format());

// Bold + Italic + Underline + Color + Font Size
let finalText = new FontSizeDecorator(colorfulText, 24);
console.log("All formatting:", finalText.format());

// ============ DECORATOR PATTERN - EXAMPLE 3: HTTP Request Middleware ============

class HTTPRequest {
    constructor(url, method = "GET") {
        this.url = url;
        this.method = method;
        this.headers = {};
        this.body = null;
    }

    execute() {
        return {
            url: this.url,
            method: this.method,
            headers: this.headers,
            body: this.body
        };
    }
}

class RequestDecorator {
    constructor(request) {
        this.request = request;
    }

    execute() {
        return this.request.execute();
    }
}

class AuthDecorator extends RequestDecorator {
    constructor(request, token) {
        super(request);
        this.token = token;
    }

    execute() {
        const req = this.request.execute();
        req.headers["Authorization"] = `Bearer ${this.token}`;
        console.log("🔐 Added authentication header");
        return req;
    }
}

class LoggingDecorator extends RequestDecorator {
    execute() {
        const req = this.request.execute();
        console.log("📝 Logging request:", {
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });
        return req;
    }
}

class CachingDecorator extends RequestDecorator {
    constructor(request, cacheKey) {
        super(request);
        this.cacheKey = cacheKey;
    }

    execute() {
        const req = this.request.execute();
        req.headers["Cache-Control"] = "max-age=3600";
        console.log(`💾 Added caching with key: ${this.cacheKey}`);
        return req;
    }
}

class CompressionDecorator extends RequestDecorator {
    execute() {
        const req = this.request.execute();
        req.headers["Content-Encoding"] = "gzip";
        console.log("🗜️  Added compression");
        return req;
    }
}

class RateLimitDecorator extends RequestDecorator {
    constructor(request, maxRequests) {
        super(request);
        this.maxRequests = maxRequests;
    }

    execute() {
        const req = this.request.execute();
        req.headers["X-RateLimit-Limit"] = this.maxRequests.toString();
        console.log(`⏱️  Added rate limiting: ${this.maxRequests} requests/hour`);
        return req;
    }
}

// Example Usage - HTTP Request Middleware
console.log("\n" + "=".repeat(60));
console.log("DECORATOR PATTERN - EXAMPLE 3: HTTP Request Middleware");
console.log("=".repeat(60));

// Base request
let request = new HTTPRequest("https://api.example.com/users", "GET");

// Add decorators (middleware)
request = new LoggingDecorator(request);
request = new AuthDecorator(request, "abc123xyz");
request = new CachingDecorator(request, "users-list");
request = new RateLimitDecorator(request, 100);

console.log("\n📤 Final Request:");
console.log(JSON.stringify(request.execute(), null, 2));

// Another request with different decorators
console.log("\n" + "-".repeat(60));
let postRequest = new HTTPRequest("https://api.example.com/posts", "POST");
postRequest.body = { title: "New Post", content: "Post content" };

postRequest = new LoggingDecorator(postRequest);
postRequest = new AuthDecorator(postRequest, "xyz789abc");
postRequest = new CompressionDecorator(postRequest);

console.log("\n📤 Final POST Request:");
console.log(JSON.stringify(postRequest.execute(), null, 2));

// ============ DECORATOR PATTERN - EXAMPLE 4: Pizza Toppings ============

class Pizza {
    getDescription() {
        return "Pizza";
    }

    getCost() {
        return 10; // Base pizza price
    }
}

class PizzaTopping extends Pizza {
    constructor(pizza) {
        super();
        this.pizza = pizza;
    }

    getDescription() {
        return this.pizza.getDescription();
    }

    getCost() {
        return this.pizza.getCost();
    }
}

class CheeseTopping extends PizzaTopping {
    getDescription() {
        return this.pizza.getDescription() + " + Cheese";
    }

    getCost() {
        return this.pizza.getCost() + 2;
    }
}

class PepperoniTopping extends PizzaTopping {
    getDescription() {
        return this.pizza.getDescription() + " + Pepperoni";
    }

    getCost() {
        return this.pizza.getCost() + 3;
    }
}

class MushroomTopping extends PizzaTopping {
    getDescription() {
        return this.pizza.getDescription() + " + Mushrooms";
    }

    getCost() {
        return this.pizza.getCost() + 2.5;
    }
}

class OlivesTopping extends PizzaTopping {
    getDescription() {
        return this.pizza.getDescription() + " + Olives";
    }

    getCost() {
        return this.pizza.getCost() + 1.5;
    }
}

// Example Usage - Pizza
console.log("\n" + "=".repeat(60));
console.log("DECORATOR PATTERN - EXAMPLE 4: Pizza Toppings");
console.log("=".repeat(60));

let pizza = new Pizza();
pizza = new CheeseTopping(pizza);
pizza = new PepperoniTopping(pizza);
pizza = new MushroomTopping(pizza);
pizza = new OlivesTopping(pizza);

console.log(`\n🍕 Order: ${pizza.getDescription()}`);
console.log(`💰 Total Cost: $${pizza.getCost()}`);

// ============================================================
// SUMMARY & COMPARISON
// ============================================================

console.log("\n" + "=".repeat(60));
console.log("SUMMARY & COMPARISON");
console.log("=".repeat(60));

console.log(`
📚 DESIGN PATTERNS SUMMARY:

1. OBSERVER PATTERN
   ✅ Use Case: Event handling, notifications, pub-sub systems
   ✅ Key Feature: One-to-many dependency, automatic notifications
   ✅ Example: YouTube subscriptions, Stock price updates
   
2. STRATEGY PATTERN
   ✅ Use Case: Multiple algorithms, payment methods, sorting
   ✅ Key Feature: Algorithm interchangeability at runtime
   ✅ Example: Payment gateways, Navigation routes
   
3. DECORATOR PATTERN
   ✅ Use Case: Adding features dynamically, middleware, formatting
   ✅ Key Feature: Wrapping objects to add functionality
   ✅ Example: Coffee toppings, Text formatting, HTTP middleware

🎯 KEY DIFFERENCES:

Observer Pattern:
- Focus: Communication between objects
- Relationship: One subject, many observers
- When to use: Need to notify multiple objects about state changes

Strategy Pattern:
- Focus: Algorithm selection
- Relationship: One context, one strategy at a time
- When to use: Multiple ways to perform same task

Decorator Pattern:
- Focus: Adding functionality dynamically
- Relationship: Wrapper chain (decorator wraps component)
- When to use: Need to add features without modifying base class
`);

console.log("\n✅ All examples executed successfully!\n");

