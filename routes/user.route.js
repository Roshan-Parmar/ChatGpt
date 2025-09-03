const express = require('express');
const userModel = require("../models/user.model");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { userLogin, userRegister } = require('../controllers/user.controller');

router.post("/register", userRegister);

router.post("/login", userLogin);

module.exports = router;