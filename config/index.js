require('dotenv').config();

import bunyan from 'bunyan';

import pjs from '../package.json';

const { name, version } = pjs;

const getLogger = (serviceName, serviceVersion, level) => bunyan.createLogger({ name: `${serviceName}:${serviceVersion}`, level });

const config = {
    development: {
        PORT: process.env.PORT,
        mongoKey: process.env.MONGO_KEY,
        tinyKey: process.env.TINY_KEY,
        jwtKey: process.env.JWT_KEY,
        jwtLogin: process.env.JWT_LOGIN,
        jwtGoogleLogin: process.env.JWT_GOOGLE_LOGIN,
        awsID: process.env.AWS_ID,
        awsKey: process.env.AWS_KEY,
        bucket: process.env.S3_BUCKET,
        sunatToken: process.env.SUNAT_TOKEN,
        googleClientID: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callBackUrl: process.env.CALLBACK_URL_TEST,
        BHOST: process.env.HOST_SENDIBLUE,
        BPORT: process.env.PORT_SENDIBLUE,
        BUSER: process.env.USER_SENDIBLUE,
        BPASS: process.env.PASSWORD_SENDIBLUE,
        nbfToken: process.env.NBF_TOKEN,
        emailFrom: 'loginmanager@siriodinar.com',
        link: 'http://localhost:5000/',
        link_front: 'http://localhost:4000/',
        origin: ['http://localhost:4200', 'http://localhost:4000'],
        log: () => getLogger(name, version, 'debug'),
    },

    production: {
        PORT: process.env.PORT,
        mongoKey: process.env.MONGO_KEY,
        tinyKey: process.env.TINY_KEY,
        jwtKey: process.env.JWT_KEY,
        jwtLogin: process.env.JWT_LOGIN,
        jwtGoogleLogin: process.env.JWT_GOOGLE_LOGIN,
        awsID: process.env.AWS_ID,
        awsKey: process.env.AWS_KEY,
        bucket: process.env.S3_BUCKET,
        sunatToken: process.env.SUNAT_TOKEN,
        googleClientID: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callBackUrl: process.env.CALLBACK_URL,
        BHOST: process.env.HOST_SENDIBLUE,
        BPORT: process.env.PORT_SENDIBLUE,
        BUSER: process.env.USER_SENDIBLUE,
        BPASS: process.env.PASSWORD_SENDIBLUE,
        nbfToken: process.env.NBF_TOKEN,
        emailFrom: 'loginmanager@siriodinar.com',
        link: 'https://inventario-sirio-dinar.herokuapp.com/',
        link_front: 'https://inventario.siriodinar.com/',
        origin: ['https://inventario.siriodinar.com', 'https://sirio-inventario-front.herokuapp.com'],
        log: () => getLogger(name, version, 'debug'),
    }
};

export default config;