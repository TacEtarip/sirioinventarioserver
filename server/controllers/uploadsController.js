import multer from 'multer';
import tinyfy from 'tinify';


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
  
  export const uploadImage = multer({
    storage: storageImages,
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
  tinyfy.fromFile(file.path).toFile(file.path)
          .catch(error => {
            return next(error);
          });
  if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
  }
  req.fileName = file.filename;
  req.uploadInfo = {
    statusCode: 200,
    status: 'success',
    uploadedFile: file
  };
  next();
};