import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Check if response has already been sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Generic error response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'An error occurred on the server'
      : err.message
  });
};