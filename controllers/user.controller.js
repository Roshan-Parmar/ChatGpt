const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function userRegister(req,res){
    const {username : {firstname , lastname} , email, password} = req.body
    const isUserExist = await userModel.findOne({
    email,
    });

    if(isUserExist){
        return res.status(400).json({
            message : "User with this email already exists",
        });
    }
    
    const hashPass = await bcrypt.hash(password,10);

    const user = await userModel.create({
        username : {
            firstname,
            lastname,
        },
        email,
        password : hashPass,
    });

    const token = jwt.sign({ id : user._id} , process.env.SECRET );
    
    res.cookie("token",token);

    res.status(201).json({
        message : "Register Successfully....",
        user,
        token,
    });
};

async function userLogin(req,res){
    const {email,password} = req.body;
    const isUserExist = await userModel.findOne({
        email,
    });

    if(!isUserExist){
        return res.status(401).json({
            message : "Invalid email , pleas try again...",
        });
    }

    const isPassword = await bcrypt.compare(password,isUserExist.password);

    if(!isPassword){
        return res.status(401).json({
            messagae : "Invalid password , please try again",
        });
    }

    const token  = jwt.sign({id : isUserExist._id}, process.env.SECRET);
    res.cookie("token" , token);

    res.status(200).json({
        message:"You logged in successfully",
        isUserExist,
        token,
    });
}

module.exports = {userLogin , userRegister};