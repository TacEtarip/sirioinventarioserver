import {Schema} from 'mongoose';
import bcrypt from 'bcrypt';

export const UserSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    hashPassword: {
        type: String,
        required: true
    },
    type: {
        type: String, 
        required: true,
        trim: true,
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    }
});

UserSchema.methods.comparePassword = async (password, hashPassword) => {
    try {
        const result = await bcrypt.compare(password, hashPassword);
        return result;
    } catch (error) {
        return error;
    }
};
