// Packages
import dotenv from 'dotenv';
dotenv.config();
// ENV
const NODE_ENV = process.env.NODE_ENV;

// --------------------------------------------------------------------------

// Error Handler
export const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  const message = error.message ? error.message : 'Internal Server Error';
  const stack = error.stack ? error.stack : 'Internal Server Error';

  res.status(statusCode).json({
    message: message,
    success: false,
    stack: NODE_ENV == 'development' ? stack : undefined,
    // stack: stack,
  });
};
