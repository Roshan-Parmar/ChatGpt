const chatModel = require("../models/chat.model");

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

module.exports = chatController;