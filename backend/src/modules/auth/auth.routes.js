const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const { validate } = require('../../middleware/validationMiddleware');
const { loginSchema, refreshSchema } = require('./auth.validation');

router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refreshToken);
router.post('/logout', controller.logout);

module.exports = router;
