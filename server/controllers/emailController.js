import nodemailer from 'nodemailer';
import { promisify } from 'util';
import { readFile } from 'fs'; 
import  path from 'path';

import config from '../../config/index';

const configEnv = config[process.env.NODE_ENV];
const readFilePromise = promisify(readFile);

const mailTransporter = nodemailer.createTransport({
    host: configEnv.BHOST,
    port: configEnv.BPORT,
    secure: false,
    auth:{
        user: configEnv.BUSER,
        pass: configEnv.BPASS,
    },
});

export const sendTestEmail = async (req, res) => {
    try {
        const html = await readFilePromise(path.resolve(__dirname, '../lib/email.html'), {encoding: 'utf8'});
        const result = await mailTransporter.sendMail({
            from: 'siriodinar-no-replay@siriodinar.com',
            to: 'hu3rtas@outlook.com',
            subject: 'Confimar registro de cuenta en Sirio Dinar',
            html
        });   
        res.json({emailresult: 'send'});
    } catch (error) {
        console.log(error);
        return res.status(500 || error.status).json({errorMSG: error});
    }

};

export const sendConfirmationEmail = async (req, res) => {
    try {
        const html = await readFilePromise(path.resolve('server/lib/email.html'), {encoding: 'utf8'});
        /* const html = await rif({
            files: path.resolve(__dirname, '../lib/email.html'),
            from: /foo/g,
            to: '<a style="width: 100%; font-size: 20px; text-align: center; margin-top: 0.67em" href="www.google.com" target="_blank">Click</a>',
        });*/
        req.savedUSer.hashPassword = undefined;
        const link = `${configEnv.link}auth/confirmacion/${req.savedUSer._id}`;
        const htmlReplaced = html.replace('#replaceWithLink',
        `<a style="width: 400px; font-size: 20px; text-align: center; margin-top: 0.67em" href="${link}" target="_blank">${link}</a>`);

        await mailTransporter.sendMail({
            from: 'siriodinar-no-replay@siriodinar.com',
            to: req.savedUSer.email,
            subject: 'Confimar registro de cuenta en Sirio Dinar',
            html: htmlReplaced
        });   
        res.json(req.savedUSer);
    } catch (error) {
        return res.status(500 || error.status).json({ link: false });
    }

};