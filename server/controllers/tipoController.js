import mongoose from 'mongoose';
import tipoSchema from '../models/tipoModel';

const Tipo = mongoose.model('Tipo', tipoSchema);

export const addNewTipo = async (req, res) => {
    try {
        let newTipo = new Tipo(req.body);
        newTipo.codigo = Date.now().toString();
        const result = await newTipo.save();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};

export const getAllTipos = async (req, res) => {
    try {
        const result = await Tipo.find({});
        return res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});

    }
};


export const updateTipo = async (req, res) => {
    try {
        const result = await Tipo.findOne({name: req.body.name}, req.body, {new: true, useFindAndModify: false});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

export const deleteTipo = async (req, res) => {
    try {
        const result = await Tipo.findOneAndDelete({codigo: req.params.codigo});
        res.json(result);
    } catch (error) {
        return res.status(500).json({errorMSG: error});
    }
};

