// backend/src/config/tenantDbManager.js
const mongoose = require('mongoose');
const { logger } = require('./logger');

/**
 * Map of tenantId -> mongoose connection
 */
const tenantConnections = new Map();

/**
 * Get the DB name for a tenant.
 * You can customize the naming strategy here.
 */
const getTenantDbName = (tenantId) => {
    return `hms_tenant_${tenantId}`;
};

/**
 * Get existing or create new tenant-specific connection.
 */
const getTenantConnection = async (tenantId) => {
    if (!tenantId) {
        throw new Error('Tenant ID is required to get tenant connection');
    }

    // Prevent accidental "undefined" or "null" string databases
    if (tenantId === 'undefined' || tenantId === 'null' || tenantId.trim() === '') {
        throw new Error(`Invalid Tenant ID: ${tenantId}`);
    }

    if (tenantConnections.has(tenantId)) {
        return tenantConnections.get(tenantId);
    }

    const masterUri = process.env.MASTER_DB_URI;
    if (!masterUri) {
        throw new Error('MASTER_DB_URI is not defined');
    }

    // Re-use same Mongo server, different DB name
    const dbName = getTenantDbName(tenantId);
    const uri = `${masterUri.substring(0, masterUri.lastIndexOf('/'))}/${dbName}`;

    logger.info(`Creating new connection for tenant ${tenantId} -> DB ${dbName}`);

    const connection = await mongoose.createConnection(uri, {
        // options if needed
    });

    tenantConnections.set(tenantId, connection);
    return connection;
};

/**
 * Close all tenant connections (for graceful shutdown)
 */
const closeAllTenantConnections = async () => {
    for (const [tenantId, conn] of tenantConnections.entries()) {
        try {
            await conn.close();
            logger.info(`Closed connection for tenant ${tenantId}`);
        } catch (err) {
            logger.error(`Error closing connection for tenant ${tenantId}: ${err.message}`);
        }
    }
    tenantConnections.clear();
};

module.exports = {
    getTenantConnection,
    closeAllTenantConnections,
    getTenantDbName,
};
