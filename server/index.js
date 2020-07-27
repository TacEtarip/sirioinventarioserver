import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import tinyfy from 'tinify';
import jwt from 'jsonwebtoken';
import aws from 'aws-sdk';

import inventarioRoutes from './routes/inventarioRoutes';
import authRoutes from './routes/authRoutes';
import ventasRoutes from './routes/ventaRoutes';

import connectDB from './lib/mongoConnection';
import config from '../config/index';

import { createDocumento } from './lib/documentGenerator';

tinyfy.key = config.develoment.tinyKey;

const app = express();

const log = config.develoment.log();

const bucketName = config.develoment.bucket;

// aws.config.region = 'us-east-1';


app.use(helmet());
app.use(compression());

app.options('*', cors({credentials: true, origin: true}));
app.use(cors({credentials: true, origin: true}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

connectDB(config.develoment.mongoKey);

/*
app.get('/test', (req, res) => {
  let doc = new PDFdocument();

  res.writeHead(200, {'Content-Type': 'aplication/pdf', 'Content-disposition': 'attachment;filename=testd.pdf'});
  doc.pipe(res);

  createDocumento();

  doc.save()
  .moveTo(100, 150)
  .lineTo(100, 250)
  .lineTo(200, 250)
  .fill("#FF3300");

  doc.end();
});*/

app.use((req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
      jwt.verify(req.headers.authorization.split(' ')[1], config.develoment.jwtKey, (err, decode) => {
          if (err) req.user = undefined;
          req.user = decode;
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

app.use('/static', express.static(path.join(__dirname, 'uploads')));



app.use((error, req, res, next) => {
    res.status(error.status || 500);
    log.error(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });

export default app;