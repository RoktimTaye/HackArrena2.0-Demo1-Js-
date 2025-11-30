// backend/src/modules/users/user.controller.js
const userService = require('./user.service');
const { logAuditEvent } = require('../audit/audit.service');

/**
 * HOSPITAL_ADMIN creates a new user in their tenant
 */
const createUser = async (req, res, next) => {
    try {
        const tenantConnection = req.db;

        const user = await userService.createUser(tenantConnection, req.body);

        await logAuditEvent(tenantConnection, {
            tenantId: req.tenantId,
            userId: req.user.userId,
            action: 'USER_CREATE',
            resource: 'USER',
            resourceId: user._id.toString(),
            metadata: { username: user.username, roles: user.roles },
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles,
                department: user.department,
                status: user.status,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List users (with basic filters)
 */
const listUsers = async (req, res, next) => {
    try {
        const tenantConnection = req.db;

        const { page, limit, role, status, search } = req.query;

        const result = await userService.listUsers(tenantConnection, {
            page,
            limit,
            role,
            status,
            search,
        });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const { id } = req.params;

        const user = await userService.getUserById(tenantConnection, id);

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const { id } = req.params;

        const user = await userService.updateUser(tenantConnection, id, req.body);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const { id } = req.params;
        const { status } = req.body;

        const user = await userService.updateUserStatus(tenantConnection, id, status);

        res.json({
            success: true,
            message: 'User status updated successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    listUsers,
    getUser,
    updateUser,
    updateUserStatus,
};
