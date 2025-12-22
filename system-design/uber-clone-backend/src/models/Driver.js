/**
 * Driver Model
 * In-memory storage for drivers
 */

class DriverStore {
    constructor() {
        this.drivers = new Map();
    }

    /**
     * Add or update driver
     */
    set(driverId, driverData) {
        this.drivers.set(driverId, {
            id: driverId,
            ...driverData,
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Get driver by ID
     */
    get(driverId) {
        return this.drivers.get(driverId);
    }

    /**
     * Get all drivers
     */
    getAll() {
        return Array.from(this.drivers.values());
    }

    /**
     * Get available drivers
     */
    getAvailable() {
        return this.getAll().filter(driver => driver.isAvailable);
    }

    /**
     * Update driver location
     */
    updateLocation(driverId, location) {
        const driver = this.get(driverId);
        if (driver) {
            driver.location = location;
            driver.updatedAt = new Date().toISOString();
            this.set(driverId, driver);
        }
    }

    /**
     * Set driver availability
     */
    setAvailability(driverId, isAvailable) {
        const driver = this.get(driverId);
        if (driver) {
            driver.isAvailable = isAvailable;
            this.set(driverId, driver);
        }
    }

    /**
     * Remove driver
     */
    remove(driverId) {
        this.drivers.delete(driverId);
    }

    /**
     * Remove driver by socket ID
     */
    removeBySocketId(socketId) {
        for (const [id, driver] of this.drivers) {
            if (driver.socketId === socketId) {
                this.drivers.delete(id);
                return driver;
            }
        }
        return null;
    }
}

module.exports = new DriverStore();
