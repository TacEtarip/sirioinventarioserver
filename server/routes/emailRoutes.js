import express from 'express';
import { sendTestEmail } from '../controllers/emailController';

const emailrouter = express.Router();

emailrouter.get('/testSend', sendTestEmail);

export default emailrouter;