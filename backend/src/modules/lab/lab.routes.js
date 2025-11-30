const express = require('express');
const multer = require('multer');
const labController = require('./lab.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { requirePermissions } = require('../../middleware/rbacMiddleware');
const { attachTenantDb } = require('../../middleware/tenantMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply tenant resolution and auth to all routes
router.use(authenticate);
router.use(attachTenantDb);

router.post(
    '/',
    requirePermissions('LAB:CREATE'),
    labController.createLabRequest
);

router.get(
    '/',
    requirePermissions('LAB:READ'),
    labController.listLabRequests
);

router.post(
    '/:requestId/results',
    requirePermissions('LAB:UPDATE'),
    upload.single('file'),
    labController.uploadLabResult
);

module.exports = router;
