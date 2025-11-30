// backend/src/modules/users/user.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { attachTenantDb } = require('../../middleware/tenantMiddleware');
const { requireRoles } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const { createUserSchema, updateUserStatusSchema } = require('./user.validation');

// All routes here require authentication + tenant context
router.use(authenticate, attachTenantDb);

// HOSPITAL_ADMIN (and maybe SUPER_ADMIN) can manage users
router.post('/', requireRoles('HOSPITAL_ADMIN', 'SUPER_ADMIN'), validate(createUserSchema), controller.createUser);
router.get('/', requireRoles('HOSPITAL_ADMIN', 'SUPER_ADMIN'), controller.listUsers);
router.get('/:id', requireRoles('HOSPITAL_ADMIN', 'SUPER_ADMIN'), controller.getUser);
router.patch('/:id', requireRoles('HOSPITAL_ADMIN', 'SUPER_ADMIN'), controller.updateUser);
router.patch('/:id/status', requireRoles('HOSPITAL_ADMIN', 'SUPER_ADMIN'), validate(updateUserStatusSchema), controller.updateUserStatus);

module.exports = router;
