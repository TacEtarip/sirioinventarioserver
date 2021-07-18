import { Schema } from 'mongoose';
import { ItemVendidoSchema, DocumentoSchema } from './communModels';

const VentaSchema = new Schema ({

	codigo: {
		type: String,
		required: true,
		trim: true,
		unique: true,
	},

	totalPrice: {
		type: Number,
		trim: true,
		required: true,
	},

	totalPriceNoIGV: {
		type: Number,
		trim: true,
		required: true,
	},

	estado: {
		type: String,
		trim: true,
		required: true,
	},

	documento: {
		type: DocumentoSchema,
	},

	itemsVendidos: {
		type: [ItemVendidoSchema],
		required: true,
	},

	date:{
		type: Date,
		default: Date.now,
	},

	vendedor: {
		type: String,
	},

	tipoVendedor: {
		type: String,
		default: 'admin',
	},

	medio_de_pago: {
		type: String,
	},

	linkComprobante: {
		type: String,
	},

	serie: {
		type: String,
	},

	tipoComprobante: {
		type: String,
	},

	numero: {
		type: Number,
	},

	cliente_email: {
		type: String,
	},

	guia_serie: {
		type: String,
	},

	guia_numero: {
		type: String,
	},

	guia: {
		type: Boolean,
		default: false,
	},

	guia_link: {
		type: String,
	},

	carrito_venta: {
		type: Boolean,
		default: false,
	},

});

export default VentaSchema;

