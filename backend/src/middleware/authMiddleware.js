const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Auth middleware: verifies JWT access token and attaches user to req.user
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authorization header missing or invalid',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded; // { userId, tenantId, roles, ... }
        next();
    } catch (err) {
        // Import logger if not already imported (it's not imported in this file yet!)
        const { logger } = require('../config/logger');
        logger.error(`Token verification failed: ${err.message}`);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};

module.exports = {
    authenticate,
};
