// backend/src/modules/tenants/tenant.service.js
const { v4: uuidv4 } = require('uuid');
const Tenant = require('./tenant.model');
const { getTenantConnection } = require('../../config/tenantDbManager');
const { logger } = require('../../config/logger');
const { createDefaultAdminForTenant } = require('../users/user.service');
const { ensureDefaultRolesForTenant } = require('../users/role.service');

const registerTenant = async (data) => {
    const {
        name,
        address,
        contactEmail,
        contactPhone,
        licenseNumber,
        domain,
    } = data;

    const existingTenant = await Tenant.findOne({
        $or: [{ licenseNumber }, { domain }],
    });

    if (existingTenant) {
        throw {
            status: 400,
            message: 'Tenant with this license or domain already exists',
        };
    }

    const tenantId = uuidv4();
    const verificationToken = uuidv4();

    const tenant = await Tenant.create({
        tenantId,
        name,
        address,
        contactEmail,
        contactPhone,
        licenseNumber,
        domain,
        verificationToken,
        status: 'PENDING',
    });

    // Create tenant DB
    const tenantConnection = await getTenantConnection(tenantId);

    // Seed default roles
    await ensureDefaultRolesForTenant(tenantConnection);

    // Create default admin user for this tenant
    const { user: adminUser, plainPassword } = await createDefaultAdminForTenant({
        tenantId,
        domain,
        contactEmail,
        hospitalName: name,
    });

    logger.info(`Tenant created with ID ${tenantId} and default admin ${adminUser.username}`);

    return {
        tenant,
        adminUser,
        adminPassword: plainPassword, // for initial login (show only once)
    };
};

const verifyTenant = async (token) => {
    const tenant = await Tenant.findOne({ verificationToken: token });

    if (!tenant) {
        throw {
            status: 400,
            message: 'Invalid or expired verification token',
        };
    }

    tenant.status = 'ACTIVE';
    tenant.verificationToken = null;
    await tenant.save();

    logger.info(`Tenant verified: ${tenant.tenantId}`);

    return tenant;
};

module.exports = {
    registerTenant,
    verifyTenant,
};
