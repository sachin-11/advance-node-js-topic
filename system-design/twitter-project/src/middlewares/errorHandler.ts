import { Request, Response, NextFunction } from 'express';
import { AppError } from '../models/types';

/**
 * Global error handling middleware
 */
export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error('Error:', err);

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            statusCode: err.statusCode,
        });
        return;
    }

    // Default to 500 for unknown errors
    res.status(500).json({
        error: 'Internal server error',
        statusCode: 500,
    });
}
