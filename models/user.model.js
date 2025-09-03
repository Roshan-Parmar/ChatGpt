const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password :{
        type : String,
    },
    username : {
        firstname : {
        type : String,
        required : true,
        },
        lastname : {
        type : String,
        required : true,
        },
    }
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;