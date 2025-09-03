const mongoose = require("mongoose");
function connectToDb(){
    mongoose.connect(process.env.MONGODB)
    .then(()=>{
        console.log("Connected to database");
    })
    .catch((error)=>{
        console.log(error);
    });
}

module.exports = connectToDb;