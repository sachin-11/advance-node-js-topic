/**
 * Driver Controller
 * Handles HTTP requests for drivers
 */

const { DriverStore } = require('../models');
const LocationService = require('../services/LocationService');

class DriverController {
    /**
     * Get all drivers
     */
    async getAllDrivers(req, res) {
        try {
            const drivers = await DriverStore.getAll();
            res.json({
                success: true,
                total: drivers.length,
                available: drivers.filter(d => d.isAvailable).length,
                busy: drivers.filter(d => !d.isAvailable).length,
                drivers: drivers
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch drivers',
                message: error.message
            });
        }
    }

    /**
     * Get available drivers
     */
    async getAvailableDrivers(req, res) {
        try {
            const drivers = await DriverStore.getAvailable();
            res.json({
                success: true,
                total: drivers.length,
                drivers: drivers
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch available drivers',
                message: error.message
            });
        }
    }

    /**
     * Get driver by ID
     */
    async getDriverById(req, res) {
        try {
            const driver = await DriverStore.get(req.params.id);

            if (!driver) {
                return res.status(404).json({
                    success: false,
                    error: 'Driver not found'
                });
            }

            res.json({
                success: true,
                driver: driver
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch driver',
                message: error.message
            });
        }
    }

    /**
     * Get driver location history
     */
    async getDriverHistory(req, res) {
        try {
            const driverId = req.params.id;
            const driver = await DriverStore.get(driverId);

            if (!driver) {
                return res.status(404).json({
                    success: false,
                    error: 'Driver not found'
                });
            }

            const history = await DriverStore.getLocationHistory(driverId);

            res.json({
                success: true,
                driverId: driverId,
                totalPoints: history.length,
                history: history
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch driver history',
                message: error.message
            });
        }
    }

    /**
     * Update driver location (REST API endpoint)
     */
    async updateLocation(req, res) {
        try {
            const { driverId } = req.params;
            const { location } = req.body;

            if (!location || !location.lat || !location.lng) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid location format',
                    message: 'Location must have lat and lng properties'
                });
            }

            const driver = await DriverStore.get(driverId);

            if (!driver) {
                return res.status(404).json({
                    success: false,
                    error: 'Driver not found'
                });
            }

            LocationService.updateDriverLocation(driverId, location);
            const updatedDriver = await DriverStore.get(driverId);

            res.json({
                success: true,
                message: 'Driver location updated',
                driver: updatedDriver
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to update driver location',
                message: error.message
            });
        }
    }
}

module.exports = new DriverController();
