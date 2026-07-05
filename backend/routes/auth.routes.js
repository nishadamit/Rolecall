const express = require('express');
const router = express.Router();
const { login, logout, getCurrentUser } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getCurrentUser);

module.exports = router;
