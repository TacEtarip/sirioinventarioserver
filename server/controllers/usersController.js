import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {UserSchema} from '../models/userModel';
import config from '../../config/index';

const User = mongoose.model('User', UserSchema);

export const loginRequired = (req, res, next) => {
    if(req.user && req.user.type === 'admin'){
        next();
    }else{
        return res.status(401).json({message: 'Unauthorized User'});
    }
};

export const register = async (req, res) => {
    try {
        const newUser = new User(req.body);
        newUser.hashPassword = await bcrypt.hash(req.body.password, 10);
        const savedUSer = await newUser.save();
        savedUSer.hashPassword = undefined;
        return res.json(savedUSer);
    } catch (error) {
        return res.status(400).send({
            message: error
        });
    }
};

export const login = (req, res) => {
    User.findOne({
        username: req.body.username
    }, (err, user) => {
        if(err){
            throw err;
        }
        if(!user){
            return res.status(401).json({username: req.body.username, success:false ,message: 'Authenticacion failed. No user found!', token: null});
        } else if(user){
            if(!user.comparePassword(req.body.password, user.hashPassword)){
                return res.status(401).json({username: req.body.username, success:false ,message: 'Authenticacion failed. Incorrect Password!', token: null});
            } else {
                return res.json({username: req.body.username, success:true, message: 'Success', token: jwt.sign({type: user.type, username: user.username, 
                        _id: user.id}, config.develoment.jwtKey)});
            }
        }
    });
};