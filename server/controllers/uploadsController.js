import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import tinyfy from 'tinify';
import imagemin from 'imagemin';
import webp from 'imagemin-webp';

import { createDocumento } from '../lib/documentGenerator';
import config from '../../config/index';


/*aws.config.update({
  secretAccessKey: config.develoment.awsKey,
  accessKeyId: config.develoment.awsID,
  region: 'us-east-1',
});*/

const s3 = new aws.S3({
  accessKeyId: config[process.env.NODE_ENV].awsID,
  secretAccessKey: config[process.env.NODE_ENV].awsKey,
  Bucket: config[process.env.NODE_ENV].bucket, 
  region: 'us-east-1'
});

// s3.config.region = 'us-east-1';

/*const storageImages = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './server/uploads/images');
    }, 
    filename: (req, file, cb) => {
      const extension = file.originalname.split('.')[1];
      cb(null, file.fieldname + '-' + req.params.codigo + '.' + extension);
    }
  });*/

export const uploadPDFventa = async (venta) => {
  try {
    const data = await s3.getObject({Bucket: config[process.env.NODE_ENV].bucket, Key: 'sirio-logo.png'}).promise();
    const doc = createDocumento(venta, data.Body);
    doc.end();
    await s3.upload({Bucket: config[process.env.NODE_ENV].bucket, Key: `${venta.codigo}.pdf`, Body: doc, ContentType: 'application/pdf'}).promise();
  } catch (error) {
    config[process.env.NODE_ENV].log().error(error);
    return error;
  }
};

export const getImage = async (req, res) => {
    try {
      const data = await s3.getObject({Bucket: config[process.env.NODE_ENV].bucket, Key: req.params.imgName}).promise();
      const dataIMGMIN = await imagemin.buffer(data.Body, {
        plugins: [
          webp({quality: 50})
        ]
      });
      res.writeHead(200, {'Content-Type': 'image/webp'});
      res.write(dataIMGMIN, 'binary');
      res.end(null, 'binary');
      // res.end(new Buffer.from(data.Body));
    } catch (error) {
      return res.status(500).json({message: error});
    }
  };

  export const deleteImage = async (req, res, next) => {
    try {
      if (req.body.oldPhoto !== 'noPhoto.jpg') {
        await s3.deleteObject({Bucket: config[process.env.NODE_ENV].bucket, Key: req.body.oldPhoto}).promise();
        const arrayPhoto = req.body.oldPhoto.split('.');
        await s3.deleteObject({Bucket: config[process.env.NODE_ENV].bucket, Key: `${arrayPhoto[0]}.webp`}).promise();
      }
      next();
    } catch (error) {
      return res.status(500).json({message: error});
    }
  };

  export const deleteImageSecond = async (req, res, next) => {
    try {
      if (req.photNameToDelete !== 'noPhoto.jpg') {
        await s3.deleteObject({Bucket: config[process.env.NODE_ENV].bucket, Key: req.photNameToDelete}).promise();
      }
      res.json({message: 'Succes'});
    } catch (error) {
      return res.status(500).json({message: error});
    }
  };

  export const getPDF = async (req, res) => {
    try {
      const data = await s3.getObject({Bucket: config[process.env.NODE_ENV].bucket, Key: req.params.pdfName}).promise();
      res.writeHead(200, {'Content-Type': 'aplication/pdf'});
      res.write(data.Body, 'binary');
      res.end(null, 'binary');
    } catch (error) {
      return res.status(500).json({message: error});
    }
  };

  
  /*const storagePDF = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './server/uploads/files');
    }, 
    filename: (req, file, cb) => {
      cb(null,  'ficha-' + req.params.codigo + '.' + 'pdf');
    }
  });*/


  export const uploadImage = multer({
    storage: multerS3({
      s3: s3,
      bucket: config[process.env.NODE_ENV].bucket,
      metadata: (req, file, cb) => {
        cb(null, Object.assign({}, req.body));
      },
      key: (req, file, cb) => {
        const extension = file.originalname.split('.')[1];
        cb(null, file.fieldname + '-' + req.params.codigo + '-' + Date.now().toString() + '.' + extension);
      }
    }),
    limits: {
      fileSize: 1000000
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        cb(new Error('Please upload JPG and PNG images only!'));
      }
      if (file.size > 1000000) {
        cb(new Error('Please upload JPG and PNG images only!'));
      }
      cb(undefined, true);
    }
  });


  
export const uploadPDF = multer({
    storage: multerS3({
      s3: s3,
      bucket: config[process.env.NODE_ENV].bucket,
      metadata: (req, file, cb) => {
        cb(null, Object.assign({}, req.body));
      },
      key: (req, file, cb) => {
        cb(null,  'ficha-' + req.params.codigo + '.' + 'pdf');
      }
    }),
    limits: {
      fileSize: 1000000
    }, 
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(pdf)$/)) {
        cb(new Error('Please upload PDF only!'));
      }
      cb(undefined, true);
    }
  });

export const upload = (req, res, next) => {
    const file = req.file;
    tinyfy.fromFile(file.path).toFile(file.path)
          .catch(error => {
            return next(error);
          });
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
};

export const fichaUpload = (req, res, next) => {
  const file = req.file;
  if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
  }
  req.uploadInfo = {
    statusCode: 200,
    status: 'success',
    uploadedFile: file
  };
  next();
};

export const imageUpload = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }

    const fileNN = file.key.split('.');
    const data = await s3.getObject({Bucket: config[process.env.NODE_ENV].bucket, Key: file.key}).promise();
    const dataIMGMIN = await imagemin.buffer(data.Body, {
      plugins: [
        webp({quality: 50})
      ]
    });

    await s3.upload({
      Key: `${fileNN[0]}.webp`,
      CacheControl: 'max-age=604800',
      ACL: 'public-read',
      ContentType: 'image/webp',
      Body: dataIMGMIN,
      Bucket: config[process.env.NODE_ENV].bucket
    }).promise();


    req.fileName = file.key;
    req.uploadInfo = {
      statusCode: 200,
      status: 'success',
      uploadedFile: file
    };
    next();

  } catch (error) {
    return res.status(500).json({message: 'Ocurrio un error inesperado. Intentelo denuevo'});
  }
  
};

