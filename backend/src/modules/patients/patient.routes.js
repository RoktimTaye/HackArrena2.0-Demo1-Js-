// backend/src/modules/patients/patient.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./patient.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { attachTenantDb } = require('../../middleware/tenantMiddleware');
const { requireRoles } = require('../../middleware/rbacMiddleware');
const { applyDoctorDepartmentScope } = require('../../middleware/abacMiddleware');
// All patient routes require authentication & tenant DB
router.use(authenticate, attachTenantDb);

/**
 * Create patient:
 * roles: HOSPITAL_ADMIN, DOCTOR, NURSE, RECEPTIONIST
 */
router.post(
    '/',
    applyDoctorDepartmentScope,
    requireRoles('HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SUPER_ADMIN'),
    controller.createPatient
);

/**
 * List patients:
 * roles: HOSPITAL_ADMIN, DOCTOR, NURSE, RECEPTIONIST
 * - ABAC inside service ensures doctors see only their department.
 */
router.get(
    '/',
    applyDoctorDepartmentScope,
    requireRoles('HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SUPER_ADMIN'),
    controller.listPatients
);

/**
 * Get patient by patientId:
 * same roles as list.
 */
router.get(
    '/:patientId',
    applyDoctorDepartmentScope,
    requireRoles('HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'SUPER_ADMIN'),
    controller.getPatient
);

module.exports = router;
