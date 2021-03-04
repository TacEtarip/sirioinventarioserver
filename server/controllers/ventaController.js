import mongoose from 'mongoose';
import ventaModel from '../models/ventaModel';
import axios from 'axios';
import config from '../../config/index';
import { createExcelReport } from '../lib/createExcelReport';

const tokenSunat = config[process.env.NODE_ENV].sunatToken;

const Venta = mongoose.model('Venta', ventaModel);

export const getVentaUser = async (req, res) => {
    try {
        const venta = await Venta.findOne({codigo: req.ventaCod});
        res.json(venta);
    } catch (error) {   
        return res.status(500).json({ errorMSG: error }); 
    }
};

export const eliminarItemScVenta = async (req, res) => {
    try {
        const preSearch = await Venta.findOne({codigo: req.body.codigo});
        const newTotalPrice = (Math.round(((preSearch.totalPrice - req.body.totalPriceSC) + Number.EPSILON) * 100) / 100);
        const newTotalPriceNoIGV = getNoIGV_Price(newTotalPrice);

        let itemNewTotalPrice = 0;
        let itemNewTotalPriceNoIGV = 0;

        for (const item of preSearch.itemsVendidos) {
            if (req.body.itemCodigo === item.codigo) {
                itemNewTotalPrice = (Math.round(((item.totalPrice - req.body.totalPriceSC) + Number.EPSILON) * 100) / 100);
                itemNewTotalPriceNoIGV = getNoIGV_Price(itemNewTotalPrice);
                break;
            }
        }

        const result = await Venta.findOneAndUpdate({ codigo: req.body.codigo, itemsVendidos: { $elemMatch: { codigo: req.body.itemCodigo } } }, 
                                {   $pull: { 'itemsVendidos.$.cantidadSC': { name: req.body.name, nameSecond: req.body.nameSecond } },
                                    $inc: { 
                                      'itemsVendidos.$.cantidad': -req.body.cantidadVenta
                                        },
                                    $set: { 
                                            'itemsVendidos.$.totalPrice': itemNewTotalPrice,
                                            'itemsVendidos.$.totalPriceNoIGV': itemNewTotalPriceNoIGV, 
                                            totalPrice: newTotalPrice, totalPriceNoIGV: newTotalPriceNoIGV
                                              }
                                     }, 
                                { new: true, useFindAndModify: false });
        
        res.json(result);

    } catch (error) {
        return res.status(500).json({ errorMSG: error }); 
    }
};


export const eliminarItemVenta = async (req, res) => {
    try {
        const preSearch = await Venta.findOne({codigo: req.body.codigo});
        const newTotalPrice = (Math.round(((preSearch.totalPrice - req.body.totalItemPrice) + Number.EPSILON) * 100) / 100);
        const newTotalPriceNoIGV = getNoIGV_Price(newTotalPrice);
        const result = await Venta.findOneAndUpdate({ codigo: req.body.codigo }, 
                                { $pull: { itemsVendidos: { codigo: req.body.itemCodigo } },
                                  $set: { totalPrice: newTotalPrice,  totalPriceNoIGV: newTotalPriceNoIGV } }, 
                                { new: true, useFindAndModify: false });

        
        res.json(result);

    } catch (error) {
        return res.status(500).json({ errorMSG: error }); 
    }
};

const getNoIGV_Price = (igvPrice) =>{
    var aprox_NO_IGV = igvPrice/1.18;
    return Math.round(((aprox_NO_IGV) + Number.EPSILON) * 100) / 100;
};

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

export const getVentasEjecutadas = async (req, res) => {   
    
    try {
        let result;
        const searchRegex = new RegExp(req.body.busqueda || '', 'gi');
        if (req.body.dateOne === 'noone' || req.body.dateTwo === 'noone') {
            result = await Venta.find({estado: { $in: req.body.estado }, $or: [{'documento.name': { $regex: searchRegex }}, 
            {'documento.codigo': Number(req.body.busqueda) || -1 }], 'documento.type': { $in: req.body.tipo } })
                        .skip(parseInt(req.body.skip)).limit(parseInt(req.body.limit));
        } 
        else {
            result = await Venta.find({estado: { $in: req.body.estado }, $or: [{'documento.name': { $regex: searchRegex }}, 
            {'documento.codigo':  Number(req.body.busqueda) || -1 }], 'documento.type': { $in: req.body.tipo },
                        date: {$gte: new Date(req.body.dateOne), $lt: new Date(req.body.dateTwo)}})
                        .skip(parseInt(req.body.skip)).limit(parseInt(req.body.limit));
        }
        res.json(result);
    } catch (error) {
        return res.status(500).json({ errorMSG: error }); 
    }
};

export const getCantidadDeVentasPorEstado = async (req, res) => {
    try {
        let result;
        const searchRegex = new RegExp(req.body.busqueda || '', 'gi');
        if (req.body.dateOne === 'noone' || req.body.dateTwo === 'noone') {
            result = await Venta.aggregate([{$match: { estado: { $in: req.body.estado }, $or: [{'documento.name': { $regex: searchRegex }}, 
                                            {'documento.codigo':  Number(req.body.busqueda) || -1 }], 'documento.type': { $in: req.body.tipo } }}, 
                                            {$count: 'cantidadVentas'}]);
        } 
        else {
            result = await Venta.aggregate([{$match: {estado: { $in: req.body.estado }, $or: [{'documento.name': { $regex: searchRegex }}, 
            {                               'documento.codigo':  Number(req.body.busqueda) || -1 }], 'documento.type': { $in: req.body.tipo },
                                            date: {$gte: new Date(req.body.dateOne), $lt: new Date(req.body.dateTwo)}}}, 
                                            {$count: 'cantidadVentas'}]);
        }

        res.json(result[0]);
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
        const result = await newVenta.save();
        res.json({item: req.newItem, message: 'Succes'});
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const createExcel = async (req, res) => {
    try {
        const ventas = await Venta.find({estado: 'ejecutada', 
        date: {$gte: new Date(req.params.dateOne), $lt: new Date(req.params.dateTwo)}});
        
        const buffer = await createExcelReport('Ventas', 'Reporte De Ventas', ['Fecha', 'Codigo', 'Para', 'Precio No IGV', 'Precio'], ventas);
        res.writeHead(200, 
            { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=reporte.xlsx' });
        res.write(buffer, 'binary');
        res.end(null, 'binary');
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


