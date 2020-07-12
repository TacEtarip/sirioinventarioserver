import {Schema} from 'mongoose';

const ItemSchema = new Schema ({
    name:{
        type: String,
        required: true,
        trim: true,
    },

    priceIGV: {
        type: Number,
        required: true,
    },

    priceNoIGV: {
        type: Number
    },

    cantidad: {
        type: Number,
        default: 0,
    },

    codigo: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    tipo: {
        type: String,
        default: 'Indefinido',
    },

    unidadDeMedida:{
        type: String,
        default: 'UND',
        trim: true
    },

    oferta:{
        type: Number,
        default: 0,
    },

    date:{
        type: Date,
        default: Date.now

    },

    description:{
        type: String,
        trim: true,
    },

    photo: {
        type: String,
        trim: true,
        default: 'noPhoto.jpg',
    },

    ficha: {
        type: Boolean,
        default: false
    }

});

export default ItemSchema;

