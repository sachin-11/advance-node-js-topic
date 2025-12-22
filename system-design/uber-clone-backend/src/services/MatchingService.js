/**
 * Matching Service
 * Finds nearest available driver for a ride request
 */

const { DriverStore } = require('../models');
const { calculateDistance, calculateETA } = require('../utils/distance');

class MatchingService {
    /**
     * Find nearest available driver
     * @param {Object} pickup - Pickup location {lat, lng}
     * @returns {Object|null} Nearest driver with distance info
     */
    async findNearestDriver(pickup) {
        const availableDrivers = await DriverStore.getAvailable();

        if (availableDrivers.length === 0) {
            return null;
        }

        let nearestDriver = null;
        let minDistance = Infinity;

        for (const driver of availableDrivers) {
            const distance = calculateDistance(
                pickup.lat,
                pickup.lng,
                driver.location.lat,
                driver.location.lng
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestDriver = {
                    ...driver,
                    distanceToPickup: distance,
                    eta: calculateETA(distance)
                };
            }
        }

        return nearestDriver;
    }

    /**
     * Match ride with driver
     * @param {Object} ride - Ride object
     * @returns {Object} Match result
     */
    async matchRide(ride) {
        const driver = await this.findNearestDriver(ride.pickup);

        if (!driver) {
            return {
                success: false,
                message: 'No drivers available'
            };
        }

        // Mark driver as busy
        await DriverStore.setAvailability(driver.id, false);

        return {
            success: true,
            driver: driver,
            message: 'Driver matched successfully'
        };
    }

    /**
     * Release driver (make available again)
     */
    async releaseDriver(driverId) {
        await DriverStore.setAvailability(driverId, true);
    }
}

module.exports = new MatchingService();
