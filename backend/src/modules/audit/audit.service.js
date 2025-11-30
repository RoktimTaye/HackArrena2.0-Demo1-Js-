// backend/src/modules/audit/audit.service.js
const { getAuditLogModel } = require('./audit.model');
const { logger } = require('../../config/logger');

const logAuditEvent = async (
    tenantConnection,
    { tenantId, userId, action, resource, resourceId, metadata = {} }
) => {
    try {
        const AuditLog = getAuditLogModel(tenantConnection);

        await AuditLog.create({
            tenantId,
            userId,
            action,
            resource,
            resourceId,
            metadata,
        });

        logger.info(
            `Audit: tenant=${tenantId} user=${userId} action=${action} resource=${resource} resourceId=${resourceId || ''}`
        );
    } catch (err) {
        logger.error('Error writing audit log:', err.message);
    }
};

module.exports = {
    logAuditEvent,
};
