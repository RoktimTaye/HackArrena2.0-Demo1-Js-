const express = require('express');
const router = express.Router();
const controller = require('./tenant.controller');
const { validate } = require('../../middleware/validationMiddleware');
const { registerTenantSchema } = require('./tenant.validation');

router.post('/register', validate(registerTenantSchema), controller.registerTenant);
router.get('/verify', controller.verifyTenant);

module.exports = router;
