/**
 * Model Factory
 * Returns appropriate model implementation based on configuration
 * Provides async wrapper for in-memory models to maintain compatibility
 */

const config = require('../config');
const DriverStoreMemory = require('./Driver');
const RideStoreMemory = require('./Ride');

let DriverStore, RideStore, RIDE_STATUS;

if (config.useDatabase) {
    // Use PostgreSQL models (async)
    const DriverStoreDB = require('./DriverDB');
    const RideStoreDB = require('./RideDB');
    
    DriverStore = DriverStoreDB;
    RideStore = RideStoreDB.RideStoreDB;
    RIDE_STATUS = RideStoreDB.RIDE_STATUS;
    
    console.log('📊 Using PostgreSQL database models');
} else {
    // Use in-memory models with async wrapper
    const asyncWrapper = {
        // Wrap sync methods to return promises
        set: async (id, data) => Promise.resolve(DriverStoreMemory.set(id, data)),
        get: async (id) => Promise.resolve(DriverStoreMemory.get(id)),
        getAll: async () => Promise.resolve(DriverStoreMemory.getAll()),
        getAvailable: async () => Promise.resolve(DriverStoreMemory.getAvailable()),
        updateLocation: async (id, location) => Promise.resolve(DriverStoreMemory.updateLocation(id, location)),
        setAvailability: async (id, available) => Promise.resolve(DriverStoreMemory.setAvailability(id, available)),
        remove: async (id) => Promise.resolve(DriverStoreMemory.remove(id)),
        removeBySocketId: async (socketId) => Promise.resolve(DriverStoreMemory.removeBySocketId(socketId)),
        getLocationHistory: async (id) => {
            // For in-memory, use LocationService
            const LocationService = require('../services/LocationService');
            return Promise.resolve(LocationService.getLocationHistory(id));
        }
    };

    const rideAsyncWrapper = {
        create: async (data) => Promise.resolve(RideStoreMemory.RideStore.create(data)),
        get: async (id) => Promise.resolve(RideStoreMemory.RideStore.get(id)),
        getAll: async () => Promise.resolve(RideStoreMemory.RideStore.getAll()),
        updateStatus: async (id, status, metadata) => Promise.resolve(RideStoreMemory.RideStore.updateStatus(id, status, metadata)),
        assignDriver: async (id, driverId) => Promise.resolve(RideStoreMemory.RideStore.assignDriver(id, driverId)),
        getActive: async () => Promise.resolve(RideStoreMemory.RideStore.getActive()),
        getPending: async () => Promise.resolve(RideStoreMemory.RideStore.getPending())
    };
    
    DriverStore = asyncWrapper;
    RideStore = rideAsyncWrapper;
    RIDE_STATUS = RideStoreMemory.RIDE_STATUS;
    
    console.log('💾 Using in-memory models (with async wrapper)');
}

module.exports = {
    DriverStore,
    RideStore,
    RIDE_STATUS
};
