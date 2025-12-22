/**
 * Surge Pricing Service
 * Calculates dynamic pricing based on demand/supply
 */

const config = require('../config');

class SurgePricingService {
    constructor() {
        this.zones = new Map();

        // Initialize zones
        config.surge.zones.forEach(zone => {
            this.zones.set(zone, {
                name: zone,
                activeRides: 0,
                availableDrivers: 0,
                surgeMultiplier: 1.0,
                lastUpdated: new Date().toISOString()
            });
        });
    }

    /**
     * Calculate surge multiplier based on demand/supply ratio
     * @param {number} activeRides - Number of active rides
     * @param {number} availableDrivers - Number of available drivers
     * @returns {number} Surge multiplier
     */
    calculateSurgeMultiplier(activeRides, availableDrivers) {
        if (!config.surge.enabled) {
            return 1.0;
        }

        if (availableDrivers === 0) {
            return activeRides > 0 ? 2.5 : 1.0;
        }

        const ratio = activeRides / availableDrivers;

        if (ratio >= 4.0) return 2.5;
        if (ratio >= 3.0) return 2.0;
        if (ratio >= 2.0) return 1.5;
        if (ratio >= 1.5) return 1.3;

        return 1.0;
    }

    /**
     * Update surge for a zone
     * @param {string} zone - Zone name
     * @param {number} activeRides - Number of active rides
     * @param {number} availableDrivers - Number of available drivers
     */
    updateZone(zone, activeRides, availableDrivers) {
        const zoneData = this.zones.get(zone);
        if (!zoneData) return;

        zoneData.activeRides = activeRides;
        zoneData.availableDrivers = availableDrivers;
        zoneData.surgeMultiplier = this.calculateSurgeMultiplier(activeRides, availableDrivers);
        zoneData.lastUpdated = new Date().toISOString();

        this.zones.set(zone, zoneData);
    }

    /**
     * Get surge multiplier for a zone
     * @param {string} zone - Zone name
     * @returns {number} Surge multiplier
     */
    getSurgeMultiplier(zone) {
        const zoneData = this.zones.get(zone);
        return zoneData ? zoneData.surgeMultiplier : 1.0;
    }

    /**
     * Get all zones data
     * @returns {Array} All zones
     */
    getAllZones() {
        return Array.from(this.zones.values());
    }

    /**
     * Increment active rides for a zone
     */
    incrementRides(zone) {
        const zoneData = this.zones.get(zone);
        if (zoneData) {
            zoneData.activeRides++;
            this.updateZone(zone, zoneData.activeRides, zoneData.availableDrivers);
        }
    }

    /**
     * Decrement active rides for a zone
     */
    decrementRides(zone) {
        const zoneData = this.zones.get(zone);
        if (zoneData && zoneData.activeRides > 0) {
            zoneData.activeRides--;
            this.updateZone(zone, zoneData.activeRides, zoneData.availableDrivers);
        }
    }

    /**
     * Update available drivers for a zone
     */
    updateDrivers(zone, count) {
        const zoneData = this.zones.get(zone);
        if (zoneData) {
            this.updateZone(zone, zoneData.activeRides, count);
        }
    }
}

module.exports = new SurgePricingService();
