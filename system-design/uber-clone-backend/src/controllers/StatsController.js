/**
 * Stats Controller
 * Handles system statistics
 */

const { DriverStore, RideStore } = require('../models');
const SurgePricingService = require('../services/SurgePricingService');

class StatsController {
    /**
     * Get system statistics
     */
    async getStats(req, res) {
        try {
            const drivers = await DriverStore.getAll();
            const rides = await RideStore.getAll();
            const activeRides = await RideStore.getActive();
            const pendingRides = await RideStore.getPending();

            res.json({
                success: true,
                drivers: {
                    total: drivers.length,
                    available: drivers.filter(d => d.isAvailable).length,
                    busy: drivers.filter(d => !d.isAvailable).length
                },
                rides: {
                    total: rides.length,
                    active: activeRides.length,
                    pending: pendingRides.length,
                    completed: rides.filter(r => r.status === 'COMPLETED').length,
                    cancelled: rides.filter(r => r.status === 'CANCELLED').length
                },
                surge: SurgePricingService.getAllZones(),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch stats',
                message: error.message
            });
        }
    }

    /**
     * Health check
     */
    healthCheck(req, res) {
        res.json({
            success: true,
            status: 'ok',
            service: 'uber-clone-backend',
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = new StatsController();
