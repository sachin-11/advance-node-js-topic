/**
 * Validation Middleware
 * Validates request data before processing
 */

/**
 * Validate location object
 */
function validateLocation(location, fieldName = 'location') {
    if (!location) {
        return { valid: false, error: `${fieldName} is required` };
    }

    if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return { valid: false, error: `${fieldName} must have numeric lat and lng properties` };
    }

    if (location.lat < -90 || location.lat > 90) {
        return { valid: false, error: `${fieldName}.lat must be between -90 and 90` };
    }

    if (location.lng < -180 || location.lng > 180) {
        return { valid: false, error: `${fieldName}.lng must be between -180 and 180` };
    }

    return { valid: true };
}

/**
 * Validate ride request
 */
function validateRideRequest(req, res, next) {
    const { riderId, pickup, dropoff } = req.body;

    if (!riderId) {
        return res.status(400).json({
            success: false,
            error: 'riderId is required'
        });
    }

    const pickupValidation = validateLocation(pickup, 'pickup');
    if (!pickupValidation.valid) {
        return res.status(400).json({
            success: false,
            error: pickupValidation.error
        });
    }

    const dropoffValidation = validateLocation(dropoff, 'dropoff');
    if (!dropoffValidation.valid) {
        return res.status(400).json({
            success: false,
            error: dropoffValidation.error
        });
    }

    next();
}

/**
 * Validate fare estimate request
 */
function validateFareEstimate(req, res, next) {
    const { pickup, dropoff } = req.body;

    const pickupValidation = validateLocation(pickup, 'pickup');
    if (!pickupValidation.valid) {
        return res.status(400).json({
            success: false,
            error: pickupValidation.error
        });
    }

    const dropoffValidation = validateLocation(dropoff, 'dropoff');
    if (!dropoffValidation.valid) {
        return res.status(400).json({
            success: false,
            error: dropoffValidation.error
        });
    }

    next();
}

/**
 * Validate driver location update
 */
function validateDriverLocation(req, res, next) {
    const { location } = req.body;

    const locationValidation = validateLocation(location, 'location');
    if (!locationValidation.valid) {
        return res.status(400).json({
            success: false,
            error: locationValidation.error
        });
    }

    next();
}

module.exports = {
    validateRideRequest,
    validateFareEstimate,
    validateDriverLocation,
    validateLocation
};
