const express = require('express');
const vitalsController = require('./vitals.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { requirePermissions } = require('../../middleware/rbacMiddleware');
const { attachTenantDb } = require('../../middleware/tenantMiddleware');

const router = express.Router();

// Apply tenant resolution and auth to all routes
router.use(authenticate);
router.use(attachTenantDb);

router.post(
    '/',
    requirePermissions('VITALS:CREATE'),
    vitalsController.createVitals
);

router.get(
    '/',
    requirePermissions('VITALS:READ'),
    vitalsController.listVitals
);

module.exports = router;
