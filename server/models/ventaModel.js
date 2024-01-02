import { Schema } from "mongoose";
import { DocumentoSchema, ItemVendidoSchema } from "./communModels";

export const Credits = new Schema(
  {
    cuota: {
      type: Number,
      required: true,
    },
    fecha_de_pago: {
      type: String,
      required: true,
    },
    importe: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

export const Guides = new Schema(
  {
    serie: {
      type: String,
      required: true,
    },
    numero: {
      type: Number,
      required: true,
    },
    tipoComprobante: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

export const ContractPayments = new Schema(
  {
    cuota: {
      type: Number,
      required: true,
    },
    fecha_de_pago: {
      type: String,
      required: true,
    },
    importe: {
      type: Number,
      required: true,
    },
    pagado: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const VentaSchema = new Schema({
  codigo: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  tipoVenta: {
    type: String, // can be 'venta' or 'contrato'
    required: true,
    trim: true,
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

  date: {
    type: Date,
    default: Date.now,
  },

  vendedor: {
    type: String,
  },

  tipoVendedor: {
    type: String,
    default: "admin",
  },

  medio_de_pago: {
    type: String,
  },

  fechaDeVencimiento: {
    type: String,
  },

  linkComprobanteAnulado: {
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

  guias: {
    type: [Guides],
    default: [],
  },

  carrito_venta: {
    type: Boolean,
    default: false,
  },

  estado_carrito_comprando: {
    type: Boolean,
    default: false,
  },

  credits: {
    type: [Credits],
    default: [],
  },

  contratoAprobado: {
    type: Boolean,
    default: false,
  },

  pagosDeContrato: {
    type: [ContractPayments],
    default: [],
  },
});

export default VentaSchema;
