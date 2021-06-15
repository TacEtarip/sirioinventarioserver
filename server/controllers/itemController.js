import mongoose from 'mongoose';
import itemSchema from '../models/itemModel';
import marcaSchema from '../models/marcaModel';
import tagsSchema from '../models/tagsModel';
import ventaModel from '../models/ventaModel';
import { UserSchema } from '../models/userModel';
import { uploadPDFventa } from './uploadsController';
import { createExcelItemReport } from '../lib/createExcelItemReport';
import { anularComprobanteSunat } from '../controllers/nubeFactController';


const Item = mongoose.model('Item', itemSchema);
const Marca = mongoose.model('Marca', marcaSchema);
const Venta = mongoose.model('Venta', ventaModel);
const User = mongoose.model('User', UserSchema);
const Tag = mongoose.model('Tag', tagsSchema);

export const filterItemsByRegex = async (req, res) => {
    try {
        const testRegex = new RegExp( req.body.value + '+[a-z0-9._ ]*$', 'ig');
        const result = await Item.find({ name: { $regex: testRegex }, deleted: false }).limit(req.body.limit);
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const filterTagsByRegex = async (req, res) => {
    try {
        const testRegex = new RegExp( req.body.value + '+[a-z0-9._ ]*$', 'ig');
        const result = await Tag.find({ name: { $regex: testRegex }, deleted: false }).limit(req.body.limit);
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getItemsDestacados = async (req, res) => {
    try {
        const result = await Item.find({ oferta: { $gt: 0 }, deleted: false });
        res.json(result);
    } catch (error) {
        return res.status(500).json({message: error});
    }
};

export const getRandomImageOfTipo = async (req, res) => {
    try {
        const result = await Item.aggregate([
            { $match: { tipo: req.params.tipo, deleted: false, subTipo: req.params.subTipo }},
            { $sample: { size: 4 } },
            { $project: { photo: 1 } }
        ]);


        if (result.length === 0) {
            return res.json({ photo: 'noPhoto.x' });
        }
        res.json({ photos: result });
    } catch (error) {
        return res.status(500).json({message: error});
    }
};


export const getSimilarItems = async (req, res) => {
    try {
        const result = await Item.find( { tipo: req.params.tipo, codigo: {$ne: req.params.codigo}, deleted: false } ).limit(8);
        res.json(result);
    } catch (error) {
        return res.status(500).json({message: error});
    }
};

export const searchText = async (req, res) => {
    try {
        const testRegex = new RegExp( req.params.searchTerms + '+[a-z0-9._ ]*$', 'ig');
        const result = await Item.find({ name: { $regex: testRegex }, deleted: false }).limit(8);
        res.json(result);
    } catch (error) {
        return res.status(500).json({message: error});
    }
};

export const searchItem = async (req, res) => {
    try {
        const testRegex = new RegExp( req.params.searchTerms + '+[a-z0-9._ ]*$', 'ig');
        const result = await Item.find({ name: { $regex: testRegex }, deleted: false }).limit(6);
        res.json(result);
    } catch (error) {
        return res.status(500).json({message: error});
    }
};

export const getItemBalance = async (req, res) => {
    try {
        const item = await Item.findOne({ codigo: req.params.codigo });
        const balance = calcularBalance(item.variaciones);
        res.json({ message: balance });
    } catch (error) {
        return res.status(500).json({message: error});
    }
};

const calcularBalance = (variaciones) => {
    try {
        let ganancia = 0;
        let gasto = 0;
        for (const vari of variaciones) {
            if (vari.tipo === true) {
                gasto = gasto + vari.costoVar;
            } 
            else {
                ganancia = ganancia + vari.costoVar;
            }
        }

        return (Math.round(((ganancia - gasto) + Number.EPSILON) * 100) / 100);
        
    } catch (error) {
        throw new Error(error);
    }

};


export const getItemReport = async (req, res) => {
    try {
        const item = await Item.findOne({ codigo: req.params.codigo });
        const buffer = await createExcelItemReport(item);
        res.writeHead(200, 
            { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=reporteItem-${item.codigo}.xlsx` });
        res.write(buffer, 'binary');
        res.end(null, 'binary');
    } catch (error) {
        return res.status(500).json({message: error});
    }
};

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

        req.body.itemVendido.ventaCod = req.body.codigoVenta;

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

            const ventaAct = await Venta.findOneAndUpdate(
                {codigo: req.body.codigoVenta, itemsVendidos: {$elemMatch: {codigo: req.body.itemVendido.codigo}}}, 
                {$set: { 'itemsVendidos.$': req.body.itemVendido }, $inc: { totalPrice: newConst, totalPriceNoIGV: newConstNOIGV }}, 
                {useFindAndModify: false, new: true });
            return res.json({message: 'Cantidades actualizadas', venta: ventaAct});
        }
        const ventaActT = await Venta.findOneAndUpdate({codigo: req.body.codigoVenta},
                                     {$push: { itemsVendidos: req.body.itemVendido }, 
                                      $inc: { totalPrice: req.body.itemVendido.totalPrice, totalPriceNoIGV:  req.body.itemVendido.totalPriceNoIGV} }, 
                                     {useFindAndModify: false, new: true});
        res.json({message: 'Item agregado correctamente', venta: ventaActT });

    } catch (error) {
        return res.status(500).json({message: error});
    }
};

export const generarVentaNueva = async (req, res, next) => {
    try {
        const newVenta = new Venta(req.body.venta);
        newVenta.codigo = await generarCodigoVent(newVenta.documento.type);
        newVenta.itemsVendidos[0].ventaCod = newVenta.codigo;
        newVenta.vendedor = req.user.aud.split(' ')[0];
        req.saveResult = await newVenta.save();
        next();
       // res.json({message: `Venta generada con el codigo: ${saveResult.codigo}`, venta: newVenta});

    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const ventaAnularPost = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const variaciones = [];
        const itemsVendidosCod = [];

        for (const item of req.body.itemsVendidos) {
            itemsVendidosCod.push(item.codigo);
            variaciones.push({
                              date: Date.now(), cantidad: item.cantidad, 
                              tipo: true, comentario: 'anular|' + req.body.codigo, 
                              costoVar: item.totalPrice,
                              cantidadSC: item.cantidadSC,
                            });
        }

        let index = 0;

        for (const item of req.body.itemsVendidos) {
            for (const csc of item.cantidadSC) {
                if (csc.cantidadVenta > 0) {
                    await Item.findOneAndUpdate({codigo: item.codigo, 
                        'subConteo.order': {$elemMatch: {name: csc.name, nameSecond: csc.nameSecond}}}, 
                        {$inc: {'subConteo.order.$.cantidad': csc.cantidadVenta}}, {useFindAndModify: false, new: true, session});

                }
            }
            await Item.findOneAndUpdate(
                {codigo: item.codigo}, 
                {   
                    $inc:  {cantidad: item.cantidad},
                    $push: {variaciones: variaciones[index]},

                }, {new: true, useFindAndModify: false, session: session});

            index++;
        }

        let documentoAnulado = '';

        if (req.body.documento.type !== 'noone') {
            if (req.body.documento.type === 'factura') {
                documentoAnulado = await anularComprobanteSunat(1, req.body.serie, req.body.numero, 'Anulación de venta');
            }
            if (req.body.documento.type === 'boleta') {
                documentoAnulado = await anularComprobanteSunat(2, req.body.serie, req.body.numero, 'Anulación de venta');
            }
        }
        const venta = 
        await Venta.findOneAndUpdate({codigo: req.body.codigo}, 
            {estado: 'anuladaPost', linkComprobante: documentoAnulado}, 
            { useFindAndModify: false, new: true, session });

        await session.commitTransaction();
        session.endSession();
        
        res.json({message: `succes||${venta.codigo}`});

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({errorMSG: error});
    }
};

export const ventaSimpleItemUpdate = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        const codigoVenta = await generarCodigoVent(req.body.venta.documento.type);

        req.body.venta.itemsVendidos[0].ventaCod = codigoVenta;

        const lastResort = await Item.findOne({codigo: req.body.venta.itemsVendidos[0].codigo});

        const variacion = { date: Date.now(), cantidad: req.body.venta.itemsVendidos[0].cantidad, 
            tipo: false, comentario: 'venta|' + codigoVenta, 
            costoVar: req.body.venta.totalPrice, cantidadSC: req.body.venta.itemsVendidos[0].cantidadSC };
        
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

        const newVenta = new Venta(req.body.venta);
        newVenta.codigo = codigoVenta;
        newVenta.vendedor = req.user.aud.split(' ')[0];
        req.ventResult = await newVenta.save({session});

        if (newVenta.documento.type === 'factura') {
            req.count = await Venta.countDocuments({ tipoComprobante: { $eq: 1 } });
        } else if (newVenta.documento.type === 'boleta') {
            req.count = await Venta.countDocuments({ tipoComprobante: { $eq: 2 } });
        }

        if (req.body.venta.guia) {
           req.countGuia =  await Venta.countDocuments({ guia: { $eq: true } });
        }
        
        await uploadPDFventa(newVenta);
        await session.commitTransaction();
        session.endSession();

        next();

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({errorMSG: error});
    }
};

export const ventaEjecutar = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const variaciones = [];
        const itemsVendidosCod = [];


        for (const item of req.body.venta.itemsVendidos) {
            if (item.codigo.charAt(2) !== 'N' && item.codigo.charAt(3) !== 'I') {
                itemsVendidosCod.push(item.codigo);
                variaciones.push({
                                  date: Date.now(), cantidad: item.cantidad, 
                                  tipo: false, comentario: 'venta|' + req.body.venta.codigo, 
                                  costoVar: item.totalPrice,
                                  cantidadSC: item.cantidadSC,
                                });
            }

        }

        let index = 0;

        for (const item of req.body.venta.itemsVendidos) {
            if (item.codigo.charAt(2) !== 'N' && item.codigo.charAt(3) !== 'I') {
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
        }

        const venta = await Venta.findOneAndUpdate({codigo: req.body.venta.codigo}, 
            req.body.venta,
            {useFindAndModify: false, new: true, session});

        req.ventResult = venta;

        if (venta.documento.type === 'factura') {
            req.count = await Venta.countDocuments({ tipoComprobante: { $eq: 1 } });
        } else if (venta.documento.type === 'boleta') {
            req.count = await Venta.countDocuments({ tipoComprobante: { $eq: 2 } });
        }

        if (req.body.venta.guia) {
            req.countGuia =  await Venta.countDocuments({ guia: { $eq: true} });
        }

        await User.findOneAndUpdate({ username: req.user.aud.split(' ')[0] }, 
        { $pull: { ventaActiva: req.body.venta.codigo } }, {useFindAndModify: false});

        await uploadPDFventa(venta);
        await session.commitTransaction();
        session.endSession();
        
        next();

        // res.json({message: `succes||${venta.codigo}`});

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({errorMSG: error});
    }
};

export const ventaAnular = async (req, res) => {
    try {
        await Venta.findOneAndUpdate({codigo: req.body.venta.codigo}, {estado: 'anulada'}, { useFindAndModify: false });
        await User.findOneAndUpdate({ username: req.user.aud.split(' ')[0] }, { $pull: { ventaActiva: req.body.venta.codigo } } ,{ useFindAndModify: false });
        res.json({message: 'succes'});
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};



export const addLinkToPDF = async (req, res) => {
    try {
        if (!req.sunat_guia) {
            req.sunat_guia = '';
        }
        const result = 
        await Venta.findByIdAndUpdate(req.ventResult._id, 
            {   linkComprobante: req.sunat.enlace_del_pdf, numero: req.sunat.numero, guia_link: req.sunat_guia.enlace_del_pdf,
                serie: req.sunat.serie, tipoComprobante: req.sunat.tipo_de_comprobante }, 
            { new: true, useFindAndModify: false });
        res.json({ item: result, message: `Succes||${req.ventResult.codigo}`, _sunat: req.sunat });
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

const generarCodigoVent = async (tipo) => {
    try {
        const count = await Venta.countDocuments({}) + 1;
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
        const itemOriginal = await Item.findOne({codigo: req.body.codigo});

        if (!req.body.tipo) {
            const testResult = itemOriginal.cantidad - req.body.cantidad;
            if (testResult < 0) {
                throw('Cantidad Invalidad');
            }
        }

        const cantidad = req.body.cantidad;

        const variacion = { date: Date.now(), cantidad: cantidad, 
                            tipo: req.body.tipo, 
                            comentario: req.body.tipo ? 'agregar|' + req.body.comentario : 'quitar|' + req.body.comentario, 
                            costoVar: req.body.costoVar * cantidad, cantidadSC: [] };
        const result = await Item.findOneAndUpdate(
                                        {codigo: req.body.codigo}, 
                                        {
                                            $inc: { cantidad: req.body.tipo ? req.body.cantidad: req.body.cantidad * -1 },
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
        const itemOriginal = await Item.findOne({codigo: req.body.codigo});

        cantidad = req.body.cantidad;

        const variacion = { date: Date.now(), cantidad: cantidad, 
                            tipo: req.body.tipo, 
                            comentario: req.body.tipo ? 'agregar|' + req.body.comentario : 'quitar|' + req.body.comentario, 
                            costoVar: req.body.costoVar * cantidad, cantidadSC: [] };
        const temporalItemArray = [];
        
        for (const sc of itemOriginal.subConteo.order) {
            const indexToMDF = 
            req.body.subConteo.order.findIndex(v => v.name === sc.name && v.nameSecond === sc.nameSecond);
            if (indexToMDF !== -1) {
                temporalItemArray.push(sc);
            }
        }

        itemOriginal.subConteo.order = temporalItemArray;

        for (const sc of req.body.subConteo.order) {
            const indexToMDF = itemOriginal.subConteo.order.findIndex(v => v.name === sc.name && v.nameSecond === sc.nameSecond);
            const cantidadOrg = indexToMDF > -1 ? itemOriginal.subConteo.order[indexToMDF].cantidad : 0;
            if (indexToMDF > -1) {
                if (req.body.tipo) {
                    itemOriginal.subConteo.order[indexToMDF].cantidad += sc.cantidad;
                } else {
                    itemOriginal.subConteo.order[indexToMDF].cantidad -= sc.cantidad;
                    if (itemOriginal.subConteo.order[indexToMDF].cantidad < 0) {
                        throw('Cantidad Invalidad');
                    }
                }
            } else {
                itemOriginal.subConteo.order.push({ cantidad: sc.cantidad, name: sc.name, nameSecond: sc.nameSecond || undefined });
            }
            variacion.cantidadSC.push({ name: sc.name, nameSecond: sc.nameSecond, 
                cantidadDisponible: cantidadOrg, cantidadVenta: sc.cantidad });
        }

        if (!req.body.tipo) {
            const testResult = itemOriginal.cantidad - req.body.cantidad;
            if (testResult < 0) {
                throw('Cantidad Invalidad');
            }
        }


        const result = 
                    await Item.findOneAndUpdate(
                                { codigo: req.body.codigo }, 
                                {
                                    subConteo: itemOriginal.subConteo, 
                                    $inc: { cantidad: req.body.tipo ? req.body.cantidad: req.body.cantidad * -1 },
                                    $push: {variaciones: variacion}
                                }, {new: true, useFindAndModify: false});

        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const addTag = async (req, res) => {
    try {
        const newMarca = new Tag(req.body);
        const result = await newMarca.save();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const deleteTag = async (req, res) => {
    try {
        const result = await Tag.updateMany({ name: { $in: req.body } }, {deleted: true});
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getTags = async (req, res) => {
    try {
        const result = await Tag.find({ deleted: false });
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const actTagsItem = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({codigo: req.body.codigo}, {$set: {tags: req.body.tagsList}});
        return (result);
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
        costoVar:   (Math.round(((newItem.costoPropio * newItem.cantidad) + Number.EPSILON) * 100) / 100), cantidadSC: [] };
        if (newItem.subConteo) {
            for (const sc of newItem.subConteo.order) {
                variacion.cantidadSC.push({name: sc.name, nameSecond: sc.nameSecond, cantidadDisponible: sc.cantidad, cantidadVenta: 0});
            }
        }
        newItem.variaciones = [variacion];
        const result = await newItem.save();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
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
        const result = await Item.find({ deleted: false }).sort({ orderNumber: 1 });
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};


export const convertToFavorite = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({ codigo: req.body.codigo }, { oferta: 1 }, { new: true, useFindAndModify: false });
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const deConvertToFavorite = async (req, res) => {
    try {
        const result = await Item.findOneAndUpdate({ codigo: req.body.codigo }, { oferta: 0 }, { new: true, useFindAndModify: false });
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
        const limit = parseInt(req.params.limit);
        const skip = limit - 12;
        let filtro = {};
        if (req.params.filtro !== 'all') {
            if (filtroValue.toLowerCase() === 'destacado') {
                filtro = { oferta: { $gt: 0 }, deleted: false };
            }
            else if (filtroSelect === 'sub') {
                filtro = {subTipo: filtroValue, deleted: false};
            } else if(filtroSelect === 'tipo') {
                filtro = {tipo: filtroValue, deleted: false};
            }
        }
        
        let result;
        
        switch (tipoBusqueda) {
            case 'date':
                result = await Item.find(filtro).collation({locale:'en', strength: 2}).sort({date: tipoOrder*-1}).skip(skip).limit(limit);
                break;
            case 'name':
                result = await Item.find(filtro).collation({locale:'en', strength: 2}).sort({name: tipoOrder}).skip(skip).limit(limit);
                break;
            case 'priceIGV':
                result = await Item.find(filtro).collation({locale:'en', strength: 2}).sort({priceIGV: tipoOrder}).skip(skip).limit(limit);
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
        const result = await Item.find({tipo: req.params.tipo, deleted: false});
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getAllItemsSubTipoName = async (req, res) => {
    try {
        const result = await Item.find({subTipo: req.params.subTipo, tipo: req.params.tipo, deleted: false})
        .sort({orderNumber: 1});
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
        const result = await Item.updateMany({tipo: req.beforeName}, { tipo: req.body.tipoName}, {new: true, useFindAndModify: false, runValidators: true});
        res.json(req.newTipo);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const deleteItem = async (req, res, next) => {
    try {
        const result = await Item.findOneAndUpdate({codigo: req.params.codigo}, { deleted: true }, {new: true, useFindAndModify: false});
        req.result = result;
        req.photNameToDelete = result.photo;
        next();
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const addTagsAll = async (req, res) => {
    try {
        const result = await Item.updateMany({}, {
            $set: {
                tags: []
            }
        });
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const deleteItemsTipo = async (req, res) => {
    try {
        await Item.updateMany({tipo: req.tipoDeleted.name}, { deleted: true });
        res.json(req.tipoDeleted);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const deleteItemsSubTipo = async (req, res) => {
    try {
        const result = await Item.updateMany({subTipo: req.params.subTipoName}, { deleted: true });
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
        res.status(200).json(result);
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

export const actualizarItems = async (req, res) => {
    try {
            await Item.updateMany({}, {
                deleted: false
            });
        res.json({done: 'done'});
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const filtrarTopFive = async (req, res) => {
    try {
        const singleToSend = [];
        const gananciaPorItemFive = req.gananciaPorItem
        .filter(item => !(item.name.length === 6 && item.name.split('')[2] === 'N' && item.name.split('')[3] === 'I'))
        .slice(0, 4);

        const indexOddItem = gananciaPorItemFive.findIndex(x => x.name === '3SDKP7');
        if (indexOddItem !== -1) {
            gananciaPorItemFive.splice(indexOddItem, 1);
        } else {
            gananciaPorItemFive.pop();
        }

        // const gananciaPorItemFiveOtherItems = req.gananciaPorItem.filter(item => item.name.length === 6).slice(0, 4);
        for (let index = 0; index < gananciaPorItemFive.length; index++) {
            const newName = await Item.findOne({codigo: gananciaPorItemFive[index].name});
            gananciaPorItemFive[index].name = newName.name;
            singleToSend.push({
                name: gananciaPorItemFive[index].name,
                series: [
                    {
                        name: 'Ventas',
                        value: gananciaPorItemFive[index].totalVenta
                    },
                    {
                        name: 'Ganancias',
                        value: gananciaPorItemFive[index].value
                    }
                ]
            });
        }
        /*
        console.log(await Venta.aggregate([
            { $match: { date: { $gte: new Date('2021-02-01') }, estado: 'ejecutada' } },
            { $unwind: "$itemsVendidos" },
            { $replaceRoot: { newRoot: "$itemsVendidos" } },
            { $project: { _id: 0, codigo: 1, name: 1 } },
            { $match: { codigo: "CANI46" } }
        ]));*/
        res.json(singleToSend);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

// posVar: { $sum: '$variaciones.costoVar' }

export const optenerVariacionPosneg = async (req, res) => {
    try {

        
        const variacionNegativaQuitar = await Item.aggregate([
            { $match: { deleted: false }},
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': false }},
            { $project: { variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $project: { variaciones: 1, firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $match: { 'firstPartVar': 'quitar' }},
            { $group: { _id: null, totalVarQuitar: { $sum: '$variaciones.costoVar' } } }
        ]);

        const variacionPositiva = await Item.aggregate([
            { $match: { deleted: false }},
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': true }},
            { $group: { _id: { codigo: '$codigo', name: '$name' }, posVar: { $sum: '$variaciones.costoVar' } } },
            { $project: { _id: 0, codigo: '$_id.codigo', name: '$_id.name', posVar: 1 } },
            { $sort: { name: 1 } },
            { $group: { _id: null, totalVarPos: { $sum: '$posVar' } } }
        ]);

        const variacionNegativa = await Item.aggregate([
            { $match: { deleted: false }},
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': false }},
            { $group: { _id: { codigo: '$codigo', name: '$name' }, posVar: { $sum: '$variaciones.costoVar' } } },
            { $project: { _id: 0, codigo: '$_id.codigo', name: '$_id.name', posVar: 1 } },
            { $sort: { name: 1 } },
            { $group: { _id: null, totalVarNeg: { $sum: '$posVar' } } }
        ]);

        const variacionPosivaAnular = await Item.aggregate([
            { $match: { deleted: false }},
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': true }},
            { $project: { variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $project: { variaciones: 1, firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $match: { 'firstPartVar': 'anular' }},
            { $group: { _id: null, totalVarAnular: { $sum: '$variaciones.costoVar' } } }
        ]);

        res.json({ gastosInventario: (variacionPositiva[0].totalVarPos - 
            ((variacionNegativaQuitar[0] ? variacionNegativaQuitar[0].totalVarQuitar : 0) + 
                (variacionPosivaAnular[0] ? variacionPosivaAnular[0].totalVarAnular : 0))), 
            gananciasInventario: variacionNegativa[0].totalVarNeg - 
            ((variacionNegativaQuitar[0] ? variacionNegativaQuitar[0].totalVarQuitar : 0) + 
            (variacionPosivaAnular[0] ? variacionPosivaAnular[0].totalVarAnular : 0)) });
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const testAgre = async (req, res) => {
    try {
        const variacionNegativaQuitar = await Item.aggregate([
            { $match: { deleted: false }},
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': false }},
            { $project: { variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $project: { variaciones: 1, firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $match: { 'firstPartVar': 'quitar' }},
            { $group: { _id: null, totalVarQuitar: { $sum: '$variaciones.costoVar' } } }
        ]);
        res.json(variacionNegativaQuitar);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const optenerGastosGananciasTotales = async (req, res) => {
    try {

        const variacionNegativaQuitar = await Item.aggregate([
            { $match: { deleted: false }},
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': false }},
            { $project: { variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $project: { variaciones: 1, firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $match: { 'firstPartVar': 'quitar' }},
            { $group: { _id: null, totalVarQuitar: { $sum: '$variaciones.costoVar' } } }
        ]);

        const variacionPosivaAnular = await Item.aggregate([
            { $match: { deleted: false }},
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': true }},
            { $project: { variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $project: { variaciones: 1, firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $match: { 'firstPartVar': 'anular' }},
            { $group: { _id: null, totalVarAnular: { $sum: '$variaciones.costoVar' } } }
        ]);

        const variacionPositiva = await Item.aggregate([
            { $match: { deleted: false }},
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': true }},
            { $group: { _id: { codigo: '$codigo', name: '$name' }, posVar: { $sum: '$variaciones.costoVar' } } },
            { $project: { _id: 0, codigo: '$_id.codigo', name: '$_id.name', posVar: 1 } },
            { $sort: { name: 1 } },
            { $group: { _id: null, totalVarPos: { $sum: '$posVar' } } }
        ]);

        const gastosItemsFueraTienda = await Venta.aggregate([
            { $match: { date: { $gte: new Date('2021-01-01') }, estado: 'ejecutada' } },
            { $unwind: "$itemsVendidos" },
            { $replaceRoot: { newRoot: "$itemsVendidos" } },
            { $project: { codigo: 1, codArray: {  $split: [ '$codigo', 'NI' ]  }, totalPrice: 1, codSize: {$strLenCP: "$codigo"},
            costoTotalPropio: { $multiply: ['$priceCosto', '$cantidad'] } } },
            { $match: { codSize: 6 } },
            { $set: { arrayCodSize: { $size: "$codArray" } } },
            { $match: { arrayCodSize: 2 } },
            { $project: { codigo: 1, costoTotalPropio: 1, totalPrice: 1, 
                primeraParteLen: {$strLenCP: {$arrayElemAt: [ "$codArray", 0 ]}}, 
                segundaParteLen: {$strLenCP: {$arrayElemAt: [ "$codArray", 0 ]}} 
            } },
            { $match: { primeraParteLen: 2, segundaParteLen: 2 } },
            { $group: { _id: null, costoTotalPropio: { $sum: '$costoTotalPropio' }, ingresoTotal: { $sum: '$totalPrice' } }}
        ]);

        const variacionNegativa = await Item.aggregate([
            { $match: { deleted: false }},
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': false }},
            { $group: { _id: { codigo: '$codigo', name: '$name' }, posVar: { $sum: '$variaciones.costoVar' } } },
            { $project: { _id: 0, codigo: '$_id.codigo', name: '$_id.name', posVar: 1 } },
            { $sort: { name: 1 } },
            { $group: { _id: null, totalVarNeg: { $sum: '$posVar' } } }
        ]);

        res.json({ 
            gastoTotalHistorico: (variacionPositiva[0].totalVarPos - 
                ((variacionNegativaQuitar[0] ? variacionNegativaQuitar[0].totalVarQuitar : 0) + 
                    (variacionPosivaAnular[0] ? variacionPosivaAnular[0].totalVarAnular : 0))) + 
            gastosItemsFueraTienda[0].costoTotalPropio,
            ingresoTotalHistorico: (variacionNegativa[0].totalVarNeg - 
                ((variacionNegativaQuitar[0] ? variacionNegativaQuitar[0].totalVarQuitar : 0) + 
                    (variacionPosivaAnular[0] ? variacionPosivaAnular[0].totalVarAnular : 0))) + 
            gastosItemsFueraTienda[0].ingresoTotal
         });
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const optenerVentasPotenciales = async (req, res) => {
    try {
        const ventasPosibles = await Item.aggregate([
            { $match: { deleted: false } },
            { $project: { _id: 0, cantidad: 1, priceIGV: 1, total: { $multiply: ['$priceIGV', '$cantidad'] } } },
            { $group: { _id: null, totalPotencial: { $sum: '$total' } } }
        ]);

        const gastosCalculado = await Item.aggregate([
            { $match: { deleted: false } },
            { $project: { _id: 0, cantidad: 1, costoPropio: 1, total: { $multiply: ['$costoPropio', '$cantidad'] } } },
            { $group: { _id: null, totalPotencial: { $sum: '$total' } } }
        ]);
        res.json({ ventasPosibles: ventasPosibles[0].totalPotencial, costoPropioTotalAprox: gastosCalculado[0].totalPotencial,
            gananciaAprox: ventasPosibles[0].totalPotencial - gastosCalculado[0].totalPotencial });
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getPeorMejorItem = async (req, res) => {
    try {
        const peorMejor = await Item.aggregate([
            { $match: { deleted: false }},
            { $unwind: '$variaciones' },
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1, 
                costoVarTrue: {$cond: [{$eq: ['$variaciones.tipo', true]}, '$variaciones.costoVar', 0]},
                costoVarFalse: {$cond: [{$eq: ['$variaciones.tipo', false]}, '$variaciones.costoVar', 0]} } },
            { $group: { _id: {name: '$name', codigo: '$codigo'}, totalTrue: { $sum: '$costoVarTrue' }, totalFalse: { $sum: '$costoVarFalse' } } },
            { $project: { _id: 0, name: '$_id.name', codigo: '$_id.codigo', totalTrue: 1, totalFalse: 1, balance: { $subtract: ['$totalFalse', '$totalTrue'] } } },
            { $sort: { balance: 1 } },
        ]);
        res.json({ peor: peorMejor[0], mejor: peorMejor[peorMejor.length - 1] });
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const gananciasPosiblesConItemMayor = async (req, res) => {
    try {
        const mayorGananciaPosible = await Item.aggregate([
            { $match: { deleted: false } },
            { $project: { codigo: 1, name: 1, cantidad: 1, costoPropio: 1, priceIGV: 1, 
                totalIngreso: { $multiply: [ '$cantidad', '$priceIGV' ] }, 
                totalCosto: { $multiply: [ '$cantidad', '$costoPropio' ] } } },
                { $project: { codigo: 1, name: 1, cantidad: 1, costoPropio: 1, priceIGV: 1, 
                    balance: { $subtract: [ '$totalIngreso', '$totalCosto' ] } } }
        ]).sort({ balance: -1 }).limit(1);
        res.json(mayorGananciaPosible[0]);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getGananciasTotalesSNS = async (req, res) => {
    try {
        const gastosItemsFueraTienda = await Venta.aggregate([
            { $match: { date: { $gte: new Date('2021-01-01') }, estado: 'ejecutada' } },
            { $unwind: "$itemsVendidos" },
            { $replaceRoot: { newRoot: "$itemsVendidos" } },
            { $project: { codigo: 1, codArray: {  $split: [ '$codigo', 'NI' ]  }, totalPrice: 1, codSize: {$strLenCP: "$codigo"},
            costoTotalPropio: { $multiply: ['$priceCosto', '$cantidad'] } } },
            { $match: { codSize: 6 } },
            { $set: { arrayCodSize: { $size: "$codArray" } } },
            { $match: { arrayCodSize: 2 } },
            { $project: { codigo: 1, costoTotalPropio: 1, totalPrice: 1, 
                primeraParteLen: {$strLenCP: {$arrayElemAt: [ "$codArray", 0 ]}}, 
                segundaParteLen: {$strLenCP: {$arrayElemAt: [ "$codArray", 1 ]}} 
            } },
            { $match: { primeraParteLen: 2, segundaParteLen: 2 } },
            { $group: { _id: null, costoTotalPropio: { $sum: '$costoTotalPropio' }, ingresoTotal: { $sum: '$totalPrice' } }}
        ]);

        const gastosItemsDeTiendaTotales = await Venta.aggregate([
            { $match: { date: { $gte: new Date('2021-01-01') }, estado: 'ejecutada' } },
            { $unwind: "$itemsVendidos" },
            { $replaceRoot: { newRoot: "$itemsVendidos" } },
            { $project: { codigo: 1, totalPrice: 1, costoTotalPropio: { $multiply: ['$priceCosto', '$cantidad'] } } },
            { $group: { _id: null, costoTotalPropio: { $sum: '$costoTotalPropio' }, ingresoTotal: { $sum: '$totalPrice' } }}
        ]);

        res.json({ 
            gananciaEnVentasFueraTienda: 
            gastosItemsFueraTienda[0].ingresoTotal - gastosItemsFueraTienda[0].costoTotalPropio,
            gananciaEnVentas: 
            gastosItemsDeTiendaTotales[0].ingresoTotal - gastosItemsDeTiendaTotales[0].costoTotalPropio,
            gananciaEnVentasDeTienda: 
            (gastosItemsDeTiendaTotales[0].ingresoTotal - gastosItemsFueraTienda[0].ingresoTotal) - 
            (gastosItemsDeTiendaTotales[0].costoTotalPropio - gastosItemsFueraTienda[0].costoTotalPropio),
         });
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getItemsMasVendido = async (req, res) => {
    try {
        const itemsMasVendidos = await Venta.aggregate([
            { $match: { date: { $gte: new Date('2021-01-01') }, estado: 'ejecutada' } },
            { $unwind: "$itemsVendidos" },
            { $replaceRoot: { newRoot: "$itemsVendidos" } },
            { $group: { _id: '$codigo', cantidad: { $sum: 1 } } },
            { $sort: { cantidad: -1 } },
        ]);
        const item = await Item.findOne({codigo: itemsMasVendidos[0]._id});
        res.json(item);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getClientesConMasCompras = async (req, res) => {
    try {
        const mejoresClientes = await Venta.aggregate([
            { $match: { date: { $gte: new Date('2021-01-01') }, estado: 'ejecutada' } },
            { $unwind: "$documento" },
            { $replaceRoot: { newRoot: "$documento" } },
            { $match: { codigo: { $ne: null } } },
            { $group: { _id: {codigo: '$codigo', name: '$name'}, cantidad: { $sum: 1 } } },
            { $sort: { cantidad: -1 } },
        ]);
        res.json({ cliente: mejoresClientes[0]._id.name, numero:  mejoresClientes[0].cantidad});
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};


export const deleteCaracteristica = async (req, res) => {
    try {
        const result = 
        await Item.findOneAndUpdate({ codigo: req.body.itemCod }, 
            { $pull: { caracteristicas: { $in: req.body.deleteArray } } }, {useFindAndModify: false, new: true});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const addCaracteristica = async (req, res) => {
    try {
        const result = 
        await Item.findOneAndUpdate({ codigo: req.body.itemCod }, 
            { $push: { caracteristicas: req.body.newCaracteristica } }, {useFindAndModify: false, new: true});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};


export const addOrderToItems = async (req, res) => {
    try {
        const result = 
        await Item.updateMany({ deleted: false }, 
            { $set: { orderNumber: 0 } });
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const reOrderItems = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const preBusqueda = 
        await Item.countDocuments({deleted: false, subTipo: req.body.itemReOrder[0].subTipo, tipo: req.body.itemReOrder[0].tipo});
        if (preBusqueda !== req.body.itemReOrder.length) {
            throw ('Variacion Invalida');
        }
        for (let index = 0; index < req.body.itemReOrder.length; index++) {
            await Item.findOneAndUpdate({codigo: req.body.itemReOrder[index].codigo}, { orderNumber: index }, { useFindAndModify: false });
        }
        await session.commitTransaction();
        session.endSession();
        res.json({message: 'done'});
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({errorMSG: error});
    }
};

export const getItemsLowStock = async (req, res) => {
    try {
        const sinStockItems = await Item.find({ deleted: false, $and: [ { cantidad: { $lt: 5 } }, { cantidad: { $gt: 0 } } ] });
        res.json(sinStockItems);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};


export const getItemsNoStock = async (req, res) => {
    try {
        const sinStockItems = await Item.find({ deleted: false, cantidad: 0 });
        res.json(sinStockItems);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getGICofItem = async (req, res) => {
    try {
        const cantidadHistorica = await Item.aggregate([
            { $match: { codigo: req.params.codigoItem } },
            { $unwind: "$variaciones" },
            { $project: { variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $set: { firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $set: { 
                cantidadVarNI: { $cond: [{$eq: ['$firstPartVar', 'new item']}, '$variaciones.cantidad', 0] },
                cantidadVarQuitar: { $cond: [{$eq: ['$firstPartVar', 'quitar']}, '$variaciones.cantidad', 0] },
                cantidadVarAgregar: { $cond: [{$eq: ['$firstPartVar', 'agregar']}, '$variaciones.cantidad', 0] },
                cantidadVarAnular: { $cond: [{$eq: ['$firstPartVar', 'anular']}, '$variaciones.cantidad', 0] },
                cantidadVarVenta: { $cond: [{$eq: ['$firstPartVar', 'venta']}, '$variaciones.cantidad', 0] },
            } },
            { $group: 
                { _id: null, 
                totalCantidadNI: { $sum: '$cantidadVarNI' }, 
                totalCantidadQuitar: { $sum: '$cantidadVarQuitar' }, 
                totalCantidadAgregar: { $sum: '$cantidadVarAgregar' }, 
                totalCantidadVenta: { $sum: '$cantidadVarVenta' }, 
                totalCantidadAnular: { $sum: '$cantidadVarAnular' }, 
            } },
        ]);

        const itemGIC = await Item.aggregate([
            { $match: { codigo: req.params.codigoItem } },
            { $unwind: "$variaciones" },
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1, 
                costoVarTrue: {$cond: [{$eq: ['$variaciones.tipo', true]}, '$variaciones.costoVar', 0]},
                costoVarFalse: {$cond: [{$eq: ['$variaciones.tipo', false]}, '$variaciones.costoVar', 0]} } },
            { $group: { _id: {name: '$name', codigo: '$codigo'}, totalTrue: { $sum: '$costoVarTrue' }, totalFalse: { $sum: '$costoVarFalse' } } },
        ]);

        const variacionNegativaQuitar = await Item.aggregate([
            { $match: { codigo: req.params.codigoItem } },
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': false }},
            { $project: { variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $project: { variaciones: 1, firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $match: { 'firstPartVar': 'quitar' }},
            { $group: { _id: null, totalVarQuitar: { $sum: '$variaciones.costoVar' } } }
        ]);

        const variacionPosivaAnular = await Item.aggregate([
            { $match: { codigo: req.params.codigoItem } },
            { $project: {_id: 0, codigo: 1, name: 1, variaciones: 1 } },
            { $unwind: '$variaciones' },
            { $match: { 'variaciones.tipo': true }},
            { $project: { variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $project: { variaciones: 1, firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $match: { 'firstPartVar': 'anular' }},
            { $group: { _id: null, totalVarAnular: { $sum: '$variaciones.costoVar' } } }
        ]);
        res.json({ itemVendidos: (cantidadHistorica[0].totalCantidadVenta - cantidadHistorica[0].totalCantidadAnular ), 
            cantidadHistorica: 
            (cantidadHistorica[0].totalCantidadNI + cantidadHistorica[0].totalCantidadAgregar) - cantidadHistorica[0].totalCantidadQuitar ,
            totalCosto: itemGIC[0].totalTrue - 
            ((variacionNegativaQuitar[0] ? variacionNegativaQuitar[0].totalVarQuitar : 0) + 
                (variacionPosivaAnular[0] ? variacionPosivaAnular[0].totalVarAnular : 0)), 
            totalIngreso: itemGIC[0].totalFalse - 
            ((variacionNegativaQuitar[0] ? variacionNegativaQuitar[0].totalVarQuitar : 0 ) + 
                (variacionPosivaAnular[0] ? variacionPosivaAnular[0].totalVarAnular : 0))
        });
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const ventasDeItemPorMesGrafico = async (req, res) => {
    try {

        const result = await Item.aggregate([
            { $match: { codigo: req.params.codigoItem } },
            { $unwind: "$variaciones" },
            { $project: { variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $set: { firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $set: { 
                cantidadVarAnular: { $cond: [{$eq: ['$firstPartVar', 'anular']}, '$variaciones.cantidad', 0] },
                cantidadVarVenta: { $cond: [{$eq: ['$firstPartVar', 'venta']}, '$variaciones.cantidad', 0] },
                dateVar:  { $dateToString: { format: "%Y-%m", date: "$variaciones.date", timezone: "-05:00" } },
            } },
            {
                $group: { _id: '$dateVar', valueVenta: { $sum: '$cantidadVarVenta' }, valueAnular: { $sum: '$cantidadVarAnular' } } 
            }, 
            {
                $project: { _id: 0, name: '$_id', value: { $subtract: ['$valueVenta', '$valueAnular'] } } 
            },
            { 
                $sort: { name : 1 } 
            }
        ]);

        const single = [
            {
                name: 'Cantidad',
                series: result
            }
        ];
        res.json(single);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getTopFiveIngresosGananciasGastos = async (req, res) => {
    try {
        const ingresos = await Item.aggregate([
            { $match: { deleted: false } },
            { $unwind: "$variaciones" },
            { $project: { name: 1, variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $set: { firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $set: { 
                cantidadVarAnular: { $cond: [{$eq: ['$firstPartVar', 'anular']}, '$variaciones.costoVar', 0] },
                cantidadVarVenta: { $cond: [{$eq: ['$firstPartVar', 'venta']}, '$variaciones.costoVar', 0] },
            } },
            {
                $group: { _id: '$name', valueVenta: { $sum: '$cantidadVarVenta' }, valueAnular: { $sum: '$cantidadVarAnular' } } 
            }, 
            {
                $project: { _id: 0, name: '$_id', value: { $subtract: ['$valueVenta', '$valueAnular'] } } 
            },
            { 
                $sort: { value : -1 } 
            }
        ]);

        const ganancias = await Item.aggregate([
            { $match: { deleted: false } },
            { $unwind: "$variaciones" },
            { $project: { name: 1, variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $set: { firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $set: { 
                cantidadVarAgregar: { $cond: [{$eq: ['$firstPartVar', 'agregar']}, '$variaciones.costoVar', 0] },
                cantidadVarNewItem: { $cond: [{$eq: ['$firstPartVar', 'new item']}, '$variaciones.costoVar', 0] },
                cantidadVarQuitar: { $cond: [{$eq: ['$firstPartVar', 'quitar']}, '$variaciones.costoVar', 0] },
                cantidadVarAnular: { $cond: [{$eq: ['$firstPartVar', 'anular']}, '$variaciones.costoVar', 0] },
                cantidadVarVenta: { $cond: [{$eq: ['$firstPartVar', 'venta']}, '$variaciones.costoVar', 0] },
            } },
            {
                $group: { _id: '$name', valueAgregar: { $sum: '$cantidadVarAgregar' },   valueVenta: { $sum: '$cantidadVarVenta' }, 
                valueAnular: { $sum: '$cantidadVarAnular' },
                valueNewItem: { $sum: '$cantidadVarNewItem' },  valueQuitar: { $sum: '$cantidadVarQuitar' } } 
            },
            {
                $project: { _id: 0, valueQuitar: 1,name: '$_id', preValueTwo: { $subtract: ['$valueVenta', '$valueAnular'] },
                prevalue: { $sum: ['$valueAgregar', '$valueNewItem'] } } 
            }, 
            {
                $project: { _id: 0, name: 1, preValueTwo: 1, preValueT: { $subtract: ['$prevalue', '$valueQuitar'] } } 
            },
            {
                $project: { _id: 0, name: 1, value: { $subtract: ['$preValueTwo', '$preValueT'] } } 
            },
            { 
                $sort: { value : -1 } 
            }
        ]);

        const gastos = await Item.aggregate([
            { $match: { deleted: false } },
            { $unwind: "$variaciones" },
            { $project: { name: 1, variaciones: 1, codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $set: { firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $set: { 
                cantidadVarAgregar: { $cond: [{$eq: ['$firstPartVar', 'agregar']}, '$variaciones.costoVar', 0] },
                cantidadVarNewItem: { $cond: [{$eq: ['$firstPartVar', 'new item']}, '$variaciones.costoVar', 0] },
                cantidadVarQuitar: { $cond: [{$eq: ['$firstPartVar', 'quitar']}, '$variaciones.costoVar', 0] },
            } },
            {
                $group: { _id: '$name', valueAgregar: { $sum: '$cantidadVarAgregar' },
                valueNewItem: { $sum: '$cantidadVarNewItem' },  valueQuitar: { $sum: '$cantidadVarQuitar' } } 
            },
            {
                $project: { _id: 0, valueQuitar: 1,name: '$_id',
                prevalue: { $sum: ['$valueAgregar', '$valueNewItem'] } } 
            }, 
            {
                $project: { _id: 0, name: 1, value: { $subtract: ['$prevalue', '$valueQuitar'] } } 
            },
            { 
                $sort: { value : -1 } 
            }
        ]);
        res.json(gastos);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getTableInfItem = async (req, res) => {
    try {
        const tableInfo = await Item.aggregate([
            { $match: { deleted: false } },
            { $unwind: "$variaciones" },
            { $project: { name: 1, codigo: 1, cantidad: 1, variaciones: 1, priceIGV: 1, costoPropio: 1,
                codVar: {  $split: [ '$variaciones.comentario', '|' ] } } },
            { $set: { firstPartVar: {  $arrayElemAt: [ '$codVar', 0 ] } } },
            { $set: { 
                cantidadVarAgregar: { $cond: [{$eq: ['$firstPartVar', 'agregar']}, '$variaciones.costoVar', 0] },
                cantidadVarNewItem: { $cond: [{$eq: ['$firstPartVar', 'new item']}, '$variaciones.costoVar', 0] },
                cantidadVarQuitar: { $cond: [{$eq: ['$firstPartVar', 'quitar']}, '$variaciones.costoVar', 0] },
                cantidadVarAnular: { $cond: [{$eq: ['$firstPartVar', 'anular']}, '$variaciones.costoVar', 0] },
                cantidadVarVenta: { $cond: [{$eq: ['$firstPartVar', 'venta']}, '$variaciones.costoVar', 0] },
            } },
            {
                $group: { _id: {name: '$name', codigo: '$codigo', cantidad: '$cantidad', priceIGV: '$priceIGV', costoPropio: '$costoPropio'}, 
                valueAgregar: { $sum: '$cantidadVarAgregar' },   valueVenta: { $sum: '$cantidadVarVenta' }, 
                valueAnular: { $sum: '$cantidadVarAnular' }, 
                valueNewItem: { $sum: '$cantidadVarNewItem' },  valueQuitar: { $sum: '$cantidadVarQuitar' } } 
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id.name', codigo: '$_id.codigo', cantidad: '$_id.cantidad', 
                    priceIGV: '$_id.priceIGV', costoPropio: '$_id.costoPropio',
                    valueQuitar: 1,
                    preValueGasto: { $sum: ['$valueAgregar', '$valueNewItem'] },
                    valueIngreso: { $subtract: ['$valueVenta', '$valueAnular'] }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1, codigo: 1, cantidad: 1, 
                    priceIGV: 1, costoPropio: 1,
                    valueGasto: { $subtract: ['$preValueGasto', '$valueQuitar'] },
                    valueIngreso: 1
                }
            },
            { 
                $sort: { valueIngreso : -1 } 
            }
        ]);
        res.json(tableInfo);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};







