import mongoose from 'mongoose';
import tipoSchema from '../models/tipoModel';
import itemSchema from '../models/itemModel';

const Tipo = mongoose.model('Tipo', tipoSchema);

const Item = mongoose.model('Item', itemSchema);


export const getSiteMapLinks = async (req, res) => {
	try {
		const lastWeek = new Date();
		lastWeek.setDate(lastWeek.getDate() - 7);

		const getTipos = await Tipo.find({ deleted: false });
		const getItems = await Item.find({ deleted: false });

		const siteMapsArray = [
			{ url: 'store/main', priority: 1, changefreq: 'monthly' },
			{ url: '/', priority: 1, changefreq: 'monthly' },
			{ url: 'store/categorias', priority: 0.9, changefreq: 'weekly' },
		];

		for (let index = 0; index < getTipos.length; index++) {
			siteMapsArray.push({ url: 'store/categorias/' + getTipos[index].name,
				priority: 0.7, changefreq: 'daily' });
			for (let yndex = 0; yndex < getTipos[index].subTipo.length; yndex++) {
				siteMapsArray.push(
					{ url: 'store/categorias/' + getTipos[index].name + '/' + getTipos[index].subTipo[yndex],
						priority: 0.6, changefreq: 'daily' });
			}
		}

		for (let index = 0; index < getItems.length; index++) {
			siteMapsArray.push({ url: 'store/categorias/' + getItems[index].tipo + '/' + getItems[index].subTipo + '/' + getItems[index].codigo,
				priority: 0.5, changefreq: 'daily' });
		}

		res.json(siteMapsArray);
	}
	catch (error) {
		return res.status(500).end();
	}
};

export const addNewTipo = async (req, res) => {
	try {
		const newTipo = new Tipo(req.body);
		newTipo.codigo = Date.now().toString();
		newTipo.subTipo = [];
		const result = await newTipo.save();
		return res.json(result);
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const addNewSubTipo = async (req, res) => {
	try {
		const tipo = await Tipo.findOne({ name: req.body.codigo });
		if (tipo.subTipo.indexOf(req.body.subTipo) > -1) {
			return res.json(null);
		}
		await Tipo.updateOne({ codigo: tipo.codigo }, { $push: { subTipo: req.body.subTipo, subTipoLink: 'noPhoto.jpg' } });
		return res.json({ message: 'succes' });
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const getAllTipos = async (req, res) => {
	try {
		const result = await Tipo.find({ deleted: false }).sort({ order: 1 });
		return res.json(result);
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });

	}
};

export const getSubTipos = async (req, res) => {
	try {
		const result = await Tipo.findOne({ name: req.params.tipoCod }).select('subTipo -_id');
		return res.json(result);
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const getTipo = async (req, res) => {
	try {
		const result = await Tipo.findOne({ name: req.params.codigo });
		return res.json(result);
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const getAllSubTipoFor = async (req, res) => {
	try {
		const result = await Tipo.findOne({ codigo: req.params.codigo });
		return res.json(result);
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};


export const updateTipo = async (req, res, next) => {
	try {
		const tipo = await Tipo.findOne({ codigo: req.body.codigo });
		req.beforeName = tipo.name;
		const newTipo = await Tipo.findOneAndUpdate({ codigo: req.body.codigo }, { name: req.body.tipoName }, { new: true, useFindAndModify: false });
		req.newTipo = newTipo;
		next();
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const updateTipoTransac = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const tipo = await Tipo.findOne({ codigo: req.body.codigo });
		req.beforeName = tipo.name;
		const newTipo = await Tipo.findOneAndUpdate({ codigo: req.body.codigo }, { name: req.body.tipoName }, { new: true, useFindAndModify: false });
		req.newTipo = newTipo;
		await Item.updateMany({ tipo: req.beforeName }, { tipo: req.body.tipoName }, { new: true, useFindAndModify: false, runValidators: true });
		await session.commitTransaction();
		session.endSession();
		res.json(req.newTipo);
	}
	catch (error) {
		await session.abortTransaction();
		session.endSession();
		return res.status(500).json({ errorMSG: error });
	}
};

export const updateSubTipo = async (req, res, next) => {
	try {
		const tipo = await Tipo.findOne({ codigo: req.body.codigo });
		if (tipo.subTipo.indexOf(req.body.newSubName) > -1) {
			return res.json(null);
		}
		const index = tipo.subTipo.indexOf(req.body.antiguoSubName);
		tipo.subTipo[index] = req.body.newSubName;
		await Tipo.findOneAndUpdate({ codigo: req.body.codigo }, { subTipo: tipo.subTipo }, { new: true, useFindAndModify: false });
		next();
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const updateSubTipoTransac = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const tipo = await Tipo.findOne({ name: req.body.codigo });
		if (tipo.subTipo.indexOf(req.body.newSubName) > -1) {
			return res.json(null);
		}
		const index = tipo.subTipo.indexOf(req.body.antiguoSubName);
		tipo.subTipo[index] = req.body.newSubName;
		await Tipo.findOneAndUpdate({ name: req.body.codigo }, { subTipo: tipo.subTipo }, { new: true, useFindAndModify: false });
		const result = await Item.updateMany({ subTipo: req.body.antiguoSubName }, { subTipo: req.body.newSubName }, { new: true, useFindAndModify: false });
		await session.commitTransaction();
		session.endSession();
		res.json(result);
	}
	catch (error) {
		await session.abortTransaction();
		session.endSession();
		return res.status(500).json({ errorMSG: error });
	}
};

export const deleteSubTipo = async (req, res, next) => {
	try {
		const tipo = await Tipo.findOne({ codigo: req.params.codigo });
		const index = tipo.subTipo.indexOf(req.params.subTipoName);
		tipo.subTipo.splice(index, 1);
		await Tipo.findOneAndUpdate({ codigo: req.params.codigo }, { subTipo: tipo.subTipo }, { new: true, useFindAndModify: false });
		next();
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const deleteSubTipoTransac = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const tipo = await Tipo.findOne({ name: req.params.codigo });
		const index = tipo.subTipo.indexOf(req.params.subTipoName);
		tipo.subTipo.splice(index, 1);
		await Tipo.findOneAndUpdate({ name: req.params.codigo }, { subTipo: tipo.subTipo }, { new: true, useFindAndModify: false });
		const result = await Item.updateMany({ subTipo: req.params.subTipoName }, { deleted: true });
		await session.commitTransaction();
		session.endSession();
		return res.json(result);
	}
	catch (error) {
		await session.abortTransaction();
		session.endSession();
		return res.status(500).json({ errorMSG: error });
	}
};

export const uploadPhotoNameCat = async (req, res) => {
	try {
		const result = await Tipo.findOneAndUpdate({ codigo: req.params.codigo }, { link: req.fileName }, { new: true, useFindAndModify: false });
		res.status(200).json(result);
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const uploadPhotoNameSubCat = async (req, res) => {
	try {
		const tipo = await Tipo.findOne({ name: req.params.codigo });
		const index = tipo.subTipo.findIndex(st => st === req.params.subCat);
		tipo.subTipoLink[index] = req.fileName;
		const result = await Tipo.findOneAndUpdate({ name: req.params.codigo },
			{ subTipoLink: tipo.subTipoLink }, { new: true, useFindAndModify: false });
		res.status(200).json({ newPhoto: tipo.subTipoLink[index] });
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const deleteTipo = async (req, res, next) => {
	try {
		const tipoDeleted = await Tipo.findOneAndUpdate({ codigo: req.params.codigo }, { deleted: true }, { new: true, useFindAndModify: false });
		req.tipoDeleted = tipoDeleted;
		next();
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const deleteTipoTransac = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const tipoDeleted = await Tipo.findOneAndUpdate({ codigo: req.params.codigo }, { deleted: true }, { new: true, useFindAndModify: false });
		req.tipoDeleted = tipoDeleted;
		await Item.updateMany({ tipo: req.tipoDeleted.name }, { deleted: true });
		await session.commitTransaction();
		session.endSession();
		res.json(req.tipoDeleted);
	}
	catch (error) {
		await session.abortTransaction();
		session.endSession();
		return res.status(500).json({ errorMSG: error });
	}
};

export const reOrderTipo = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const preBusqueda = await Tipo.countDocuments({ deleted: false });
		if (preBusqueda !== req.body.tiposReOrder.length) {
			throw ('Variacion Invalida');
		}
		for (let index = 0; index < req.body.tiposReOrder.length; index++) {
			await Tipo.findOneAndUpdate({ codigo: req.body.tiposReOrder[index].codigo }, { order: index }, { useFindAndModify: false });
		}
		await session.commitTransaction();
		session.endSession();
		res.json({ message: 'done' });
	}
	catch (error) {
		await session.abortTransaction();
		session.endSession();
		return res.status(500).json({ errorMSG: error });
	}
};


export const reOrderSubTipo = async (req, res) => {
	try {
		const preConsulta = await Tipo.findOne({ name: req.body.tipoCodigo });
		if (preConsulta.subTipo.length !== req.body.subTipoList.length) {
			throw ('Variacion Invalida');
		}
		const result = await Tipo.findOneAndUpdate({ name: req.body.tipoCodigo },
			{ subTipoLink:  req.body.linksList, subTipo: req.body.subTipoList },
			{ useFindAndModify: false, new: true });
		res.json(result);
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};


export const testFintTipo = async (req, res) => {
	try {
		const result = await Tipo.findOne({ name: 'Guantes de Seguridad' });
		if (result.subTipo.indexOf('Guantes Cat. 3ccc') === -1) {
			throw ('dwe');
		}
		res.json(result);
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const cambiarItemCarpeta = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const result =
        await Item.findOneAndUpdate({ codigo: req.body.codigo },
        	{ subTipo: req.body.newSubTipo, tipo: req.body.newTipo, orderNumber: -2 }, { useFindAndModify: false, new: true });
		const tipoExist = await Tipo.findOne({ name: req.body.newTipo });
		if (tipoExist === null) {
			throw ('Tipo Ya No Existe');
		}
		if (tipoExist.subTipo.indexOf(req.body.newSubTipo) === -1) {
			throw ('Sub Tipo Ya No Existe');
		}
		await session.commitTransaction();
		session.endSession();
		res.json(result);
	}
	catch (error) {
		await session.abortTransaction();
		session.endSession();
		return res.status(500).json({ errorMSG: error });
	}
};