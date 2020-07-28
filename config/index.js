require('dotenv').config();

import bunyan from 'bunyan';

import pjs from '../package.json';

const { name, version } = pjs;

const getLogger = (serviceName, serviceVersion, level) => bunyan.createLogger({ name: `${serviceName}:${serviceVersion}`, level });

const config = {
    development: {
        PORT: process.env.PORT,
        mongoKey: process.env.MONGO_KEY_TESTS,
        tinyKey: process.env.TINY_KEY,
        jwtKey: process.env.JWT_KEY,
        awsID: process.env.AWS_ID,
        awsKey: process.env.AWS_KEY,
        bucket: process.env.S3_BUCKET_TEST,
        sunatToken: process.env.SUNAT_TOKEN,
        log: () => getLogger(name, version, 'debug'),
    },

    production: {
        PORT: process.env.PORT,
        mongoKey: process.env.MONGO_KEY,
        tinyKey: process.env.TINY_KEY,
        jwtKey: process.env.JWT_KEY,
        awsID: process.env.AWS_ID,
        awsKey: process.env.AWS_KEY,
        bucket: process.env.S3_BUCKET,
        sunatToken: process.env.SUNAT_TOKEN,
        log: () => getLogger(name, version, 'debug'),
    }
};

export default config;