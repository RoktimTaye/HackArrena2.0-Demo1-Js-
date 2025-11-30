// backend/src/modules/menu/menu.service.js

/**
 * Base menu definition.
 * Frontend will map `key` or `path` to routes.
 *
 * Each item has:
 * - key: unique key
 * - label: translation key or display text
 * - path: frontend route path
 * - icon: optional, just a string ID (frontend decides actual icon)
 * - allowedRoles: array of roles that can see this item
 * - children: nested menu items (same shape)
 */
const BASE_MENU = [
    {
        key: 'dashboard',
        label: 'menu.dashboard',
        path: '/app/dashboard',
        icon: 'dashboard',
        allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SUPER_ADMIN'],
    },
    {
        key: 'patients',
        label: 'menu.patients',
        icon: 'patients',
        allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SUPER_ADMIN'],
        children: [
            {
                key: 'patients.list',
                label: 'menu.patients.list',
                path: '/app/patients',
                allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SUPER_ADMIN'],
            },
            {
                key: 'patients.create',
                label: 'menu.patients.create',
                path: '/app/patients/new',
                allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SUPER_ADMIN'],
            },
        ],
    },
    {
        key: 'prescriptions',
        label: 'menu.prescriptions',
        icon: 'prescriptions',
        allowedRoles: ['DOCTOR', 'HOSPITAL_ADMIN', 'NURSE', 'SUPER_ADMIN'],
        children: [
            {
                key: 'prescriptions.create',
                label: 'menu.prescriptions.create',
                path: '/app/prescriptions/new',
                allowedRoles: ['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'],
            },
        ],
    },
    {
        key: 'users',
        label: 'menu.users',
        icon: 'users',
        allowedRoles: ['HOSPITAL_ADMIN', 'SUPER_ADMIN'],
        children: [
            {
                key: 'users.list',
                label: 'menu.users.list',
                path: '/app/users',
                allowedRoles: ['HOSPITAL_ADMIN', 'SUPER_ADMIN'],
            },
            {
                key: 'users.create',
                label: 'menu.users.create',
                path: '/app/users/new',
                allowedRoles: ['HOSPITAL_ADMIN', 'SUPER_ADMIN'],
            },
        ],
    },
    {
        key: 'profile',
        label: 'menu.profile',
        path: '/app/profile',
        icon: 'profile',
        allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SUPER_ADMIN'],
    },
];

/**
 * Check if any of the user's roles is in allowedRoles.
 */
const isAllowedForUser = (userRoles, allowedRoles) => {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true;
    if (!Array.isArray(userRoles)) return false;
    return userRoles.some((r) => allowedRoles.includes(r));
};

/**
 * Recursively filter menu items based on user's roles.
 */
const filterMenuForUser = (userRoles, menuItems) => {
    const result = [];

    for (const item of menuItems) {
        if (!isAllowedForUser(userRoles, item.allowedRoles)) {
            continue;
        }

        const newItem = {
            key: item.key,
            label: item.label,
            path: item.path,
            icon: item.icon,
        };

        if (Array.isArray(item.children) && item.children.length > 0) {
            const filteredChildren = filterMenuForUser(userRoles, item.children);
            if (filteredChildren.length > 0) {
                newItem.children = filteredChildren;
            }
        }

        result.push(newItem);
    }

    return result;
};

/**
 * Main service: get menu for user based on their roles.
 */
const getMenuForUser = (user) => {
    const roles = user.roles || [];
    const menu = filterMenuForUser(roles, BASE_MENU);
    return menu;
};

module.exports = {
    getMenuForUser,
};
