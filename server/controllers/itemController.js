import mongoose from 'mongoose';
import itemSchema from '../models/itemModel';
import marcaSchema from '../models/marcaModel';
import config   from '../../config/index';

const Item = mongoose.model('Item', itemSchema);
const Marca = mongoose.model('Marca', marcaSchema);
const IGV = 0.18;


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
        console.log(result);
        return res.json(result);
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