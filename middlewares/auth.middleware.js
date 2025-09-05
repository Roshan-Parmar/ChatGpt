const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authMiddleware(req,res,next){
    const {token} = req.cookies;

    if(!token){
    return res.status(401).json({
        message : "Unautharized",
    })}

    try{
        const decoded = jwt.verify(token,process.env.SECRET);
        if(!decoded) {
            return res.status(403).json({
                message : "Invalid Token",
            });
        }

        const user = await userModel.findOne({
           _id : decoded.id
        })          
        req.user = user;
        next();
    }
    catch(error){
        return res.status(400).json({
            message : "Something went wrong",
        });
    }
}


module.exports = authMiddleware;