import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import tinyfy from 'tinify';

import config from '../../config/index';

/*aws.config.update({
  secretAccessKey: config.develoment.awsKey,
  accessKeyId: config.develoment.awsID,
  region: 'us-east-1',
});*/

const s3 = new aws.S3({
  accessKeyId: config.develoment.awsID,
  secretAccessKey: config.develoment.awsKey,
  Bucket: config.develoment.bucket,
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

  export const getImage = async (req, res) => {
    try {
      const data = await s3.getObject({Bucket: config.develoment.bucket, Key: req.params.imgName}).promise();
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      res.write(data.Body, 'binary');
      res.end(null, 'binary');
    } catch (error) {
      return res.status(500).json({message: error});
    }
  };

  export const getPDF = async (req, res) => {
    try {
      const data = await s3.getObject({Bucket: config.develoment.bucket, Key: req.params.pdfName}).promise();
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
      bucket: config.develoment.bucket,
      metadata: (req, file, cb) => {
        cb(null, Object.assign({}, req.body));
      },
      key: (req, file, cb) => {
        const extension = file.originalname.split('.')[1];
        cb(null, file.fieldname + '-' + req.params.codigo + '.' + extension);
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
      bucket: config.develoment.bucket,
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

export const imageUpload = (req, res, next) => {
  const file = req.file;
  /*tinyfy.fromFile(file.path).toFile(file.path)
          .catch(error => {
            return next(error);
          });*/
  if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
  }
  req.fileName = file.key;
  req.uploadInfo = {
    statusCode: 200,
    status: 'success',
    uploadedFile: file
  };
  next();
};