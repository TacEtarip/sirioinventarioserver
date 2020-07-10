import mongoose from 'mongoose';
import itemSchema from '../models/itemModel';

const Item = mongoose.model('Item', itemSchema);

const IGV = 0.18;

export const addNewItem = async (req, res) => {
    try {
        let newItem = new Item(req.body);
        newItem.priceNoIGV = getNoIGV_Price(newItem.priceIGV);
        newItem.codigo = await generateCode(newItem.name, newItem.tipo);
        const result = await newItem.save();
        return res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});
    }
};

const generateCode = async (name = '', tipo = '') => {
    try {
        const countOfItems = await Item.countDocuments({});
        return countOfItems.toString() + 'SD' +
            name.charAt(0) + tipo.charAt(0) + 
            Math.floor(Math.random() * 10).toString();
    } catch (error) {
        throw new Error(error);
    }

};

export const getAllItem = async (req, res) => {
    try {
        const result = await Item.find({});
        return res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});
    }
};

export const getAllItemsOfType = async (req, res) => {
    try {
        const result = await Item.find({tipo: req.params.tipo});
        return res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});
    }
};

export const getItem = async (req, res) => {
    let result = {};
    try {
        switch (req.params.tipo) {
            case 'cod':
                result = await Item.findOne({codigo: req.body.codigo});
                break;

            case 'name':
                result = await Item.find({name: req.body.name});
                break;

            case 'tipo':
                result = await Item.find({tipo: req.body.tipo});
                break;

            default:
                result = {message: 'Not A Type Of Search'};
                break;
        }
        // const result = await Item.find({});
        return res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});

    }
};

export const updateCantidad = async (req, res) => {
     
    try {
        let result = {};
        let cantidadOrg = 0;
        let cantidadNuev = 0;
        if (req.params.tipo === 'redu') {
            result = await Item.findOne({codigo: req.body.codigo});
            cantidadOrg = result.cantidad;
            if (cantidadOrg >= req.body.cantidadRedu) {
                cantidadNuev = cantidadOrg - req.body.cantidadRedu;
                result = await Item.findOneAndUpdate({codigo: req.body.codigo}, {cantidad: cantidadNuev}, {new: true, useFindAndModify: false});
            }
        } 
        else if (req.params.tipo === 'aume') {
            result = await Item.findOne({codigo: req.body.codigo});
            cantidadOrg = result.cantidad;
            if (cantidadOrg >= req.body.cantidadRedu) {
                cantidadNuev = cantidadOrg + req.body.cantidadRedu;
                result = await Item.findOneAndUpdate({codigo: req.body.codigo}, {cantidad: cantidadNuev}, {new: true, useFindAndModify: false});
            }
        }
        else {
            return res.json({message: 'Not An opc'});
        }
        return res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});

    }
};

export const updateItem = async (req, res) => {
    try {
        const result = await Item.findByIdAndUpdate({codigo: req.body.codigo}, req.body, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});

    }
};

export const deleteItem = async (req, res) => {
    try {
        const result = await Item.findByIdAndDelete({codigo: req.body.codigo});
        res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});

    }
};

export const addOffer = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({codigo: req.body.codigo}, {oferta: req.body.ofertaNum}, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});

    }
};

export const removeOffer = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({codigo: req.body.codigo}, {oferta: 0}, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});
    }
};

export const uploadPhotoName = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({codigo: req.body.codigo}, {photo: req.body.photo}, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        throw res.status(500).json({errorMSG: error});
    }
};

const getNoIGV_Price = (igvPrice) =>{
    var aprox_NO_IGV = igvPrice - (igvPrice*IGV);
    return Math.round(((aprox_NO_IGV) + Number.EPSILON) * 100) / 100;
};