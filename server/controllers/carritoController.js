import mongoose from 'mongoose';
import itemSchema from '../models/itemModel';
import ventaModel from '../models/ventaModel';
import { UserSchema } from '../models/userModel';


const Item = mongoose.model('Item', itemSchema);
const Venta = mongoose.model('Venta', ventaModel);
const User = mongoose.model('User', UserSchema);

export const addItemToCarrito = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const user = await User.findOne({ username: req.user.aud.split(' ')[0] });
		const item = await Item.findOne({ codigo: req.body.codigo });

		// console.log(item);

		let inOrder;

		if (item.subConteo) {
			if (item.subConteo.nameSecond !== '') {
				inOrder = item.subConteo.order
					.find(o => o.name === req.body.orderToAdd.name &&
              o.nameSecond === req.body.orderToAdd.nameSecond);
			}
			else {
				inOrder = item.subConteo.order.find(o => o.name === req.body.orderToAdd.name);
			}
		}


		if (item.deleted) {
			await session.abortTransaction();
			session.endSession();
			return res.status(410).json({ errorMSG: 'El item ha sido elminado' });
		}
		else if (item.priceIGV !== req.body.priceIGV) {
			return res.status(409).json({ errorMSG: 'El precio del producto ha cambiado' });
		}
		else if (item.cantidad < req.body.cantidad) {
			return res.status(409).json({ errorMSG: 'Ya no contamos con la cantidad deseada' });
		}
		else if (item.subConteo) {
			if (inOrder.cantidad < req.body.cantidad) {
			    return res.status(409).json({ errorMSG: 'Ya no contamos con la cantidad deseada' });
			}
		}

		if (user.carrito === 'not') {
			const newVenta = new Venta({
				totalPrice: req.body.cantidad * item.priceIGV,
				totalPriceNoIGV: req.body.cantidad * item.priceNoIGV,
				estado: 'pendiente',
				vendedor: req.user.aud.split(' ')[0],
				tipoVendedor: 'low',
				medio_de_pago: 'efectivo',
				cliente_email: user.email,
				itemsVendidos: [],
				carrito_venta: true,
			});
			newVenta.itemsVendidos.push({
				codigo: item.codigo,
				tipo: 'producto',
				descripcion: item.description,
				name: item.name,
				priceIGV: item.priceIGV,
				priceNoIGV: item.priceNoIGV,
				priceCosto: item.costoPropio,
				cantidad: req.body.cantidad,
				cantidadSC: [],
				totalPrice: req.body.cantidad * item.priceIGV,
				totalPriceNoIGV: req.body.cantidad * item.priceNoIGV,
				unidadDeMedida: item.unidadDeMedida,
				photo: item.photo,
			});
			if (item.subConteo) {
				if (item.subConteo.nameSecond !== '') {
				    newVenta.itemsVendidos[0].cantidadSC.push({
						name: inOrder.name, nameSecond: inOrder.nameSecond,
						cantidadDisponible: inOrder.cantidad, cantidadVenta: req.body.cantidad,
					});
				}
				else {
				    newVenta.itemsVendidos[0].cantidadSC.push({
						name: inOrder.name, nameSecond: undefined,
						cantidadDisponible: inOrder.cantidad, cantidadVenta: req.body.cantidad,
					});
				}
			}
			const codigo = await generarCodigo();
			newVenta.codigo = codigo;
			req.ventaGenerada = await newVenta.save();
			await User.findOneAndUpdate({ username: req.user.aud.split(' ')[0] }, { carrito: req.ventaGenerada.codigo }, { useFindAndModify: false });
		}
		else {
			const ventaActiva = await Venta.findOne({ codigo: user.carrito });
			const itemExiste = ventaActiva.itemsVendidos.findIndex(iv => iv.codigo === item.codigo);
			if (itemExiste === -1) {
				const itemVendido = {
					codigo: item.codigo,
					tipo: 'producto',
					descripcion: item.description,
					name: item.name,
					priceIGV: item.priceIGV,
					priceNoIGV: item.priceNoIGV,
					priceCosto: item.costoPropio,
					cantidad: req.body.cantidad,
					cantidadSC: [],
					totalPrice: req.body.cantidad * item.priceIGV,
					totalPriceNoIGV: req.body.cantidad * item.priceNoIGV,
					unidadDeMedida: item.unidadDeMedida,
					photo: item.photo,
				};

				if (item.subConteo) {
					if (item.subConteo.nameSecond !== '') {
						itemVendido.cantidadSC.push({
							name: inOrder.name, nameSecond: inOrder.nameSecond,
							cantidadDisponible: inOrder.cantidad, cantidadVenta: req.body.cantidad,
						});
					}
					else {
						itemVendido.cantidadSC.push({
							name: inOrder.name, nameSecond: undefined,
							cantidadDisponible: inOrder.cantidad, cantidadVenta: req.body.cantidad,
						});
					}
				}
				req.ventaGenerada = await Venta.findOneAndUpdate({ codigo: user.carrito },
					{
						$push: { itemsVendidos: itemVendido },
						$inc: { totalPrice: itemVendido.totalPrice, totalPriceNoIGV: itemVendido.totalPriceNoIGV },
					},
					{ useFindAndModify: false, new: true });
			}
			else if (itemExiste > -1) {
				if (item.subConteo) {
					let cantidadSCE = -1;
					if (item.subConteo.nameSecond === '') {
						cantidadSCE =
						ventaActiva.itemsVendidos[itemExiste].cantidadSC.findIndex(csc => csc.name === inOrder.name);
					}
					else {
						cantidadSCE =
						ventaActiva.itemsVendidos[itemExiste].cantidadSC
							.findIndex(csc => csc.name === inOrder.name && csc.nameSecond === inOrder.nameSecond);
					}

					if (cantidadSCE === -1) {
						const cantidadToUpdate = ventaActiva.itemsVendidos[itemExiste].cantidad + req.body.cantidad;
						const totalPrecioNuevo = item.priceIGV * cantidadToUpdate;
						const totalPrecioNuevoNoIGV = item.priceNoIGV * cantidadToUpdate;

						const constPrecioTotalVenta =
							(ventaActiva.totalPrice - ventaActiva.itemsVendidos[itemExiste].totalPrice) + totalPrecioNuevo;
						const constPrecioTotalVentaNoIGV =
							(ventaActiva.totalPriceNoIGV - ventaActiva.itemsVendidos[itemExiste].totalPriceNoIGV) + totalPrecioNuevoNoIGV;

						req.ventaGenerada = await Venta.findOneAndUpdate({ codigo: user.carrito, 'itemsVendidos.codigo': item.codigo },
							{
								totalPrice: constPrecioTotalVenta, totalPriceNoIGV:  constPrecioTotalVentaNoIGV,
								$set: {
									'itemsVendidos.$.priceIGV': item.priceIGV,
									'itemsVendidos.$.priceNoIGV': item.priceNoIGV,
									'itemsVendidos.$.priceCosto': item.costoPropio,
									'itemsVendidos.$.cantidad': cantidadToUpdate,
									'itemsVendidos.$.totalPriceNoIGV': totalPrecioNuevoNoIGV,
									'itemsVendidos.$.totalPrice': totalPrecioNuevo,
								},
								$push: {
									'itemsVendidos.$.cantidadSC': {
										name: inOrder.name, nameSecond: inOrder.nameSecond || undefined,
										cantidadDisponible: inOrder.cantidad, cantidadVenta: req.body.cantidad,
									},
								},
							},
					 	{ useFindAndModify: false, new: true });
					}
					else {
						const cantidadToUpdate =
						(ventaActiva.itemsVendidos[itemExiste].cantidad - ventaActiva.itemsVendidos[itemExiste].cantidadSC[cantidadSCE].cantidadVenta) + req.body.cantidad;
						const totalPrecioNuevo = item.priceIGV * cantidadToUpdate;
						const totalPrecioNuevoNoIGV = item.priceNoIGV * cantidadToUpdate;

						const constPrecioTotalVenta =
							(ventaActiva.totalPrice - ventaActiva.itemsVendidos[itemExiste].totalPrice) + totalPrecioNuevo;
						const constPrecioTotalVentaNoIGV =
							(ventaActiva.totalPriceNoIGV - ventaActiva.itemsVendidos[itemExiste].totalPriceNoIGV) + totalPrecioNuevoNoIGV;
						ventaActiva.itemsVendidos[itemExiste].cantidadSC[cantidadSCE].cantidadDisponible = inOrder.cantidad;
						ventaActiva.itemsVendidos[itemExiste].cantidadSC[cantidadSCE].cantidadVenta = req.body.cantidad;

						req.ventaGenerada = await Venta.findOneAndUpdate({ codigo: user.carrito, 'itemsVendidos.codigo': item.codigo },
							{
								totalPrice: constPrecioTotalVenta, totalPriceNoIGV:  constPrecioTotalVentaNoIGV,
								$set: {
									'itemsVendidos.$.priceIGV': item.priceIGV,
									'itemsVendidos.$.priceNoIGV': item.priceNoIGV,
									'itemsVendidos.$.priceCosto': item.costoPropio,
									'itemsVendidos.$.cantidad': cantidadToUpdate,
									'itemsVendidos.$.totalPriceNoIGV': totalPrecioNuevoNoIGV,
									'itemsVendidos.$.totalPrice': totalPrecioNuevo,
									'itemsVendidos.$.cantidadSC': ventaActiva.itemsVendidos[itemExiste].cantidadSC,
								},
							},
					 	{ useFindAndModify: false, new: true });
					}

				}
				else {
					const precioTotal = req.body.cantidad * item.priceIGV;
					const precioTotalNoIGV = req.body.cantidad * item.priceNoIGV;

					const constPrecioTotalVenta =
					(ventaActiva.totalPrice - ventaActiva.itemsVendidos[itemExiste].totalPrice) + precioTotal;
					const constPrecioTotalVentaNoIGV =
					(ventaActiva.totalPriceNoIGV - ventaActiva.itemsVendidos[itemExiste].totalPriceNoIGV) + precioTotalNoIGV;

					req.ventaGenerada = await Venta.findOneAndUpdate({ codigo: user.carrito, 'itemsVendidos.codigo': item.codigo },
						{
							totalPrice: constPrecioTotalVenta, totalPriceNoIGV:  constPrecioTotalVentaNoIGV,
							$set: {
								'itemsVendidos.$.priceIGV': item.priceIGV,
								'itemsVendidos.$.priceNoIGV': item.priceNoIGV,
								'itemsVendidos.$.priceCosto': item.costoPropio,
								'itemsVendidos.$.cantidad': req.body.cantidad,
								'itemsVendidos.$.totalPriceNoIGV': precioTotalNoIGV,
								'itemsVendidos.$.totalPrice': precioTotal },
						},
					 { useFindAndModify: false, new: true });
				}

			}
		}

		await session.commitTransaction();
		session.endSession();
		return res.json(req.ventaGenerada);
	}
	catch (error) {
		await session.abortTransaction();
		session.endSession();
		return res.status(500).json({ errorMSG: error });
	}
};

const generarCodigo = async () => {
	try {
		const count = await Venta.countDocuments({ }) + 1;
		let preCod = 'SD01-000000';
		for (let index = 0; index < count.toString().length; index++) {
			preCod = preCod.slice(0, -1);
		}
		const codigo = preCod + count.toString();
		return codigo;
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const comprobarCarrito = async (req, res, next) => {
	try {
		const item = await Item.findOne({ codigo: req.body.codigo });

		let inOrder;

		if (item.subConteo) {
			if (item.subConteo.nameSecond !== '') {
				inOrder = item.subConteo.order
					.find(o => o.name === req.body.orderToAdd.name &&
              o.nameSecond === req.body.orderToAdd.nameSecond);
			}
			else {
				inOrder = item.subConteo.order.find(o => o.name === req.body.orderToAdd.name);
			}
		}


		if (item.deleted) {
			await session.abortTransaction();
			session.endSession();
			return res.status(410).json({ errorMSG: 'El item ha sido elminado' });
		}
		else if (item.priceIGV !== req.body.priceIGV) {
			return res.status(409).json({ errorMSG: 'El precio del producto ha cambiado' });
		}
		else if (item.cantidad < req.body.cantidad) {
			return res.status(409).json({ errorMSG: 'Ya no contamos con la cantidad deseada' });
		}
		else if (item.subConteo) {
			if (inOrder.cantidad < req.body.cantidad) {
			    return res.status(409).json({ errorMSG: 'Ya no contamos con la cantidad deseada' });
			}
		}

		next();
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};

export const getCarrito = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.user.aud.split(' ')[0] });
		const carrito = await Venta.aggregate([
			{ $match: { codigo: user.carrito } },
			{ $unwind: '$itemsVendidos' },
			{ $replaceRoot: { newRoot: '$itemsVendidos' } },
			{ $unwind: { path: '$cantidadSC', preserveNullAndEmptyArrays: true } },
		]);
		res.json(carrito);
	}
	catch (error) {
		return res.status(500).json({ errorMSG: error });
	}
};