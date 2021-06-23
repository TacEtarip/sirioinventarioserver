import {Schema} from 'mongoose';

import { CantidadOrderSC } from './communModels';

const OrderSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },

    nameSecond: {
        type: String,
        trim: true,
    },

    cantidad: {
        type: Number,
        min: 0
    }

}, { _id : false });

const SubCantidadSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },

    nameSecond: {
        type: String,
        trim: true,
    },

    order: {
        type: [OrderSchema]
    }
}, { _id : false });

const VariacionSchema = new Schema ({
    date:{
        type: Date,
        default: Date.now
    },
    cantidad: {
        type: Number,
        default: 0,
        min: 0
    },
    tipo: {
        type: Boolean,
        default: false
    },
    comentario: {
        type: String,
        trim: true,
    },
    costoVar: {
        type: Number,
    },
    cantidadSC: {
        type: [CantidadOrderSC],
        default: []
    },
    usuario: {
        type: String,
        default: 'desconocido'
    }
}, { _id : false });


const ItemSchema = new Schema ({
    name:{
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    
    nameLowerCase: {
        type: String,
        trim: true,
        lowercase: true
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
        min: 0
    },

    subConteo: {
        type: SubCantidadSchema
    },
    
    variaciones: {
        type: [VariacionSchema]
    },

    codigo: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    tipo: {
        type: String,
        required: true,
        trim: true,
    },

    subTipo: {
        type: String,
        default: 'noone',
        trim: true,
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
    },

    marca: {
        type: String,
        default: 'noone'
    },

    costoPropio: {
        type: Number
    },

    multiSearchParams: {
        type: String,
        trim: true,
    },

    deleted: {
        type: Boolean,
        default: false,
    }, 

    tags: {
        type: [String],
        default: []
    },

    caracteristicas: {
        type: [String],
        default: []
    },

    orderNumber: {
        type: Number,
        default: -1
    }

});

ItemSchema.index({
            nameLowerCase: 'text', 
            tipo: 'text', 
            subTipo: 'text', 
            marca: 'text',
            description: 'text',
            tags: 'text'
            });

export default ItemSchema;

