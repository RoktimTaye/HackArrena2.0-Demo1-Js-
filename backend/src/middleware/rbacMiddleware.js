// backend/src/middleware/rbacMiddleware.js

const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: user not found in request',
            });
        }

        const userRoles = user.roles || [];

        const hasRole = userRoles.some((role) => allowedRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: insufficient role',
            });
        }

        next();
    };
};

/**
 * Permission-based guard:
 * Checks if user.permissions includes any of requiredPermissions.
 * If user.permissions contains '*', always allowed.
 */
const requirePermissions = (...requiredPermissions) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: user not found in request',
            });
        }

        const perms = user.permissions || [];

        if (perms.includes('*')) {
            return next();
        }

        const hasPermission = perms.some((p) => requiredPermissions.includes(p));

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: insufficient permissions',
            });
        }

        next();
    };
};

module.exports = {
    requireRoles,
    requirePermissions,
};
