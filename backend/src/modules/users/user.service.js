// backend/src/modules/users/user.service.js
const bcrypt = require('bcryptjs');
const { getUserModel } = require('./user.model');
const { getTenantConnection } = require('../../config/tenantDbManager');
const { validatePassword } = require('../../utils/passwordPolicy');
const { logger } = require('../../config/logger');

/**
 * Create a user in a given tenant connection.
 * Used by API (HOSPITAL_ADMIN) and also by tenant onboarding for default admin.
 */
const createUser = async (tenantConnection, data, options = {}) => {
    const User = getUserModel(tenantConnection);

    const {
        username,
        email,
        firstName,
        lastName,
        password,
        roles = [],
        department,
        attributes = {},
    } = data;

    if (!username || !email || !firstName || !lastName || !password) {
        throw { status: 400, message: 'Missing required user fields' };
    }

    // Enforce password policy unless explicitly overridden
    if (!options.skipPasswordPolicy) {
        const { valid, errors } = validatePassword(password);
        if (!valid) {
            throw { status: 400, message: errors.join('. ') };
        }
    }

    const existing = await User.findOne({ username });
    if (existing) {
        throw { status: 400, message: 'Username already exists' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        firstName,
        lastName,
        passwordHash,
        roles,
        department,
        attributes,
        status: 'ACTIVE',
    });

    return user;
};

/**
 * Create default HOSPITAL_ADMIN user for a newly registered tenant.
 * Returns both user and plainPassword (so controller can send/show it once).
 */
const createDefaultAdminForTenant = async ({
    tenantId,
    domain,
    contactEmail,
    hospitalName,
}) => {
    const tenantConnection = await getTenantConnection(tenantId);
    const User = getUserModel(tenantConnection);

    // If an admin already exists, don't create another
    const existingAdmin = await User.findOne({ roles: { $in: ['HOSPITAL_ADMIN'] } });
    if (existingAdmin) {
        logger.info(`Admin already exists for tenant ${tenantId}, skipping creation`);
        return { user: existingAdmin, plainPassword: null };
    }

    const username = `admin@${domain}`;
    const firstName = 'Hospital';
    const lastName = 'Admin';

    // For hackathon/dev: generate a fixed strong password.
    // In real production you’d generate random and email it.
    const plainPassword = 'Admin@1234';

    const user = await createUser(
        tenantConnection,
        {
            username,
            email: contactEmail,
            firstName,
            lastName,
            password: plainPassword,
            roles: ['HOSPITAL_ADMIN'],
            department: 'ADMIN',
            attributes: { hospitalName },
        },
        {
            // we know the password is strong, but you can keep policy
            skipPasswordPolicy: false,
        }
    );

    logger.info(`Default admin created for tenant ${tenantId} with username ${username}`);

    return { user, plainPassword };
};

/**
 * List users with optional filters + simple pagination
 */
const listUsers = async (tenantConnection, { page = 1, limit = 20, role, status, search }) => {
    const User = getUserModel(tenantConnection);

    const query = {};

    if (role) {
        query.roles = { $in: [role] };
    }

    if (status) {
        query.status = status;
    }

    if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ username: regex }, { email: regex }, { firstName: regex }, { lastName: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
        User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
        User.countDocuments(query),
    ]);

    return {
        items,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
    };
};

const getUserById = async (tenantConnection, userId) => {
    const User = getUserModel(tenantConnection);
    const user = await User.findById(userId);
    if (!user) {
        throw { status: 404, message: 'User not found' };
    }
    return user;
};

const updateUser = async (tenantConnection, userId, data) => {
    const User = getUserModel(tenantConnection);

    const allowedFields = ['firstName', 'lastName', 'email', 'department', 'roles', 'attributes'];
    const update = {};

    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            update[key] = data[key];
        }
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
        throw { status: 404, message: 'User not found' };
    }

    return user;
};

const updateUserStatus = async (tenantConnection, userId, status) => {
    const User = getUserModel(tenantConnection);
    const allowedStatuses = ['ACTIVE', 'INACTIVE', 'LOCKED', 'PASSWORD_EXPIRED'];

    if (!allowedStatuses.includes(status)) {
        throw { status: 400, message: 'Invalid status value' };
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true }
    );

    if (!user) {
        throw { status: 404, message: 'User not found' };
    }

    return user;
};

module.exports = {
    createUser,
    createDefaultAdminForTenant,
    listUsers,
    getUserById,
    updateUser,
    updateUserStatus,
};
