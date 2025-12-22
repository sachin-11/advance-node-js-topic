/**
 * Location Service
 * Handles real-time location tracking and updates
 */

const { DriverStore } = require('../models');
const { calculateDistance, calculateETA } = require('../utils/distance');
const config = require('../config');

class LocationService {
    constructor() {
        // Only use in-memory history if not using database
        if (!config.useDatabase) {
            this.locationHistory = new Map();
        }
    }

    /**
     * Update driver location
     * @param {string} driverId - Driver ID
     * @param {Object} location - New location {lat, lng}
     */
    async updateDriverLocation(driverId, location) {
        // Update driver's current location (async)
        await DriverStore.updateLocation(driverId, location);

        // Store in history (only for in-memory mode)
        if (!config.useDatabase && this.locationHistory) {
            const history = this.locationHistory.get(driverId) || [];
            history.push({
                location: location,
                timestamp: new Date().toISOString()
            });

            // Keep only last 100 locations
            if (history.length > 100) {
                history.shift();
            }

            this.locationHistory.set(driverId, history);
        }
    }

    /**
     * Get driver's location history
     * @param {string} driverId - Driver ID
     * @returns {Array} Location history
     */
    async getLocationHistory(driverId) {
        // If using database, get from DriverStore
        if (config.useDatabase) {
            return await DriverStore.getLocationHistory(driverId);
        }

        // Otherwise use in-memory history
        return this.locationHistory?.get(driverId) || [];
    }

    /**
     * Calculate ETA to destination
     * @param {Object} currentLocation - Current location
     * @param {Object} destination - Destination location
     * @returns {Object} Distance and ETA
     */
    calculateETAToDestination(currentLocation, destination) {
        const distance = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            destination.lat,
            destination.lng
        );

        const eta = calculateETA(distance);

        return {
            distance: parseFloat(distance.toFixed(2)),
            eta: eta
        };
    }

    /**
     * Check if driver has arrived at location
     * @param {Object} driverLocation - Driver's location
     * @param {Object} targetLocation - Target location
     * @param {number} threshold - Distance threshold in km (default: 0.1 km = 100m)
     * @returns {boolean} True if arrived
     */
    hasArrived(driverLocation, targetLocation, threshold = 0.1) {
        const distance = calculateDistance(
            driverLocation.lat,
            driverLocation.lng,
            targetLocation.lat,
            targetLocation.lng
        );

        return distance <= threshold;
    }
}

module.exports = new LocationService();
