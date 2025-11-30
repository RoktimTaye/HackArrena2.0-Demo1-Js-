// backend/src/middleware/errorHandler.js
const { logger } = require('../config/logger');

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
};

/**
 * Centralized error handler
 */
const errorHandler = (err, req, res, next) => {
    logger.error('Error handler:', err);

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = {
    notFoundHandler,
    errorHandler,
};
