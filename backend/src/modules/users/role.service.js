// backend/src/modules/users/role.service.js
const { getRoleModel } = require('./role.model');
const { PERMISSIONS } = require('../../utils/permissions');
const { logger } = require('../../config/logger');

/**
 * Ensure default roles exist in a tenant DB.
 */
const ensureDefaultRolesForTenant = async (tenantConnection) => {
    const Role = getRoleModel(tenantConnection);

    const existingCount = await Role.countDocuments({});
    if (existingCount > 0) {
        return; // already seeded
    }

    const rolesToCreate = [
        {
            name: 'HOSPITAL_ADMIN',
            description: 'Hospital administrator',
            permissions: [
                PERMISSIONS.USER_CREATE,
                PERMISSIONS.USER_READ,
                PERMISSIONS.USER_UPDATE,
                PERMISSIONS.USER_STATUS_UPDATE,
                PERMISSIONS.PATIENT_CREATE,
                PERMISSIONS.PATIENT_READ,
                PERMISSIONS.PATIENT_UPDATE,
                PERMISSIONS.PATIENT_UPDATE,
                PERMISSIONS.PRESCRIPTION_READ,
                PERMISSIONS.LAB_CREATE,
                PERMISSIONS.LAB_READ,
                PERMISSIONS.LAB_UPDATE,
                PERMISSIONS.VITALS_CREATE,
                PERMISSIONS.VITALS_READ,
                PERMISSIONS.APPOINTMENT_CREATE,
                PERMISSIONS.APPOINTMENT_READ,
                PERMISSIONS.APPOINTMENT_UPDATE,
                PERMISSIONS.MENU_VIEW,
            ],
        },
        {
            name: 'DOCTOR',
            description: 'Doctor',
            permissions: [
                PERMISSIONS.PATIENT_READ,
                PERMISSIONS.PRESCRIPTION_CREATE,
                PERMISSIONS.PRESCRIPTION_READ,
                PERMISSIONS.LAB_CREATE,
                PERMISSIONS.LAB_READ,
                PERMISSIONS.LAB_UPDATE,
                PERMISSIONS.VITALS_CREATE,
                PERMISSIONS.VITALS_READ,
                PERMISSIONS.APPOINTMENT_READ,
                PERMISSIONS.APPOINTMENT_UPDATE,
                PERMISSIONS.MENU_VIEW,
            ],
        },
        {
            name: 'NURSE',
            description: 'Nurse',
            permissions: [
                PERMISSIONS.PATIENT_READ,
                PERMISSIONS.PRESCRIPTION_READ,
                PERMISSIONS.MENU_VIEW,
            ],
        },
        {
            name: 'RECEPTIONIST',
            description: 'Receptionist',
            permissions: [
                PERMISSIONS.PATIENT_CREATE,
                PERMISSIONS.PATIENT_READ,
                PERMISSIONS.MENU_VIEW,
            ],
        },
        {
            name: 'SUPER_ADMIN',
            description: 'Platform super admin',
            permissions: ['*'], // all
        },
    ];

    await Role.insertMany(rolesToCreate);

    logger.info('Default roles created for tenant');
};

/**
 * Resolve permissions for user roles in a tenant DB.
 */
const getPermissionsForUserRoles = async (tenantConnection, userRoles = []) => {
    const Role = getRoleModel(tenantConnection);

    if (!userRoles || userRoles.length === 0) {
        return [];
    }

    // If SUPER_ADMIN -> all
    if (userRoles.includes('SUPER_ADMIN')) {
        return ['*'];
    }

    const roles = await Role.find({ name: { $in: userRoles } });

    const permissionsSet = new Set();

    roles.forEach((role) => {
        (role.permissions || []).forEach((perm) => permissionsSet.add(perm));
    });

    return Array.from(permissionsSet);
};

module.exports = {
    ensureDefaultRolesForTenant,
    getPermissionsForUserRoles,
};
