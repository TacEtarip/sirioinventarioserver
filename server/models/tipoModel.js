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
    },

    codigo: {
        type: String,
    },

    subTipo: {
        type: [String]
    }

});

export default Tipochema;

