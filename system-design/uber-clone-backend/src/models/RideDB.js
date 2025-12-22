/**
 * Ride Model - PostgreSQL Implementation
 * Database-backed ride storage
 */

const db = require('../database/connection');
const { RIDE_STATUS } = require('./Ride');

class RideStoreDB {
    /**
     * Create new ride
     */
    async create(rideData) {
        const rideId = `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const {
            riderId, riderName, pickup, dropoff, rideType, zone,
            paymentMethod, distance, estimatedDuration, estimatedFare, surgeMultiplier
        } = rideData;

        const query = `
            INSERT INTO rides (
                id, rider_id, rider_name, pickup_lat, pickup_lng,
                dropoff_lat, dropoff_lng, ride_type, zone, payment_method,
                distance, estimated_duration, estimated_fare, surge_multiplier, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *;
        `;

        const values = [
            rideId,
            riderId,
            riderName || null,
            pickup.lat,
            pickup.lng,
            dropoff.lat,
            dropoff.lng,
            rideType || 'uberx',
            zone || 'downtown',
            paymentMethod || 'cash',
            distance || null,
            estimatedDuration || null,
            estimatedFare || null,
            surgeMultiplier || 1.0,
            RIDE_STATUS.PENDING
        ];

        const result = await db.query(query, values);
        const ride = this._mapRowToRide(result.rows[0]);

        // Add initial status to history
        await this.updateStatus(rideId, RIDE_STATUS.PENDING);

        return ride;
    }

    /**
     * Get ride by ID
     */
    async get(rideId) {
        const query = 'SELECT * FROM rides WHERE id = $1';
        const result = await db.query(query, [rideId]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this._mapRowToRideWithHistory(result.rows[0]);
    }

    /**
     * Get all rides
     */
    async getAll() {
        const query = 'SELECT * FROM rides ORDER BY created_at DESC';
        const result = await db.query(query);
        return await Promise.all(result.rows.map(row => this._mapRowToRideWithHistory(row)));
    }

    /**
     * Update ride status
     */
    async updateStatus(rideId, newStatus, metadata = {}) {
        // Update ride status
        let updateQuery = 'UPDATE rides SET status = $1, updated_at = CURRENT_TIMESTAMP';
        const values = [newStatus];

        // Add timestamp fields based on status
        if (newStatus === RIDE_STATUS.IN_PROGRESS) {
            updateQuery += ', started_at = CURRENT_TIMESTAMP';
        } else if (newStatus === RIDE_STATUS.COMPLETED) {
            updateQuery += ', completed_at = CURRENT_TIMESTAMP';
        } else if (newStatus === RIDE_STATUS.CANCELLED) {
            updateQuery += ', cancelled_at = CURRENT_TIMESTAMP';
            if (metadata.reason) {
                updateQuery += ', cancellation_reason = $2';
                values.push(metadata.reason);
            }
        }

        updateQuery += ' WHERE id = $' + (values.length + 1);
        values.push(rideId);
        updateQuery += ' RETURNING *;';

        const result = await db.query(updateQuery, values);

        if (result.rows.length === 0) {
            return null;
        }

        // Add to status history
        const historyQuery = `
            INSERT INTO ride_status_history (ride_id, status, metadata)
            VALUES ($1, $2, $3);
        `;

        await db.query(historyQuery, [rideId, newStatus, JSON.stringify(metadata)]);

        return await this._mapRowToRideWithHistory(result.rows[0]);
    }

    /**
     * Assign driver to ride
     */
    async assignDriver(rideId, driverId) {
        const query = `
            UPDATE rides 
            SET driver_id = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `;

        const result = await db.query(query, [driverId, rideId]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this._mapRowToRideWithHistory(result.rows[0]);
    }

    /**
     * Get active rides
     */
    async getActive() {
        const query = `
            SELECT * FROM rides 
            WHERE status NOT IN ($1, $2)
            ORDER BY created_at DESC
        `;

        const result = await db.query(query, [RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED]);
        return await Promise.all(result.rows.map(row => this._mapRowToRideWithHistory(row)));
    }

    /**
     * Get pending rides
     */
    async getPending() {
        const query = `
            SELECT * FROM rides 
            WHERE status = $1
            ORDER BY created_at DESC
        `;

        const result = await db.query(query, [RIDE_STATUS.PENDING]);
        return await Promise.all(result.rows.map(row => this._mapRowToRideWithHistory(row)));
    }

    /**
     * Update final fare
     */
    async updateFinalFare(rideId, finalFare, actualDuration) {
        const query = `
            UPDATE rides 
            SET final_fare = $1, actual_duration = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *;
        `;

        const result = await db.query(query, [finalFare, actualDuration, rideId]);

        if (result.rows.length === 0) {
            return null;
        }

        return await this._mapRowToRideWithHistory(result.rows[0]);
    }

    /**
     * Map database row to ride object with history
     */
    async _mapRowToRideWithHistory(row) {
        const ride = this._mapRowToRide(row);

        // Get status history
        const historyQuery = `
            SELECT status, metadata, timestamp
            FROM ride_status_history
            WHERE ride_id = $1
            ORDER BY timestamp ASC;
        `;

        const historyResult = await db.query(historyQuery, [ride.id]);
        ride.statusHistory = historyResult.rows.map(h => ({
            status: h.status,
            timestamp: h.timestamp.toISOString(),
            ...(h.metadata ? JSON.parse(h.metadata) : {})
        }));

        return ride;
    }

    /**
     * Map database row to ride object
     */
    _mapRowToRide(row) {
        return {
            id: row.id,
            riderId: row.rider_id,
            riderName: row.rider_name,
            driverId: row.driver_id,
            status: row.status,
            pickup: {
                lat: parseFloat(row.pickup_lat),
                lng: parseFloat(row.pickup_lng)
            },
            dropoff: {
                lat: parseFloat(row.dropoff_lat),
                lng: parseFloat(row.dropoff_lng)
            },
            rideType: row.ride_type,
            zone: row.zone,
            paymentMethod: row.payment_method,
            distance: row.distance ? parseFloat(row.distance) : null,
            estimatedDuration: row.estimated_duration,
            actualDuration: row.actual_duration,
            estimatedFare: row.estimated_fare ? parseFloat(row.estimated_fare) : null,
            finalFare: row.final_fare ? parseFloat(row.final_fare) : null,
            surgeMultiplier: parseFloat(row.surge_multiplier),
            startedAt: row.started_at ? row.started_at.toISOString() : null,
            completedAt: row.completed_at ? row.completed_at.toISOString() : null,
            cancelledAt: row.cancelled_at ? row.cancelled_at.toISOString() : null,
            cancellationReason: row.cancellation_reason,
            createdAt: row.created_at.toISOString(),
            updatedAt: row.updated_at.toISOString(),
            statusHistory: [] // Will be populated by _mapRowToRideWithHistory
        };
    }
}

module.exports = {
    RideStoreDB: new RideStoreDB(),
    RIDE_STATUS
};
