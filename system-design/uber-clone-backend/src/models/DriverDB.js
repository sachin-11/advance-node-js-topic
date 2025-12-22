/**
 * Driver Model - PostgreSQL Implementation
 * Database-backed driver storage
 */

const db = require('../database/connection');

class DriverStoreDB {
    /**
     * Add or update driver
     */
    async set(driverId, driverData) {
        const { name, socketId, location, vehicleType, zone, isAvailable, rating } = driverData;

        const query = `
            INSERT INTO drivers (
                id, name, socket_id, location_lat, location_lng, 
                vehicle_type, zone, is_available, rating
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                socket_id = EXCLUDED.socket_id,
                location_lat = EXCLUDED.location_lat,
                location_lng = EXCLUDED.location_lng,
                vehicle_type = EXCLUDED.vehicle_type,
                zone = EXCLUDED.zone,
                is_available = EXCLUDED.is_available,
                rating = EXCLUDED.rating,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const values = [
            driverId,
            name,
            socketId || null,
            location.lat,
            location.lng,
            vehicleType || 'uberx',
            zone || 'downtown',
            isAvailable !== undefined ? isAvailable : true,
            rating || 4.8
        ];

        const result = await db.query(query, values);
        return this._mapRowToDriver(result.rows[0]);
    }

    /**
     * Get driver by ID
     */
    async get(driverId) {
        const query = 'SELECT * FROM drivers WHERE id = $1';
        const result = await db.query(query, [driverId]);

        if (result.rows.length === 0) {
            return null;
        }

        return this._mapRowToDriver(result.rows[0]);
    }

    /**
     * Get all drivers
     */
    async getAll() {
        const query = 'SELECT * FROM drivers ORDER BY created_at DESC';
        const result = await db.query(query);
        return result.rows.map(row => this._mapRowToDriver(row));
    }

    /**
     * Get available drivers
     */
    async getAvailable() {
        const query = 'SELECT * FROM drivers WHERE is_available = true ORDER BY created_at DESC';
        const result = await db.query(query);
        return result.rows.map(row => this._mapRowToDriver(row));
    }

    /**
     * Update driver location
     */
    async updateLocation(driverId, location) {
        const query = `
            UPDATE drivers 
            SET location_lat = $1, location_lng = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *;
        `;

        const result = await db.query(query, [location.lat, location.lng, driverId]);

        if (result.rows.length === 0) {
            return null;
        }

        // Store in history
        await this._addLocationHistory(driverId, location);

        return this._mapRowToDriver(result.rows[0]);
    }

    /**
     * Set driver availability
     */
    async setAvailability(driverId, isAvailable) {
        const query = `
            UPDATE drivers 
            SET is_available = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `;

        const result = await db.query(query, [isAvailable, driverId]);

        if (result.rows.length === 0) {
            return null;
        }

        return this._mapRowToDriver(result.rows[0]);
    }

    /**
     * Remove driver
     */
    async remove(driverId) {
        const query = 'DELETE FROM drivers WHERE id = $1';
        await db.query(query, [driverId]);
    }

    /**
     * Remove driver by socket ID
     */
    async removeBySocketId(socketId) {
        const query = 'SELECT * FROM drivers WHERE socket_id = $1';
        const result = await db.query(query, [socketId]);

        if (result.rows.length === 0) {
            return null;
        }

        const driver = this._mapRowToDriver(result.rows[0]);
        await this.remove(driver.id);

        return driver;
    }

    /**
     * Add location to history
     */
    async _addLocationHistory(driverId, location) {
        const query = `
            INSERT INTO driver_location_history (driver_id, location_lat, location_lng)
            VALUES ($1, $2, $3);
        `;

        await db.query(query, [driverId, location.lat, location.lng]);

        // Keep only last 100 locations per driver
        const cleanupQuery = `
            DELETE FROM driver_location_history
            WHERE driver_id = $1
            AND id NOT IN (
                SELECT id FROM driver_location_history
                WHERE driver_id = $1
                ORDER BY timestamp DESC
                LIMIT 100
            );
        `;

        await db.query(cleanupQuery, [driverId]);
    }

    /**
     * Get location history
     */
    async getLocationHistory(driverId) {
        const query = `
            SELECT location_lat, location_lng, timestamp
            FROM driver_location_history
            WHERE driver_id = $1
            ORDER BY timestamp DESC
            LIMIT 100;
        `;

        const result = await db.query(query, [driverId]);
        return result.rows.map(row => ({
            location: {
                lat: parseFloat(row.location_lat),
                lng: parseFloat(row.location_lng)
            },
            timestamp: row.timestamp.toISOString()
        }));
    }

    /**
     * Map database row to driver object
     */
    _mapRowToDriver(row) {
        return {
            id: row.id,
            name: row.name,
            socketId: row.socket_id,
            location: {
                lat: parseFloat(row.location_lat),
                lng: parseFloat(row.location_lng)
            },
            vehicleType: row.vehicle_type,
            zone: row.zone,
            isAvailable: row.is_available,
            rating: parseFloat(row.rating),
            joinedAt: row.joined_at.toISOString(),
            updatedAt: row.updated_at.toISOString()
        };
    }
}

module.exports = new DriverStoreDB();
