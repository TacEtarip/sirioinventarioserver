import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {UserSchema} from '../models/userModel';
import config from '../../config/index';

const User = mongoose.model('User', UserSchema);

export const adminLoginRequired = (req, res, next) => {
    if(req.user && req.user.aud.split(' ')[1] === 'admin'){
        next();
    }else{
        return res.status(401).json({message: 'Usuario No Autorizado'});
    }
};

export const normalLoginRequired = (req, res, next) => {
    if(req.user && (req.user.aud.split(' ')[1] === 'vent' || req.user.aud.split(' ')[1] === 'admin')){
        next();
    }else{
        return res.status(401).json({message: 'Usuario No Autorizado'});
    }
};

export const register = async (req, res) => {
    try {
        const displayName = req.body.username;
        const newUser = new User(req.body);
        newUser.displayName = displayName;
        newUser.username = displayName.toLowerCase();
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
        username: req.body.username.toLowerCase()
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
                return res.json({displayName: user.displayName, username: req.body.username, success:true, message: 'Success', type: user.type, 
                        token: jwt.sign({ aud: user.username + ' ' + user.type, 
                        _id: user.id}, config[process.env.NODE_ENV].jwtKey)});
            }
        }
    });
};