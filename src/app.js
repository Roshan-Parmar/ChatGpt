const express = require("express");
const path = require('path');
const cookieParser = require("cookie-parser");
const cors = require('cors');


const chatRouter = require("../routes/chat.route");
const userRouter = require("../routes/user.route");

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));




app.use("/auth", userRouter);
app.use("/chat", chatRouter);

app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;