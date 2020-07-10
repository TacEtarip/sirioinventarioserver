import {Schema} from 'mongoose';

const Tipochema = new Schema ({
    name:{
        type: String,
        required: true,
        unique: true
    },

    date:{
        type: Date,
        default: Date.now
    }
});

export default Tipochema;

