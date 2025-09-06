const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { GeneratorRes, generateVector } = require("../services/ai.service");
const memoryModel = require("../models/memory.model");
const { createMemory, queryMemory } = require("./vector.service");

async function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      next(new Error("Unautharized user : No token found"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.SECRET);

      const user = await userModel.findOne({
        id: decoded._id,
      });

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Unautharized user : Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("user-message", async (UserMessage) => {

      try {
        const message = await memoryModel.create({
          user: socket.user._id,
          chat: UserMessage.chat,
          content: UserMessage.content,
          role: "user",
        });
        console.log("Message saved:", message);
      } catch (err) {
        console.error("Failed to save message:", err);
      }

      const vector = await generateVector(UserMessage.content);

      const memory = await queryMemory({
        queryVector: vector,
        limit: 3,
        metadata: {},
      });

      console.log(memory);

      await createMemory({
        vectors: vector,
        messageId: "845782347587267",
        metadata: {
          chat: UserMessage.chat,
          user: socket.user._id,
          actualData: UserMessage.content,
        },
      });

      let chatHistory = await memoryModel
        .find({
          chat: UserMessage.chat,
        })
        .sort({ createdAt: -1 }) // sort newest first
        .limit(20)
        .lean();

      chatHistory = chatHistory.reverse(); // oldest → newest

      const stm  =  chatHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.content }],
        }))

      const ltm =   [
        {
            role : "user",
            parts : [{ text : `${memory.map(item => item.metadata.text)}` }]
        }
      ]

      const AiResponse = await GeneratorRes([...ltm,...stm]);

      const responseMessage = await memoryModel.create({
        user: socket.user._id,
        chat: UserMessage.chat,
        content: AiResponse,
        role: "model",
      });

      const responseVector = await generateVector(AiResponse);

      await createMemory({
        vectors: responseVector,
        messageId: responseMessage._id,
        metadata: {
          chat: UserMessage.chat,
          user: socket.user._id,
          actualData: AiResponse,
        },
      });

      socket.emit("Ai-response", {
        Content: AiResponse,
        Chat: UserMessage.chat,
      });
    });
  });
}

module.exports = initSocketServer;
