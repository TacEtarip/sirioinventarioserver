import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import tinyfy from 'tinify';
import jwt from 'jsonwebtoken';

import inventarioRoutes from './routes/inventarioRoutes';
import authRoutes from './routes/authRoutes';
import ventasRoutes from './routes/ventaRoutes';

import connectDB from './lib/mongoConnection';
import config from '../config/index';

tinyfy.key = config.develoment.tinyKey;

const app = express();

const log = config.develoment.log();
/*
const storageImages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './server/uploads/images');
  }, 
  filename: (req, file, cb) => {
    const extension = file.originalname.split('.')[1];
    cb(null, file.fieldname + '-' + req.params.codigo + '.' + extension);
  }
});

const storagePDF = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './server/uploads/files');
  }, 
  filename: (req, file, cb) => {
    cb(null,  'ficha-' + req.params.codigo + '.' + 'pdf');
  }
});

const uploadImage = multer({
  storage: storageImages,
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('Please upload JPG and PNG images only!'));
    }
    cb(undefined, true);
  }
});

const uploadPDF = multer({
  storage: storagePDF,
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf)$/)) {
      cb(new Error('Please upload PDF only!'));
    }
    cb(undefined, true);
  }
});*/

app.use(helmet());
app.use(compression());

app.options('*', cors({credentials: true, origin: true}));
app.use(cors({credentials: true, origin: true}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

connectDB(config.develoment.mongoKey);


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

/*
app.post('/uploads/image/:codigo', uploadImage.single('img'), (req, res, next) => {
    const file = req.file;
    console.log(file);
    console.log(file.path);
    tinyfy.fromFile(file.path).toFile(file.path);
    if (!file) {
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        return next(error);
    }
    res.status(200).send({
        statusCode: 200,
        status: 'success',
        uploadedFile: file
    });
});

app.post('/uploads/ficha/:codigo', uploadPDF.single('pdf'), (req, res, next) => {
  const file = req.file;
  console.log(file);
  console.log(file.path);
  if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
  }
  res.status(200).send({
      statusCode: 200,
      status: 'success',
      uploadedFile: file
  });
});
*/
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