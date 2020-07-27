import mongoose from 'mongoose';
import ventaModel from '../models/ventaModel';
import axios from 'axios';
import config from '../../config/index';

const tokenSunat = config.develoment.sunatToken;


const Venta = mongoose.model('Venta', ventaModel);


export const getVenta = async (req, res) => {
    try {
        const result = await Venta.findOne({ codigo: req.params.ventaCod });
        res.json(result);
    } catch (error) {
        return res.status(500).json({ errorMSG: error });
    }
};

 
export const getVentasActivas = async (req, res) => {
    try {
        const result = await Venta.find({estado: 'pendiente'});
        res.json(result);
    } catch (error) {
        return res.status(500).json({ errorMSG: error }); 
    }
};

export const getDNI = async (req, res) => {
    try {
        const result = await axios.post('https://api.migo.pe/api/v1/dni', { token: tokenSunat, dni: req.params.dni });
        res.json(result.data);
    }
    catch (error) {
        if (error.response.status === 422) {
            return res.status(422).json({ errorMSG: 'Numero Invalido' });
        } 
        else if (error.response.status === 404) {
            return res.status(404).json({ errorMSG: 'Documento No Encontrado' });
        }
        else{
            return res.status(500).json({ errorMSG: error });
        }
    }
};

export const getRUC = async (req, res) => {
    try {
        const result = await axios.post('https://api.migo.pe/api/v1/ruc', { token: tokenSunat, ruc: req.params.ruc });
        res.json(result.data);
    }
    catch (error) {
        if (error.response.status === 422) {
            return res.status(422).json({ errorMSG: 'Numero Invalido' });
        } 
        else if (error.response.status === 404) {
            return res.status(404).json({ errorMSG: 'Documento No Encontrado' });
        }
        else{
            return res.status(500).json({ errorMSG: error });
        }
    }
};

export const ventaSimple = async (req, res, next) => {
    try {
        const newVenta = new Venta(req.body.venta);
        newVenta.codigo = await generarCodigo();
        await newVenta.save();
        res.json({item: req.newItem, message: 'Succes'});
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const generarVentaNueva = async (req, res) => {
    try {
        const newVenta = new Venta(req.body.venta);
        newVenta.codigo = await generarCodigo();
        const saveResult = await newVenta.save();
        res.json(saveResult);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const generarVenta = async (req, res) => {
    try {
        const newVenta = new Venta(req.body);
        newVenta.codigo = await generarCodigo();
        const saveResult = await newVenta.save();
        res.json(saveResult);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

const generarCodigo = async (tipo) => {
    try {
        const count = await Venta.countDocuments({});
        let preCod = 'SD01-000000';
        switch (tipo) {
            case 'factura':
                preCod = 'E002-000000';
                break;
            case 'boleta':
                preCod = 'EB02-000000';
                break;
            default:
                break;
        }
        
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


