import express from "express";
import {
  sendTestEmail,
  sendMensajeEmail,
} from "../controllers/emailController";

const emailrouter = express.Router();

// emailrouter.get('/testSend', sendTestEmail);

emailrouter.post("/enviarMensaje", sendMensajeEmail);

export default emailrouter;
