const express = require('express');
const router = express.Router();
const { userLogin, userRegister } = require('../controllers/user.controller');

router.post("/register", userRegister);

router.post("/login", userLogin);

module.exports = router;