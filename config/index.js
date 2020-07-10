require('dotenv').config();

import bunyan from 'bunyan';

import pjs from '../package.json';

const { name, version } = pjs;

const getLogger = (serviceName, serviceVersion, level) => bunyan.createLogger({ name: `${serviceName}:${serviceVersion}`, level });

const config = {
    develoment: {
        PORT: process.env.PORT,
        mongoKey: process.env.MONGO_KEY,
        tinyKey: process.env.TINY_KEY,
        jwtKey: process.env.JWT_KEY,
        log: () => getLogger(name, version, 'debug'),
    }
};

export default config;