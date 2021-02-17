import mongoose from 'mongoose';
import Item from '../lib/Item';
import tipoSchema from '../models/tipoModel';

const Tipo = mongoose.model('Tipo', tipoSchema);




export const addNewTipo = async (req, res) => {
    try {
        let newTipo = new Tipo(req.body);
        newTipo.codigo = Date.now().toString();
        newTipo.subTipo = [];
        const result = await newTipo.save();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const addNewSubTipo = async (req, res) => {
    try {
        await Tipo.updateOne({codigo: req.body.codigo}, {$push: {subTipo: req.body.subTipo}});
        return res.json({message: 'succes'});
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const getAllTipos = async (req, res) => {
    try {
        const result = await Tipo.find({}).select('name codigo -_id');
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const getSubTipos = async (req, res) => {
    try {
        const result = await Tipo.findOne({codigo: req.params.tipoCod}).select('subTipo -_id');
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getTipo = async (req, res) => {
    try {
        const result = await Tipo.findOne({codigo: req.params.codigo});
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const getAllSubTipoFor = async (req, res) => {
    try {
        const result = await Tipo.findOne({codigo: req.params.codigo});
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};


export const updateTipo = async (req, res, next) => {
    try {
        const tipo = await Tipo.findOne({codigo: req.body.codigo});
        req.beforeName = tipo.name;
        await Tipo.findOneAndUpdate({codigo: req.body.codigo}, {name: req.body.name}, {new: true, useFindAndModify: false});
        next();
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const updateSubTipo = async (req, res, next) => {
    try {
        const tipo = await Tipo.findOne({codigo: req.body.codigo});
        const index = tipo.subTipo.indexOf(req.body.antiguoSubName);
        tipo.subTipo[index] = req.body.newSubName;
        await Tipo.findOneAndUpdate({codigo: req.body.codigo}, {subTipo: tipo.subTipo}, {new: true, useFindAndModify: false});
        next();
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const deleteSubTipo = async (req, res, next) => {
    try {
        const tipo = await Tipo.findOne({codigo: req.params.codigo});
        const index = tipo.subTipo.indexOf(req.params.subTipoName);
        tipo.subTipo.splice(index, 1);
        await Tipo.findOneAndUpdate({codigo: req.params.codigo}, {subTipo: tipo.subTipo}, {new: true, useFindAndModify: false});
        next();
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const deleteTipo = async (req, res, next) => {
    try {
        const tipo = await Tipo.findOne({codigo: req.params.codigo});
        await Tipo.findOneAndDelete({codigo: req.params.codigo});
        req.tipoName = tipo.name;
        next();
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

