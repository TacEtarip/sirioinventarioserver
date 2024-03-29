import { Schema } from "mongoose";

export const CantidadOrderSC = new Schema(
  {
    name: { type: String },
    nameSecond: { type: String },
    cantidadDisponible: { type: Number },
    cantidadVenta: { type: Number },
  },
  { _id: false }
);

export const ItemVendidoSchema = new Schema(
  {
    codigo: {
      type: String,
      required: true,
      trim: true,
    },

    tipo: {
      type: String,
      trim: true,
      default: "producto",
    },

    name: {
      type: String,
      trim: true,
    },

    descripcion: {
      type: String,
      trim: true,
    },

    priceIGV: {
      type: Number,
      required: true,
      trim: true,
    },

    priceNoIGV: {
      type: Number,
      required: true,
      trim: true,
    },

    priceCosto: {
      type: Number,
      default: 0,
    },

    cantidad: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
    },

    cantidadSC: {
      type: [CantidadOrderSC],
      default: [],
    },

    totalPrice: {
      type: Number,
    },

    totalPriceNoIGV: {
      type: Number,
    },

    unidadDeMedida: {
      type: String,
    },

    photo: {
      type: String,
    },

    ventaCod: {
      type: String,
    },
  },
  { _id: false }
);

export const DocumentoSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    codigo: {
      type: Number,
      trim: true,
    },

    direccion: {
      type: String,
    },
  },
  { _id: false }
);
