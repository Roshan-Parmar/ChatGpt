const chatModel = require("../models/chat.model");
const messageModel = require("../models/memory.model");
async function chatController(req,res){
    const user  = req.user;
    const { title } = req.body;

    const chat = await chatModel.create({
        user : user._id,
        title,
    })

    return res.status(201).json({
        message : "Authanticated user",
        chat : {
            chat_id : chat._id,
            user_id : chat.user,
            title : chat.title,
            lastactivity : chat.lastActivity,
        },   
    });
}

async function getMessages(req, res) {

    const chatId = req.params.id;

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messages
    })

}

async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user._id });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}

module.exports = {
    chatController,
    getChats,
    getMessages
};