const express = require("express");
const userRouter = require("../routes/user.route");
const app = express();
const cookiesParser = require("cookie-parser");
const chatRouter = require("../routes/chat.route");

app.use(cookiesParser());
app.use(express.json());
app.use("/auth", userRouter);
app.use("/chat", chatRouter);


module.exports = app;