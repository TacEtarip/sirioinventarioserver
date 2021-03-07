import path from 'path';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import tinyfy from 'tinify';
import jwt from 'jsonwebtoken';

import inventarioRoutes from './routes/inventarioRoutes';
import authRoutes from './routes/authRoutes';
import ventasRoutes from './routes/ventaRoutes';
import cotiRoutes from './routes/cotiRoutes';
import emailrouter from './routes/emailRoutes';
import cookieParser from 'cookie-parser';

import config from '../config/index';


tinyfy.key = config[process.env.NODE_ENV].tinyKey;

const app = express();

const log = config[process.env.NODE_ENV].log();

app.use(helmet());
app.use(compression());
app.use(cookieParser());

app.options('*', cors({credentials: true, origin: config[process.env.NODE_ENV].origin }));
app.use(cors({credentials: true, origin: config[process.env.NODE_ENV].origin }));

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use((req, res, next) => {
  console.log(req.cookies);
  if (req.cookies && req.cookies.jwt_token && req.cookies.usuario_tipo && req.cookies.usuario_user) {
      const auth = req.headers.authorization;
      jwt.verify(req.cookies.jwt_token, config[process.env.NODE_ENV].jwtKey, 
      { audience: req.cookies.usuario_user + ' ' + req.cookies.usuario_tipo },(err, decode) => {
          if ( err ) {
            req.user = undefined;
          } else { 
            req.user = decode; 
          }
          next(); 
      });
  } else {
      req.user = undefined;
      next();
  }
});


app.use('/inventario', inventarioRoutes);
app.use('/auth', authRoutes);
app.use('/ventas', ventasRoutes);
app.use('/email', emailrouter);
app.use('/coti', cotiRoutes);

app.use('/static', express.static(path.join(__dirname, 'uploads')));

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    log.error(error);
    log.info(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });

export default app;