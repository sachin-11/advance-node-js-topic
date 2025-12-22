/**
 * Socket.io Event Handlers
 * Handles all real-time WebSocket events
 */

const { DriverStore, RideStore, RIDE_STATUS } = require('../models');
const MatchingService = require('../services/MatchingService');
const PaymentService = require('../services/PaymentService');
const LocationService = require('../services/LocationService');
const SurgePricingService = require('../services/SurgePricingService');
const { calculateDistance } = require('../utils/distance');

function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // ═══════════════════════════════════════════
        // DRIVER EVENTS
        // ═══════════════════════════════════════════

        /**
         * Driver goes online
         * Event: driver:online
         * Data: { driverId, name, location, vehicleType, zone }
         */
        socket.on('driver:online', async (data) => {
            const { driverId, name, location, vehicleType, zone } = data;

            await DriverStore.set(driverId, {
                name: name,
                socketId: socket.id,
                location: location,
                vehicleType: vehicleType || 'uberx',
                zone: zone || 'downtown',
                isAvailable: true,
                rating: 4.8,
                joinedAt: new Date().toISOString()
            });

            console.log(`✅ Driver ${driverId} (${name}) is ONLINE`);

            socket.emit('driver:status', {
                status: 'online',
                message: 'You are now online and ready to accept rides'
            });
        });

        /**
         * Driver goes offline
         * Event: driver:offline
         */
        socket.on('driver:offline', async (data) => {
            const { driverId } = data;
            await DriverStore.setAvailability(driverId, false);

            console.log(`⏸️  Driver ${driverId} is OFFLINE`);

            socket.emit('driver:status', {
                status: 'offline',
                message: 'You are now offline'
            });
        });

        /**
         * Driver location update
         * Event: driver:location
         * Data: { driverId, location, rideId }
         */
        socket.on('driver:location', async (data) => {
            const { driverId, location, rideId } = data;

            // Update location
            await LocationService.updateDriverLocation(driverId, location);

            // If on a ride, broadcast to rider
            if (rideId) {
                const ride = await RideStore.get(rideId);
                if (ride) {
                    const destination = ride.status === RIDE_STATUS.ACCEPTED ? ride.pickup : ride.dropoff;
                    const { distance, eta } = LocationService.calculateETAToDestination(location, destination);

                    io.to(`ride:${rideId}`).emit('driver:location_update', {
                        driverId: driverId,
                        location: location,
                        distance: distance,
                        eta: eta,
                        timestamp: new Date().toISOString()
                    });

                    // Check if arrived
                    if (ride.status === RIDE_STATUS.ACCEPTED && LocationService.hasArrived(location, ride.pickup)) {
                        await RideStore.updateStatus(rideId, RIDE_STATUS.ARRIVED);
                        io.to(`ride:${rideId}`).emit('ride:status_changed', {
                            rideId: rideId,
                            status: RIDE_STATUS.ARRIVED,
                            message: 'Driver has arrived at pickup!'
                        });
                    }
                }
            }
        });

        // ═══════════════════════════════════════════
        // RIDER EVENTS
        // ═══════════════════════════════════════════

        /**
         * Ride request
         * Event: ride:request
         * Data: { riderId, name, pickup, dropoff, rideType, zone }
         */
        socket.on('ride:request', async (data) => {
            const { riderId, name, pickup, dropoff, rideType, zone } = data;

            console.log(`\n🚕 RIDE REQUEST from ${riderId} (${name})`);

            // Get surge multiplier
            const surgeMultiplier = SurgePricingService.getSurgeMultiplier(zone || 'downtown');

            // Estimate fare
            const fareEstimate = PaymentService.estimateFare(pickup, dropoff, surgeMultiplier);

            // Create ride
            const ride = await RideStore.create({
                riderId: riderId,
                riderName: name,
                pickup: pickup,
                dropoff: dropoff,
                rideType: rideType || 'uberx',
                zone: zone || 'downtown',
                distance: fareEstimate.distance,
                estimatedDuration: fareEstimate.estimatedDuration,
                estimatedFare: fareEstimate.total,
                surgeMultiplier: surgeMultiplier
            });

            console.log(`   Ride ID: ${ride.id}`);
            console.log(`   Estimated Fare: ₹${fareEstimate.total}`);

            // Join ride room
            socket.join(`ride:${ride.id}`);

            // Find nearest driver
            const matchResult = await MatchingService.matchRide(ride);

            if (!matchResult.success) {
                console.log(`   ❌ No drivers available`);
                socket.emit('ride:no_drivers', {
                    message: 'No drivers available nearby'
                });
                return;
            }

            const driver = matchResult.driver;
            console.log(`   ✅ MATCHED with Driver: ${driver.id}`);
            console.log(`   📍 Distance to pickup: ${driver.distanceToPickup.toFixed(2)} km`);
            console.log(`   ⏱️  ETA: ${driver.eta} mins`);

            // Update ride
            await RideStore.assignDriver(ride.id, driver.id);
            await RideStore.updateStatus(ride.id, RIDE_STATUS.MATCHED, { driverId: driver.id });

            // Notify driver
            io.to(driver.socketId).emit('ride:new_request', {
                rideId: ride.id,
                rider: { id: riderId, name: name },
                pickup: pickup,
                dropoff: dropoff,
                fare: fareEstimate.total,
                distance: fareEstimate.distance
            });

            // Notify rider
            socket.emit('ride:matched', {
                rideId: ride.id,
                driver: {
                    id: driver.id,
                    name: driver.name,
                    rating: driver.rating,
                    vehicleType: driver.vehicleType,
                    location: driver.location
                },
                fare: fareEstimate,
                eta: driver.eta
            });
        });

        /**
         * Rider joins tracking
         * Event: rider:track
         */
        socket.on('rider:track', (data) => {
            const { rideId } = data;
            socket.join(`ride:${rideId}`);
            console.log(`👤 Rider joined tracking for ride: ${rideId}`);
        });

        // ═══════════════════════════════════════════
        // RIDE LIFECYCLE EVENTS
        // ═══════════════════════════════════════════

        /**
         * Driver accepts ride
         */
        socket.on('ride:accept', async (data) => {
            const { rideId } = data;
            await RideStore.updateStatus(rideId, RIDE_STATUS.ACCEPTED);

            console.log(`\n✅ Ride ${rideId} ACCEPTED`);

            io.to(`ride:${rideId}`).emit('ride:status_changed', {
                rideId: rideId,
                status: RIDE_STATUS.ACCEPTED,
                message: 'Driver is on the way!'
            });
        });

        /**
         * Start ride
         */
        socket.on('ride:start', async (data) => {
            const { rideId } = data;
            await RideStore.updateStatus(rideId, RIDE_STATUS.IN_PROGRESS, {
                startedAt: new Date().toISOString()
            });

            console.log(`\n🚗 Ride ${rideId} STARTED`);

            io.to(`ride:${rideId}`).emit('ride:status_changed', {
                rideId: rideId,
                status: RIDE_STATUS.IN_PROGRESS,
                message: 'Ride started!'
            });
        });

        /**
         * Complete ride
         */
        socket.on('ride:complete', async (data) => {
            const { rideId } = data;
            const ride = await RideStore.get(rideId);

            if (!ride) return;

            await RideStore.updateStatus(rideId, RIDE_STATUS.COMPLETED, {
                completedAt: new Date().toISOString()
            });

            console.log(`\n✅ Ride ${rideId} COMPLETED`);

            // Calculate final fare
            const fare = PaymentService.calculateFare(
                ride.distance,
                ride.estimatedDuration,
                ride.surgeMultiplier
            );

            // Process payment
            const paymentResult = await PaymentService.processPayment(ride, fare);

            console.log(`   💰 Final Fare: ₹${fare.total}`);

            // Release driver
            await MatchingService.releaseDriver(ride.driverId);

            // Notify completion
            io.to(`ride:${rideId}`).emit('ride:completed', {
                rideId: rideId,
                message: 'Ride completed!',
                receipt: paymentResult.receipt
            });
        });

        /**
         * Cancel ride
         */
        socket.on('ride:cancel', async (data) => {
            const { rideId, reason } = data;
            const ride = await RideStore.get(rideId);

            if (ride) {
                await RideStore.updateStatus(rideId, RIDE_STATUS.CANCELLED, {
                    cancelledAt: new Date().toISOString(),
                    reason: reason
                });

                // Release driver if assigned
                if (ride.driverId) {
                    await MatchingService.releaseDriver(ride.driverId);
                }

                console.log(`\n❌ Ride ${rideId} CANCELLED`);

                io.to(`ride:${rideId}`).emit('ride:cancelled', {
                    rideId: rideId,
                    message: 'Ride cancelled'
                });
            }
        });

        // ═══════════════════════════════════════════
        // DISCONNECT
        // ═══════════════════════════════════════════

        socket.on('disconnect', async () => {
            console.log(`\n❌ Client disconnected: ${socket.id}`);

            // Remove driver if disconnected
            const driver = await DriverStore.removeBySocketId(socket.id);
            if (driver) {
                console.log(`   Driver ${driver.id} removed from online list`);
            }
        });
    });
}

module.exports = setupSocketHandlers;
