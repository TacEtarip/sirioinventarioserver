import {Schema} from 'mongoose';

const Tipochema = new Schema ({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    date:{
        type: Date,
        default: Date.now
    },

    codigo: {
        type: String,
    },

    subTipo: {
        type: [String],
        trim: true,
    }

});

export default Tipochema;

