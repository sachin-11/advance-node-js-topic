/**
 * Ride Model
 * In-memory storage for rides
 */

const RIDE_STATUS = {
    PENDING: 'PENDING',
    MATCHED: 'MATCHED',
    ACCEPTED: 'ACCEPTED',
    ARRIVED: 'ARRIVED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

class RideStore {
    constructor() {
        this.rides = new Map();
    }

    /**
     * Create new ride
     */
    create(rideData) {
        const rideId = `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const ride = {
            id: rideId,
            ...rideData,
            status: RIDE_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            statusHistory: [{
                status: RIDE_STATUS.PENDING,
                timestamp: new Date().toISOString()
            }]
        };

        this.rides.set(rideId, ride);
        return ride;
    }

    /**
     * Get ride by ID
     */
    get(rideId) {
        return this.rides.get(rideId);
    }

    /**
     * Get all rides
     */
    getAll() {
        return Array.from(this.rides.values());
    }

    /**
     * Update ride status
     */
    updateStatus(rideId, newStatus, metadata = {}) {
        const ride = this.get(rideId);
        if (!ride) return null;

        ride.status = newStatus;
        ride.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            ...metadata
        });

        this.rides.set(rideId, ride);
        return ride;
    }

    /**
     * Assign driver to ride
     */
    assignDriver(rideId, driverId) {
        const ride = this.get(rideId);
        if (ride) {
            ride.driverId = driverId;
            this.rides.set(rideId, ride);
        }
        return ride;
    }

    /**
     * Get active rides
     */
    getActive() {
        return this.getAll().filter(ride =>
            ride.status !== RIDE_STATUS.COMPLETED &&
            ride.status !== RIDE_STATUS.CANCELLED
        );
    }

    /**
     * Get pending rides
     */
    getPending() {
        return this.getAll().filter(ride => ride.status === RIDE_STATUS.PENDING);
    }
}

module.exports = {
    RideStore: new RideStore(),
    RIDE_STATUS
};
