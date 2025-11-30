// backend/src/modules/prescriptions/prescription.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./prescription.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { attachTenantDb } = require('../../middleware/tenantMiddleware');
const { requireRoles } = require('../../middleware/rbacMiddleware');

// All prescription routes require authentication + tenant DB
router.use(authenticate, attachTenantDb);

/**
 * Create prescription:
 * roles: DOCTOR (primary), HOSPITAL_ADMIN, SUPER_ADMIN
 */
router.post(
    '/',
    requireRoles('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'),
    controller.createPrescription
);

/**
 * List prescriptions (usually by patientId param):
 * roles: DOCTOR, HOSPITAL_ADMIN, NURSE, SUPER_ADMIN
 */
router.get(
    '/',
    requireRoles('DOCTOR', 'HOSPITAL_ADMIN', 'NURSE', 'SUPER_ADMIN'),
    controller.listPrescriptions
);

/**
 * Get single prescription by prescriptionId
 */
router.get(
    '/:prescriptionId',
    requireRoles('DOCTOR', 'HOSPITAL_ADMIN', 'NURSE', 'SUPER_ADMIN'),
    controller.getPrescription
);

module.exports = router;
