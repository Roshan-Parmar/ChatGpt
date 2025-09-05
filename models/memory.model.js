const mongoose  = require("mongoose");

const memoryShema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    chat : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'chat',
    },
    content : {
        type : String,
        required : true,
    },
    role :{
        type : String,
        enum : ["user", "model"],
        default : "user"
    }
} ,{
    timestamps : true
});

const memoryModel = mongoose.model("chathistory" , memoryShema);

module.exports = memoryModel;