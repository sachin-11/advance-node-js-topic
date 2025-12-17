import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  // Handle specific error types
  if (err.message?.includes('Authentication') || err.message?.includes('token')) {
    res.status(401).json({
      status: 'error',
      message: err.message || 'Authentication failed',
    });
    return;
  }

  if (err.message?.includes('not found')) {
    res.status(404).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err.message?.includes('already') || err.message?.includes('Invalid')) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err.message?.includes('Unauthorized') || err.message?.includes('Only')) {
    res.status(403).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
