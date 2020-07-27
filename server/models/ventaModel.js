import {Schema} from 'mongoose';

const CantidadOrderSC = new Schema({
    name: {type: String},
    nameSecond: {type: String},
    cantidadDisponible: {type: Number},
    cantidadVenta: {type: Number},
});

const DocumentoSchema = new Schema({
    type: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        trim: true,
    },

    codigo: {
        type: Number,
        trim: true,
    }
}, { _id : false });

const ItemVendidoSchema = new Schema({
    codigo: {
        type: String,
        required: true,
        trim: true,
    },

    name: {
        type: String,
        trim: true,
    },

    descripcion: {
        type: String,
        trim: true,
    },

    priceIGV: {
        type: Number,
        required: true,
        trim: true,
    },

    priceNoIGV: {
        type: Number,
        required: true,
        trim: true,
    },

    cantidad: {
        type: Number,
        required: true,
        trim: true,
        min: 0
    },

    cantidadSC: {
        type: [CantidadOrderSC],
        default: []
    },

    totalPrice: {
        type: Number
    },

    totalPriceNoIGV: {
        type: Number
    }
    
}, { _id : false });

const VentaSchema = new Schema ({

    codigo: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    
    totalPrice: {
        type: Number,
        trim: true,
        required: true,
    },

    totalPriceNoIGV: {
        type: Number,
        trim: true,
        required: true,
    },

    estado: {
        type: String,
        trim: true,
        required: true,
    },

    documento: {
        type: DocumentoSchema,
    },

    itemsVendidos: {
        type: [ItemVendidoSchema],
        required: true
    },

    date:{
        type: Date,
        default: Date.now
    },

});

export default VentaSchema;

