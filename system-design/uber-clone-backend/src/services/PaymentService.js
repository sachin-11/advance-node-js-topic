/**
 * Payment Service
 * Handles fare calculation and payment processing
 */

const config = require('../config');
const { calculateDistance } = require('../utils/distance');

class PaymentService {
    /**
     * Calculate fare for a ride
     * @param {number} distance - Distance in km
     * @param {number} duration - Duration in minutes
     * @param {number} surgeMultiplier - Surge multiplier (default: 1.0)
     * @returns {Object} Fare breakdown
     */
    calculateFare(distance, duration, surgeMultiplier = 1.0) {
        const { baseFare, perKm, perMinute, serviceFee, gstRate, minFare } = config.fare;

        // Base calculation
        const distanceFare = distance * perKm;
        const timeFare = duration * perMinute;
        let subtotal = baseFare + distanceFare + timeFare;

        // Apply surge
        subtotal = subtotal * surgeMultiplier;

        // Ensure minimum fare
        subtotal = Math.max(subtotal, minFare);

        // Calculate GST
        const gst = (subtotal + serviceFee) * gstRate;

        // Total
        const total = subtotal + serviceFee + gst;

        return {
            baseFare: Math.round(baseFare),
            distanceFare: Math.round(distanceFare),
            timeFare: Math.round(timeFare),
            subtotal: Math.round(subtotal),
            surgeMultiplier: surgeMultiplier,
            serviceFee: serviceFee,
            gst: Math.round(gst),
            total: Math.round(total)
        };
    }

    /**
     * Estimate fare for a ride
     * @param {Object} pickup - Pickup location
     * @param {Object} dropoff - Dropoff location
     * @param {number} surgeMultiplier - Surge multiplier
     * @returns {Object} Fare estimate
     */
    estimateFare(pickup, dropoff, surgeMultiplier = 1.0) {
        const distance = calculateDistance(
            pickup.lat,
            pickup.lng,
            dropoff.lat,
            dropoff.lng
        );

        // Estimate duration (assuming 30 km/h average speed)
        const duration = Math.ceil((distance / 30) * 60);

        const fare = this.calculateFare(distance, duration, surgeMultiplier);

        return {
            ...fare,
            distance: parseFloat(distance.toFixed(2)),
            estimatedDuration: duration
        };
    }

    /**
     * Generate receipt
     * @param {Object} ride - Ride object
     * @param {Object} fare - Fare object
     * @returns {Object} Receipt
     */
    generateReceipt(ride, fare) {
        return {
            rideId: ride.id,
            date: new Date().toISOString(),
            rider: ride.riderId,
            driver: ride.driverId,
            pickup: ride.pickup,
            dropoff: ride.dropoff,
            distance: ride.distance,
            duration: ride.duration,
            fareBreakdown: fare,
            paymentMethod: ride.paymentMethod || 'Cash',
            status: 'PAID'
        };
    }

    /**
     * Process payment (simulation)
     * @param {Object} ride - Ride object
     * @param {Object} fare - Fare object
     * @returns {Promise<Object>} Payment result
     */
    async processPayment(ride, fare) {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In production, integrate with payment gateway (Stripe, PayPal, etc.)
        const receipt = this.generateReceipt(ride, fare);

        return {
            success: true,
            transactionId: `txn_${Date.now()}`,
            receipt: receipt
        };
    }
}

module.exports = new PaymentService();
