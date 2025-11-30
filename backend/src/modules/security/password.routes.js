// backend/src/modules/security/password.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./password.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { attachTenantDb } = require('../../middleware/tenantMiddleware');

// Public: forgot + reset (tenantDomain + username/email + token)
router.post('/forgot', controller.forgotPassword);
router.post('/reset', controller.resetPassword);

// Authenticated: change password
router.post('/change', authenticate, attachTenantDb, controller.changePassword);

module.exports = router;
