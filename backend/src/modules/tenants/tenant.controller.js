// backend/src/modules/tenants/tenant.controller.js
const tenantService = require('./tenant.service');

const registerTenant = async (req, res, next) => {
    try {
        const { tenant, adminUser, adminPassword } = await tenantService.registerTenant(req.body);

        res.status(201).json({
            success: true,
            message: 'Hospital registered successfully. Verify email to activate account.',
            data: {
                tenantId: tenant.tenantId,
                domain: tenant.domain,
                status: tenant.status,
                // For hackathon/dev: return initial admin credentials
                admin: {
                    username: adminUser.username,
                    email: adminUser.email,
                    tempPassword: adminPassword,
                },
                verificationToken: tenant.verificationToken, // remove in real prod
            },
        });
    } catch (error) {
        next(error);
    }
};

const verifyTenant = async (req, res, next) => {
    try {
        const token = req.query.token;
        const tenant = await tenantService.verifyTenant(token);

        res.json({
            success: true,
            message: 'Hospital verified successfully',
            data: {
                tenantId: tenant.tenantId,
                status: tenant.status,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerTenant,
    verifyTenant,
};
