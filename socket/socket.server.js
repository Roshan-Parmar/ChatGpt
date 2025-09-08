const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { GeneratorRes, generateVector } = require("../services/ai.service");
const memoryModel = require("../models/memory.model");
const { createMemory, queryMemory } = require("./vector.service");

async function initSocketServer(httpServer) {
  
  const io = new Server(httpServer, {
     cors: {
            origin: "http://localhost:5173",
            allowedHeaders: [ "Content-Type", "Authorization" ],
            credentials: true
        }
  });

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
      console.log(socket.user );
      next();
    } catch (error) {
      next(new Error("Unautharized user : Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("user-message", async (UserMessage) => {
    
    console.log(socket.user);
    console.log(UserMessage);  

    const [message , vector] = await Promise.all([
        memoryModel.create({
          user: socket.user._id,
          chat: UserMessage.chat,
          content: UserMessage.content,
      role: "user",
      }),
      generateVector(UserMessage.content)
    ]);

    const [memory] = await Promise.all([
        queryMemory({
        queryVector: vector,
        limit: 3,
        metadata: {},
      }),
      
    createMemory({
        vectors: vector,
        messageId: message._id,
        metadata: {
          chat: UserMessage.chat,
          user: socket.user._id,
          actualData: UserMessage.content,
        },
      })
    ])

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

      console.log(AiResponse);

      socket.emit("Ai-response", {
        Content: AiResponse,
        Chat: UserMessage.chat,
      });

     const[responseMessage , responseVector] = await Promise.all([
        memoryModel.create({
        user: socket.user._id,
        chat: UserMessage.chat,
        content: AiResponse,
        role: "model",
      }),
      generateVector(AiResponse),
    ]);

      await createMemory({
        vectors: responseVector,
        messageId: responseMessage._id,
        metadata: {
          chat: UserMessage.chat,
          user: socket.user._id,
          actualData: AiResponse,
        },
      });

    });
  });
}

module.exports = initSocketServer;