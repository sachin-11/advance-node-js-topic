/**
 * Distance Calculation Utilities
 * Uses Haversine formula for calculating distance between two GPS coordinates
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate ETA based on distance and average speed
 * @param {number} distance - Distance in km
 * @param {number} avgSpeed - Average speed in km/h (default: 30)
 * @returns {number} ETA in minutes
 */
function calculateETA(distance, avgSpeed = 30) {
    const hours = distance / avgSpeed;
    const minutes = Math.ceil(hours * 60);
    return minutes;
}

module.exports = {
    calculateDistance,
    calculateETA
};
