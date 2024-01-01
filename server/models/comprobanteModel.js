import { Schema } from "mongoose";

const ComprobanteSchema = new Schema({
  tipoComprobante: {
    type: Number,
    required: true,
  },
  serie: {
    type: String,
    required: true,
  },
  numero: {
    type: Number,
    required: true,
  },
  ventaCod: {
    type: String,
  },
  linkComprobante: {
    type: String,
  },
});

export default ComprobanteSchema;