const express = require("express");
const userRouter = require("../routes/user.route");
const app = express();

app.use(express.json());

app.use("/auth", userRouter);

module.exports = app;