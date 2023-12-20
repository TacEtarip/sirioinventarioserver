import { Schema } from "mongoose";

const GuiaSchema = new Schema({
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
});

export default GuiaSchema;