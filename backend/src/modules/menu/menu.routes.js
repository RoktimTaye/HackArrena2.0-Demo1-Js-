// backend/src/modules/menu/menu.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./menu.controller');
const { authenticate } = require('../../middleware/authMiddleware');

// Get dynamic menu for logged-in user
router.get('/', authenticate, controller.getMenu);

module.exports = router;
