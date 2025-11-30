const express = require('express');
const appointmentController = require('./appointment.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { requirePermissions } = require('../../middleware/rbacMiddleware');
const { attachTenantDb } = require('../../middleware/tenantMiddleware');

const router = express.Router();

// Apply tenant resolution and auth to all routes
router.use(authenticate);
router.use(attachTenantDb);

router.post(
    '/',
    requirePermissions('APPOINTMENT:CREATE'),
    appointmentController.createAppointment
);

router.get(
    '/',
    requirePermissions('APPOINTMENT:READ'),
    appointmentController.listAppointments
);

router.patch(
    '/:appointmentId',
    requirePermissions('APPOINTMENT:UPDATE'),
    appointmentController.updateAppointment
);

module.exports = router;
