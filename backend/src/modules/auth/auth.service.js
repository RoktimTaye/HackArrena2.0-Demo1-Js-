// backend/src/modules/auth/auth.service.js
const bcrypt = require('bcryptjs');
const Tenant = require('../tenants/tenant.model');
const { getTenantConnection } = require('../../config/tenantDbManager');
const { getUserModel } = require('../users/user.model');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require('../../utils/tokenUtils');
const { logger } = require('../../config/logger');
const { getPermissionsForUserRoles } = require('../users/role.service');

/**
 * Login with tenantDomain + username + password
 */
const login = async ({ tenantId, tenantDomain, username, password }) => {
    if ((!tenantId && !tenantDomain) || !username || !password) {
        throw { status: 400, message: 'tenantId/tenantDomain, username and password are required' };
    }

    // 1. Find tenant
    let tenant;
    logger.info(`Login attempt: ${JSON.stringify({ tenantId, tenantDomain, username })}`);
    if (tenantId) {
        tenant = await Tenant.findOne({ tenantId });
        logger.info(`Lookup by tenantId result: ${tenant ? 'Found' : 'Not Found'}`);
    } else {
        tenant = await Tenant.findOne({ domain: tenantDomain });
        logger.info(`Lookup by domain result: ${tenant ? 'Found' : 'Not Found'}`);
    }

    if (!tenant) {
        logger.info(`Hospital not found for: ${JSON.stringify({ tenantId, tenantDomain })}`);
        throw { status: 404, message: 'Hospital not found' };
    }

    if (tenant.status !== 'ACTIVE') {
        throw { status: 403, message: 'Hospital is not active. Please contact support.' };
    }

    // 2. Get tenant DB connection
    const tenantConnection = await getTenantConnection(tenant.tenantId);

    // 3. Get User model
    const User = getUserModel(tenantConnection);

    // 4. Find user by username
    const user = await User.findOne({ username: username.trim() });
    logger.info(`User lookup result for ${username}: ${user ? 'Found' : 'Not Found'}`);

    if (!user) {
        throw { status: 401, message: 'Invalid credentials' };
    }

    if (user.status === 'INACTIVE') {
        throw { status: 403, message: 'User is inactive' };
    }

    if (user.status === 'LOCKED') {
        throw { status: 403, message: 'User account is locked. Contact admin.' };
    }

    // 5. Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    logger.info(`Password check result: ${isMatch ? 'Match' : 'No Match'}`);
    if (!isMatch) {
        throw { status: 401, message: 'Invalid credentials' };
    }

    const mustChangePassword =
        user.status === 'PASSWORD_EXPIRED' || user.forcePasswordChange === true;

    // Fetch permissions
    const permissions = await getPermissionsForUserRoles(tenantConnection, user.roles || []);

    // 6. Prepare payload for JWT tokens
    const payload = {
        userId: user._id.toString(),
        tenantId: tenant.tenantId,
        roles: user.roles || [],
        permissions,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        status: user.status,
        forcePasswordChange: !!user.forcePasswordChange,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    logger.info(`User ${user.username} logged in for tenant ${tenant.tenantId}`);

    return {
        accessToken,
        refreshToken,
        mustChangePassword,
        user: {
            id: user._id.toString(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roles: user.roles || [],
            permissions,
            department: user.department,
            status: user.status,
            forcePasswordChange: !!user.forcePasswordChange,
            tenantId: tenant.tenantId,
            tenantDomain: tenant.domain,
            tenantName: tenant.name,
        },
    };
};

/**
 * Refresh access token using a refresh token
 */
const refreshTokens = async (refreshToken) => {
    if (!refreshToken) {
        throw { status: 400, message: 'Refresh token is required' };
    }

    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
        throw { status: 401, message: 'Invalid or expired refresh token' };
    }

    const payload = {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        username: decoded.username,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        department: decoded.department,
        status: decoded.status,
        forcePasswordChange: !!decoded.forcePasswordChange,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

/**
 * Stateless logout (frontend just deletes tokens).
 */
const logout = async () => {
    return { message: 'Logged out successfully' };
};

module.exports = {
    login,
    refreshTokens,
    logout,
};
