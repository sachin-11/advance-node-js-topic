/**
 * API Routes
 * Defines all REST API endpoints
 */

const express = require('express');
const router = express.Router();

const RideController = require('../controllers/RideController');
const DriverController = require('../controllers/DriverController');
const StatsController = require('../controllers/StatsController');
const { validateRideRequest, validateFareEstimate, validateDriverLocation } = require('../middleware/validation');

// ═══════════════════════════════════════════
// Health & Stats
// ═══════════════════════════════════════════
router.get('/health', StatsController.healthCheck);
router.get('/stats', StatsController.getStats);

// ═══════════════════════════════════════════
// Rides
// ═══════════════════════════════════════════
router.get('/rides', RideController.getAllRides);
router.get('/rides/active', RideController.getActiveRides);
router.get('/rides/:id', RideController.getRideById);
router.post('/rides/request', validateRideRequest, RideController.requestRide);
router.post('/rides/estimate-fare', validateFareEstimate, RideController.estimateFare);
router.post('/rides/:id/accept', RideController.acceptRide);
router.post('/rides/:id/start', RideController.startRide);
router.post('/rides/:id/complete', RideController.completeRide);
router.post('/rides/:id/cancel', RideController.cancelRide);

// ═══════════════════════════════════════════
// Drivers
// ═══════════════════════════════════════════
router.get('/drivers', DriverController.getAllDrivers);
router.get('/drivers/available', DriverController.getAvailableDrivers);
router.get('/drivers/:id', DriverController.getDriverById);
router.get('/drivers/:id/history', DriverController.getDriverHistory);
router.put('/drivers/:driverId/location', validateDriverLocation, DriverController.updateLocation);

module.exports = router;
