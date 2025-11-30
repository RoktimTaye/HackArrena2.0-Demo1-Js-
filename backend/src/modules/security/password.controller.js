// backend/src/modules/security/password.controller.js
const passwordService = require('./password.service');
const { logAuditEvent } = require('../audit/audit.service');
const { getTenantConnection } = require('../../config/tenantDbManager');

const forgotPassword = async (req, res, next) => {
    try {
        const { tenantDomain, usernameOrEmail } = req.body;

        const result = await passwordService.forgotPassword({
            tenantDomain,
            usernameOrEmail,
        });

        res.json({
            success: true,
            message: result.message,
            data: {
                resetToken: result.resetToken, // dev-only helper
            },
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { tenantDomain, token, newPassword } = req.body;

        const result = await passwordService.resetPassword({
            tenantDomain,
            token,
            newPassword,
        });

        // Need tenant connection to log audit
        try {
            const tenant = await require('../tenants/tenant.model').findOne({ domain: tenantDomain });
            if (tenant) {
                const tenantConnection = await getTenantConnection(tenant.tenantId);
                await logAuditEvent(tenantConnection, {
                    tenantId: tenant.tenantId,
                    userId: 'SYSTEM', // or unknown
                    action: 'PASSWORD_RESET',
                    resource: 'USER',
                    resourceId: 'UNKNOWN',
                    metadata: { tenantDomain },
                });
            }
        } catch (e) {
            // ignore audit error on public endpoint
        }

        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const user = req.user;

        const { oldPassword, newPassword } = req.body;

        const result = await passwordService.changePassword(tenantConnection, user, {
            oldPassword,
            newPassword,
        });

        await logAuditEvent(tenantConnection, {
            tenantId: req.tenantId,
            userId: user.userId,
            action: 'PASSWORD_CHANGE',
            resource: 'USER',
            resourceId: user.userId,
            metadata: { username: user.username },
        });

        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    forgotPassword,
    resetPassword,
    changePassword,
};
