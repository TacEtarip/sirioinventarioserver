import mongoose from 'mongoose';
import ventaModel from '../models/ventaModel';

const Venta = mongoose.model('Venta', ventaModel);

export const generarVenta = async (req, res) => {
    try {
        const newVenta = new Venta(req.body);
        newVenta.codigo = await generarCodigo();
        const saveResult = await newVenta.save();
        res.json(saveResult);
    } catch (error) {
        console.log(error);
        return res.status(500).json({errorMSG: error});
    }
};

const generarCodigo = async () => {
    try {
        const count = await Venta.countDocuments({});
        let preCod = 'SD-000000';
        for (let index = 0; index < count.toString().length; index++) {
            preCod = preCod.slice(0, -1);
        }
        const codigo = preCod + count.toString();
        return codigo;
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const ejecutarVenta = async (req, res) => {
    try {
        const result = await Venta.findOneAndUpdate({codigo: req.body.codigo}, {estado: 'ejecutada'}, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};


export const anularVenta = async (req, res) => {
    try {
        const result = await Venta.findOneAndUpdate({codigo: req.body.codigo}, {estado: 'anulada'}, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const obtenerTodasLasVentas = async (req, res) => {
    try {
        const result = await Venta.find({});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};


