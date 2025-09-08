const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const Controller = require("../controllers/chat.controller");

router.post("/" , authMiddleware , Controller.chatController);

router.get('/ms', authMiddleware, Controller.getChats)

router.get('/messages/:id', authMiddleware, Controller.getMessages)

module.exports = router;