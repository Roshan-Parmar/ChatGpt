const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const {GeneratorRes} = require("../services/ai.service");
const memoryModel = require("../models/memory.model");

async function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async(socket,next)=>{

    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if(!cookies.token){
        next(new Error("Unautharized user : No token found"));
    }

    try{
        const decoded  = jwt.verify(cookies.token , process.env.SECRET);

        const user = await userModel.findOne({
            id : decoded._id
        })

        socket.user = user;
        next()
    }
    catch(error){
        next(new Error("Unautharized user : Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("user-message", async (UserMessage) =>{

        await memoryModel.create({
            user : socket.user._id,
            chat : UserMessage.chat,
            content : UserMessage.content,
            role : "user"
        })

        const chatHistory = await memoryModel.find({
            chat : UserMessage.chat
        }).sort({createAt : -1}).limit().lean().reverse();


        // console.log("ChatHistory ");

        const AiResponse = await GeneratorRes(chatHistory.map(item => {
            return {
                role : item.role,
                parts : [{text : item.content}]
            }
        }));

         await memoryModel.create({
            user : socket.user._id,
            chat : UserMessage.chat,
            content : AiResponse,
            role : "model"
        })

        socket.emit("Ai-response",{
            Content : AiResponse,
            Chat : UserMessage.chat
        });
    });
  });

}

module.exports = initSocketServer;