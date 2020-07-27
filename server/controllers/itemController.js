import mongoose from 'mongoose';
import itemSchema from '../models/itemModel';
import marcaSchema from '../models/marcaModel';
import ventaModel from '../models/ventaModel';
import { uploadPDFventa } from './uploadsController';
import config   from '../../config/index';

const Item = mongoose.model('Item', itemSchema);
const Marca = mongoose.model('Marca', marcaSchema);
const Venta = mongoose.model('Venta', ventaModel);

const IGV = 0.18;


export const testFind = async (req, res) => {
    try {
                    /*
            for (const subConteo of subConteosToUpdate) {
                lastResort.subConteo.order
                /*
                let cantidadNuevaSUB = subConteo.cantidadDisponible - subConteo.cantidadVenta;
                bulk.find({codigo: req.body.venta.itemsVendidos[0].codigo, 'subConteo.order': {$elemMatch: {name: subConteo.name, nameSecond: subConteo.nameSecond}}})
                        .updateOne({$set: { $inc: {'subConteo.order.$.cantidad': -subConteo.cantidadVenta}}});
               /* await Item.findOneAndUpdate({codigo: req.body.venta.itemsVendidos[0].codigo, 
                    'subConteo.order': {$elemMatch: {name: subConteo.name, nameSecond: subConteo.nameSecond}}}, 
                    {$set: {'subConteo.order.$.cantidad': cantidadNuevaSUB}}, {useFindAndModify: false, new: true});
            }
            const resultII = await bulk.execute();*/
        /*
        const result = await Item.findOneAndUpdate({codigo: '0SDTT2', 'subConteo.order': {$elemMatch: {name: 'L', nameSecond: 'Rojo'}}}, {$set: {'subConteo.order.$.cantidad': 134}}, {new: true, useFindAndModify: true});
        console.log(result.subConteo);*/
        const result = await Item.find({codigo: {$in: ['0SDTT2', '2SDeT3']}});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getVentasActivasParaCard = async (req, res) => {
    try {
        const result = 
                        await Venta.aggregate([
                            {$match: {codigo: req.body.codVenta}}, 
                            {$unwind: '$itemsVendidos'}, 
                            {$replaceRoot: { newRoot: "$itemsVendidos" }},
                            {$unwind: { path: '$cantidadSC', preserveNullAndEmptyArrays: true }}
                        ]);
        res.json(result);
    } catch (error) {
        return res.status(500).json({message: error});
    }
};

export const agregarItemVenta = async (req, res) => {
    try {
        
        const preInfo = await Venta.aggregate([{$match: { codigo: req.body.codigoVenta }}, {$unwind: '$itemsVendidos'}, 
                        {$replaceRoot: { newRoot: "$itemsVendidos" }}, {$match: {codigo: req.body.itemVendido.codigo}}, {$count: 'thisItem'}]);
        
        if (preInfo.length !== 0) {
            // const oldSale = await Venta.findOne({codigo: req.body.codigoVenta, itemsVendidos: {$elemMatch: {codigo: req.body.itemVendido.codigo}}});
            const oldSale = await Venta.aggregate([
                                  { $match: { codigo: req.body.codigoVenta } },
                                  { $unwind: '$itemsVendidos' },
                                  { $replaceRoot: { newRoot: "$itemsVendidos" } },
                                  { $match: { codigo: req.body.itemVendido.codigo }}
                                  ]);

            const newConst = (Math.round(((oldSale[0].totalPrice - req.body.itemVendido.totalPrice) + Number.EPSILON) * 100) / 100) * -1;

            const newConstNOIGV = (Math.round(((oldSale[0].totalPriceNoIGV - req.body.itemVendido.totalPriceNoIGV) + Number.EPSILON) * 100) / 100) * -1; 

            await Venta.findOneAndUpdate(
                {codigo: req.body.codigoVenta, itemsVendidos: {$elemMatch: {codigo: req.body.itemVendido.codigo}}}, 
                {$set: { 'itemsVendidos.$': req.body.itemVendido }, $inc: { totalPrice: newConst, totalPriceNoIGV: newConstNOIGV }}, 
                {useFindAndModify: false});
            return res.json({message: 'Cantidades actualizadas'});
        }
        await Venta.findOneAndUpdate({codigo: req.body.codigoVenta},
                                     {$push: { itemsVendidos: req.body.itemVendido }, 
                                      $inc: { totalPrice: req.body.itemVendido.totalPrice, totalPriceNoIGV:  req.body.itemVendido.totalPriceNoIGV} }, 
                                     {useFindAndModify: false});
        res.json({message: 'Item agregado correctamente'});

    } catch (error) {
        return res.status(500).json({message: error});
    }
};

export const generarVentaNueva = async (req, res) => {
    try {
        const result = await Venta.aggregate([
        {
            $match: {
                estado: 'pendiente'
            },
        },

        {
            $count: 'ventasActivas'
        }
        ]);


        if (result[0]) {
            return res.status(202).json({message: 'Ya tienes una venta pendiente'});
        }
        
        const newVenta = new Venta(req.body.venta);
        newVenta.codigo = await generarCodigoVent(newVenta.documento.type);
        const saveResult = await newVenta.save();
        res.json({message: `Venta generada con el codigo: ${saveResult.codigo}`, venta: newVenta});

    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const ventaEjecutar = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const variaciones = [];
        const itemsVendidosCod = [];

        for (const item of req.body.venta.itemsVendidos) {
            itemsVendidosCod.push(item.codigo);
            variaciones.push({
                              date: Date.now(), cantidad: item.candidad, 
                              tipo: true, comentario: 'venta', 
                              costoVar: req.body.venta.totalPrice
                            });
        }

        let index = 0;

        for (const item of req.body.venta.itemsVendidos) {
            for (const csc of item.cantidadSC) {
                if (csc.cantidadVenta > 0) {
                    let resultTemp = await Item.findOneAndUpdate({codigo: item.codigo, 
                        'subConteo.order': {$elemMatch: {name: csc.name, nameSecond: csc.nameSecond}}}, 
                        {$inc: {'subConteo.order.$.cantidad': -csc.cantidadVenta}}, {useFindAndModify: false, new: true, session});
                    for (let index = 0; index < resultTemp.subConteo.order.length; index++) {
                        if (resultTemp.subConteo.order[index].cantidad < 0) {
                                await session.abortTransaction();
                                session.endSession();
                                return res.status(202).json({message: 'La Cantidad Ha Cambiado'});
                            }
                        }
                }
            }
            let result = await Item.findOneAndUpdate(
                {codigo: item.codigo}, 
                {   
                    $inc:  {cantidad: -item.cantidad},
                    $push: {variaciones: variaciones[index]},

                }, {new: true, useFindAndModify: false, session: session});
            
            if (result.cantidad < 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(202).json({message: 'La Cantidad Ha Cambiado'});
            }

            index++;
        }

        const venta = await Venta.findOneAndUpdate({codigo: req.body.venta.codigo}, {estado: 'ejecutada'},{useFindAndModify: false, new: true, session});



        await session.commitTransaction();
        session.endSession();
        
        await uploadPDFventa(venta);


        res.json({message: `succes||${venta.codigo}`});

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({errorMSG: error});
    }
};

export const ventaAnular = async (req, res) => {
    try {
        await Venta.findOneAndUpdate({codigo: req.body.venta.codigo}, {estado: 'anulada'}, {useFindAndModify: true});
        res.json({message: 'succes'});
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const ventaSimpleItemUpdate = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    // session.withTransaction
    try {
        
        const lastResort = await Item.findOne({codigo: req.body.venta.itemsVendidos[0].codigo});

        // req.body.venta.itemsVendidos[0].priceIGV = lastResort.priceIGV;
        // req.body.venta.itemsVendidos[0].priceNoIGV = lastResort.priceNoIGV; poder esto para la venta/compra de clientes


        const variacion = { date: Date.now(), cantidad: req.body.venta.itemsVendidos[0].cantidad, 
            tipo: true, comentario: 'venta', 
            costoVar: req.body.venta.totalPrice };
        if (req.body.venta.itemsVendidos[0].cantidadSC.length !== 0) {
            for (const csc of req.body.venta.itemsVendidos[0].cantidadSC) {
                if (csc.cantidadVenta > 0) {
                    let resultTemp = await Item.findOneAndUpdate({codigo: req.body.venta.itemsVendidos[0].codigo, 
                        'subConteo.order': {$elemMatch: {name: csc.name, nameSecond: csc.nameSecond}}}, 
                        {$inc: {'subConteo.order.$.cantidad': -csc.cantidadVenta}}, {useFindAndModify: false, new: true, session});
                    for (let index = 0; index < resultTemp.subConteo.order.length; index++) {
                        if (resultTemp.subConteo.order[index].cantidad < 0) {
                            await session.abortTransaction();
                            session.endSession();
                            return res.status(202).json({message: 'La Cantidad Ha Cambiado', item: lastResort});
                        }
                    }
                }
            }
            /*
            subConteosToUpdate = req.body.info.subConteosToUpdate;
            lastResort.subConteo.order.forEach( ord => {
                subConteosToUpdate.forEach(sc => {
                    if ((ord.name === sc.name) && (ord.nameSecond === sc.nameSecond)) {
                        ord.cantidad = sc.cantidadDisponible - sc.cantidadVenta;
                    }
                });
            }); */

        }
        
        const result = await Item.findOneAndUpdate(
                {codigo: req.body.venta.itemsVendidos[0].codigo}, 
                {   
                    $inc:  {cantidad: -req.body.venta.itemsVendidos[0].cantidad},
                    $push: {variaciones: variacion},

                }, {new: true, useFindAndModify: false, session: session});
        
        if (result.cantidad < 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(202).json({message: 'La Cantidad Ha Cambiado', item: lastResort});
        }
        req.newItem = result;

        const newVenta = new Venta(req.body.venta);
        newVenta.codigo = await generarCodigoVent(newVenta.documento.type);
        await newVenta.save({session});


        await session.commitTransaction();
        session.endSession();

        await uploadPDFventa(newVenta);
        
        res.json({item: req.newItem, message: `Succes||${newVenta.codigo}`});

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({errorMSG: error});
    }
};
const generarCodigoVent = async (tipo) => {
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


export const cantidadUpdate = async (req, res) => {
    try {
        let cantidad;
        let tipo;
        if (req.body.cantidadNueva >= req.body.cantidadAntigua) {
            cantidad = req.body.cantidadNueva - req.body.cantidadAntigua;
            tipo = true;
        } else {
            cantidad = req.body.cantidadAntigua - req.body.cantidadNueva;
            tipo = false;
        }
        const variacion = { date: Date.now(), cantidad: cantidad, 
                            tipo: tipo, comentario: req.body.comentario, 
                            costoVar: req.body.costoVar };

        const result = await Item.findOneAndUpdate(
                                        {codigo: req.body.codigo}, 
                                        {
                                            cantidad: req.body.cantidadNueva,
                                            $push: {variaciones: variacion}
                                        }, {new: true, useFindAndModify: false});

        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const subCantidadUpdate = async (req, res) => {
    try {
        let cantidad;
        let tipo;
        if (req.body.cantidadNueva >= req.body.cantidadAntigua) {
            cantidad = req.body.cantidadNueva - req.body.cantidadAntigua;
            tipo = true;
        } else {
            cantidad = req.body.cantidadAntigua - req.body.cantidadNueva;
            tipo = false;
        }
        const variacion = { date: Date.now(), cantidad: cantidad, 
                            tipo: tipo, comentario: req.body.comentario, 
                            costoVar: req.body.costoVar };

        const result = 
                    await Item.findOneAndUpdate(
                                {codigo: req.body.codigo}, 
                                {
                                    subConteo: req.body.subConteo, 
                                    cantidad: req.body.cantidadNueva,
                                    $push: {variaciones: variacion}
                                }, {new: true, useFindAndModify: false});

        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};


export const addMarca = async (req, res) => {
    try {
        let newMarca = new Marca(req.body);
        newMarca.codigo = Date.now().toString();
        const result = await newMarca.save();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getCantidadTotal = async (req, res) =>{
    try {
        const result = await Item.aggregate([ {$match: {codigo: '4SDtT4'}}, {$project: {cantidadTotal: {$sum: '$subConteo.order.cantidad'}}}]);
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const deleteMarcas = async (req, res) => {
    try {
        const deleteArray = req.params.deleteString.split('_');
        await Marca.deleteMany({name: {$in: deleteArray} });
        res.json({message: 'succes'});
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getMarcas = async (req, res) => {
    try {
        const result = await Marca.find({});
        res.json(result);
    } catch (error) {
        
    }
};

export const addNewItem = async (req, res) => {
    try {

        let newItem = new Item(req.body);
        newItem.priceNoIGV = getNoIGV_Price(newItem.priceIGV);
        newItem.codigo = await generateCode(newItem.name, newItem.tipo);
        newItem.nameLowerCase = newItem.name;
        const variacion = { date: Date.now(), cantidad: newItem.cantidad, 
            tipo: true, comentario: 'new item', 
            costoVar: newItem.costoPropio };
        newItem.variaciones = [variacion];
        const result = await newItem.save();
        return res.json(result);
    } catch (error) {
    }
};

const generateCode = async (name = '', tipo = '') => {
    try {
        const countOfItems = await Item.countDocuments({});
        return countOfItems.toString() + 'SD' +
            name.charAt(0) + tipo.charAt(0) + 
            Math.floor(Math.random() * 10).toString();
    } catch (error) {
        return new Error(error);
    }

};

export const getAllItem = async (req, res) => {
    try {
        const result = await Item.find({});
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getAllItemSort = async (req, res) => {
    try {
        let tipoOrder = 0;
        if (req.params.tipoSort === 'asc') {
            tipoOrder = 1;
        } else if (req.params.tipoSort === 'dsc') {
            tipoOrder = -1;
        }
        const filtroSelect = req.params.subORtipo;
        const tipoBusqueda = req.params.tipoBusqueda;
        const filtroValue = req.params.filtro;
        let filtro = {};
        if (req.params.filtro !== 'all') {
            if (filtroSelect === 'sub') {
                filtro = {subTipo: filtroValue};
            } else if(filtroSelect === 'tipo') {
                filtro = {tipo: filtroValue};
            }
        }
        let result;
        switch (tipoBusqueda) {
            case 'date':
                result = await Item.find(filtro).collation({locale:'en', strength: 2}).sort({date: tipoOrder*-1});
                break;
            case 'name':
                result = await Item.find(filtro).collation({locale:'en', strength: 2}).sort({name: tipoOrder});
                break;
            case 'priceIGV':
                result = await Item.find(filtro).collation({locale:'en', strength: 2}).sort({priceIGV: tipoOrder});
                break;                         
            default:
                break;
        }

        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getAllItemsOfType = async (req, res) => {
    try {
        const result = await Item.find({tipo: req.params.tipo});
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getAllItemsSubTipoName = async (req, res) => {
    try {
        const result = await Item.find({subTipo: req.params.subTipo}).select('name -_id');
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getItem = async (req, res) => {
    let result = {};
    try {
        switch (req.params.tipo) {
            case 'cod':
                result = await Item.findOne({codigo: req.params.codigo});
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
        return res.status(500).json({errorMSG: error});

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
            if (cantidadOrg >= req.body.cantidad) {
                cantidadNuev = cantidadOrg - req.body.cantidad;
                result = await Item.findOneAndUpdate({codigo: req.body.codigo}, {cantidad: cantidadNuev}, {new: true, useFindAndModify: false});
            } else {
                return res.status(409).json({message: 'No Hay Los Suficientes Items En Stock'});
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
        return res.status(500).json({errorMSG: error});

    }
};

export const updateItem = async (req, res) => {
    try {
        const newItem = req.body;
        if (newItem.priceIGV) {
            newItem.priceNoIGV = getNoIGV_Price(newItem.priceIGV);
        }
        const result = await Item.findOneAndUpdate({codigo: req.body.codigo}, newItem, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const updateItemsSubTipo = async (req, res) => {
    try {
        const result = await Item.updateMany({subTipo: req.body.antiguoSubName}, { subTipo: req.body.newSubName}, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const updateItemsTipo = async (req, res) => {
    try {
        const result = await Item.updateMany({tipo: req.beforeName}, { tipo: req.body.name}, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const deleteItem = async (req, res, next) => {
    try {
        const result = await Item.findOneAndDelete({codigo: req.params.codigo});
        req.photNameToDelete = result.photo;
        next();
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const deleteItemsTipo = async (req, res) => {
    try {
        const result = await Item.deleteMany({tipo: req.tipoName});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const deleteItemsSubTipo = async (req, res) => {
    try {
        const result = await Item.deleteMany({subTipo: req.params.subTipoName});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const addOffer = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({codigo: req.body.codigo}, {oferta: req.body.ofertaNum}, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const removeOffer = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({codigo: req.body.codigo}, {oferta: 0}, {new: true, useFindAndModify: false});
        res.status(200).json({res: result, uploadInfo: req.uploadInfo});
    } catch (error) {
        throw res.status(500).json({errorMSG: error});
    }
};

export const uploadPhotoName = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({codigo: req.params.codigo}, {photo: req.fileName}, {new: true, useFindAndModify: false});
        res.status(200).json({res: result, uploadInfo: req.uploadInfo});
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

const getNoIGV_Price = (igvPrice) =>{
    var aprox_NO_IGV = igvPrice/1.18;
    return Math.round(((aprox_NO_IGV) + Number.EPSILON) * 100) / 100;
};

export const changeFileStatus = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({codigo: req.params.codigo}, {ficha: true}, {new: true, useFindAndModify: false});
        res.status(200).json({res: result, uploadInfo: req.uploadInfo});
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};