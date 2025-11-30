const { getTenantConnection } = require('../config/tenantDbManager');

/**
 * Tenant middleware:
 * - uses tenantId from req.user
 * - attaches tenant DB connection to req.db
 */
const attachTenantDb = async (req, res, next) => {
    try {
        const user = req.user;
        // Import logger
        const { logger } = require('../config/logger');
        logger.info(`attachTenantDb: req.user = ${JSON.stringify(user)}`);

        if (!user || !user.tenantId) {
            return res.status(400).json({
                success: false,
                message: 'Tenant information missing from token',
            });
        }

        const tenantConnection = await getTenantConnection(user.tenantId);
        req.db = tenantConnection;
        req.tenantId = user.tenantId;

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    attachTenantDb,
};
