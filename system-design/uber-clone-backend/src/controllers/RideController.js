/**
 * Ride Controller
 * Handles HTTP requests for rides
 */

const { RideStore, RIDE_STATUS, DriverStore } = require('../models');
const MatchingService = require('../services/MatchingService');
const PaymentService = require('../services/PaymentService');
const SurgePricingService = require('../services/SurgePricingService');

class RideController {
    /**
     * Get all rides
     */
    async getAllRides(req, res) {
        try {
            const rides = await RideStore.getAll();
            res.json({
                success: true,
                total: rides.length,
                rides: rides
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch rides',
                message: error.message
            });
        }
    }

    /**
     * Get ride by ID
     */
    async getRideById(req, res) {
        try {
            const ride = await RideStore.get(req.params.id);

            if (!ride) {
                return res.status(404).json({
                    success: false,
                    error: 'Ride not found'
                });
            }

            res.json({
                success: true,
                ride: ride
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch ride',
                message: error.message
            });
        }
    }

    /**
     * Get active rides
     */
    async getActiveRides(req, res) {
        try {
            const activeRides = await RideStore.getActive();
            res.json({
                success: true,
                total: activeRides.length,
                rides: activeRides
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch active rides',
                message: error.message
            });
        }
    }

    /**
     * Request a new ride (REST API endpoint)
     */
    async requestRide(req, res) {
        try {
            const { riderId, riderName, pickup, dropoff, rideType, zone, paymentMethod } = req.body;

            // Validation
            if (!riderId || !pickup || !dropoff) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields',
                    required: ['riderId', 'pickup', 'dropoff']
                });
            }

            if (!pickup.lat || !pickup.lng || !dropoff.lat || !dropoff.lng) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid location format',
                    message: 'Pickup and dropoff must have lat and lng properties'
                });
            }

            // Get surge multiplier
            const surgeMultiplier = SurgePricingService.getSurgeMultiplier(zone || 'downtown');

            // Estimate fare
            const fareEstimate = PaymentService.estimateFare(pickup, dropoff, surgeMultiplier);

            // Create ride
            const ride = await RideStore.create({
                riderId: riderId,
                riderName: riderName || 'Rider',
                pickup: pickup,
                dropoff: dropoff,
                rideType: rideType || 'uberx',
                zone: zone || 'downtown',
                paymentMethod: paymentMethod || 'cash',
                distance: fareEstimate.distance,
                estimatedDuration: fareEstimate.estimatedDuration,
                estimatedFare: fareEstimate.total,
                surgeMultiplier: surgeMultiplier
            });

            // Find nearest driver
            const matchResult = await MatchingService.matchRide(ride);

            if (!matchResult.success) {
                return res.status(503).json({
                    success: false,
                    error: 'No drivers available',
                    ride: ride,
                    message: 'Please try again later'
                });
            }

            const driver = matchResult.driver;

            // Update ride
            RideStore.assignDriver(ride.id, driver.id);
            RideStore.updateStatus(ride.id, RIDE_STATUS.MATCHED, { driverId: driver.id });

            res.status(201).json({
                success: true,
                message: 'Ride requested successfully',
                ride: {
                    ...ride,
                    driverId: driver.id,
                    status: RIDE_STATUS.MATCHED
                },
                driver: {
                    id: driver.id,
                    name: driver.name,
                    rating: driver.rating,
                    vehicleType: driver.vehicleType,
                    location: driver.location,
                    distanceToPickup: driver.distanceToPickup,
                    eta: driver.eta
                },
                fare: fareEstimate
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to request ride',
                message: error.message
            });
        }
    }

    /**
     * Accept ride (Driver accepts a ride)
     */
    async acceptRide(req, res) {
        try {
            const { rideId } = req.params;
            const { driverId } = req.body;

            const ride = await RideStore.get(rideId);

            if (!ride) {
                return res.status(404).json({
                    success: false,
                    error: 'Ride not found'
                });
            }

            if (ride.status !== RIDE_STATUS.MATCHED) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ride status',
                    currentStatus: ride.status,
                    message: 'Ride must be in MATCHED status to accept'
                });
            }

            if (driverId && ride.driverId !== driverId) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'This ride is not assigned to you'
                });
            }

            await RideStore.updateStatus(rideId, RIDE_STATUS.ACCEPTED);

            const updatedRide = await RideStore.get(rideId);
            res.json({
                success: true,
                message: 'Ride accepted successfully',
                ride: updatedRide
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to accept ride',
                message: error.message
            });
        }
    }

    /**
     * Start ride
     */
    async startRide(req, res) {
        try {
            const { rideId } = req.params;
            const ride = await RideStore.get(rideId);

            if (!ride) {
                return res.status(404).json({
                    success: false,
                    error: 'Ride not found'
                });
            }

            if (ride.status !== RIDE_STATUS.ARRIVED && ride.status !== RIDE_STATUS.ACCEPTED) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ride status',
                    currentStatus: ride.status,
                    message: 'Ride must be ACCEPTED or ARRIVED to start'
                });
            }

            await RideStore.updateStatus(rideId, RIDE_STATUS.IN_PROGRESS, {
                startedAt: new Date().toISOString()
            });

            const updatedRide = await RideStore.get(rideId);
            res.json({
                success: true,
                message: 'Ride started successfully',
                ride: updatedRide
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to start ride',
                message: error.message
            });
        }
    }

    /**
     * Complete ride
     */
    async completeRide(req, res) {
        try {
            const { rideId } = req.params;
            const ride = RideStore.get(rideId);

            if (!ride) {
                return res.status(404).json({
                    success: false,
                    error: 'Ride not found'
                });
            }

            if (ride.status !== RIDE_STATUS.IN_PROGRESS) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ride status',
                    currentStatus: ride.status,
                    message: 'Ride must be IN_PROGRESS to complete'
                });
            }

            await RideStore.updateStatus(rideId, RIDE_STATUS.COMPLETED, {
                completedAt: new Date().toISOString()
            });

            // Calculate final fare
            const fare = PaymentService.calculateFare(
                ride.distance,
                ride.estimatedDuration,
                ride.surgeMultiplier
            );

            // Process payment
            const paymentResult = await PaymentService.processPayment(ride, fare);

            // Release driver
            if (ride.driverId) {
                await MatchingService.releaseDriver(ride.driverId);
            }

            const updatedRide = await RideStore.get(rideId);
            res.json({
                success: true,
                message: 'Ride completed successfully',
                ride: updatedRide,
                receipt: paymentResult.receipt
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to complete ride',
                message: error.message
            });
        }
    }

    /**
     * Cancel ride
     */
    async cancelRide(req, res) {
        try {
            const { rideId } = req.params;
            const { reason } = req.body;

            const ride = await RideStore.get(rideId);

            if (!ride) {
                return res.status(404).json({
                    success: false,
                    error: 'Ride not found'
                });
            }

            if (ride.status === RIDE_STATUS.COMPLETED) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot cancel completed ride'
                });
            }

            if (ride.status === RIDE_STATUS.CANCELLED) {
                return res.status(400).json({
                    success: false,
                    error: 'Ride already cancelled'
                });
            }

            await RideStore.updateStatus(rideId, RIDE_STATUS.CANCELLED, {
                cancelledAt: new Date().toISOString(),
                reason: reason || 'Cancelled by user'
            });

            // Release driver if assigned
            if (ride.driverId) {
                await MatchingService.releaseDriver(ride.driverId);
            }

            const updatedRide = await RideStore.get(rideId);
            res.json({
                success: true,
                message: 'Ride cancelled successfully',
                ride: updatedRide
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to cancel ride',
                message: error.message
            });
        }
    }

    /**
     * Estimate fare
     */
    estimateFare(req, res) {
        try {
            const { pickup, dropoff, surgeMultiplier, zone } = req.body;

            if (!pickup || !dropoff) {
                return res.status(400).json({
                    success: false,
                    error: 'Pickup and dropoff locations required'
                });
            }

            if (!pickup.lat || !pickup.lng || !dropoff.lat || !dropoff.lng) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid location format',
                    message: 'Pickup and dropoff must have lat and lng properties'
                });
            }

            // Get surge multiplier from zone if not provided
            let finalSurgeMultiplier = surgeMultiplier;
            if (!finalSurgeMultiplier && zone) {
                finalSurgeMultiplier = SurgePricingService.getSurgeMultiplier(zone);
            }

            const estimate = PaymentService.estimateFare(
                pickup,
                dropoff,
                finalSurgeMultiplier || 1.0
            );

            res.json({
                success: true,
                estimate: estimate
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to estimate fare',
                message: error.message
            });
        }
    }
}

module.exports = new RideController();
