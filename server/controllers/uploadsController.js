import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
// import imagemin from "imagemin";
// import imageminWebp from "imagemin-webp";
import multer from "multer";
import multerS3 from "multer-s3";
import tinyfy from "tinify";
import config from "../../config/index";
import { createDocumento } from "../lib/documentGenerator";

const s3 = new S3Client({
  credentials: {
    accessKeyId: config[process.env.NODE_ENV].awsID,
    secretAccessKey: config[process.env.NODE_ENV].awsKey,
  },
  region: "us-east-1",
});

export const uploadPDFventa = async (venta) => {
  try {
    const command = new GetObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: "sirio-logo.png",
    });
    const data = await s3.send(command);
    const doc = createDocumento(venta, data.Body);
    doc.end();
    const uploadCommand = new PutObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: `${venta.codigo}.pdf`,
      Body: doc,
      ContentType: "application/pdf",
    });
    await s3.send(uploadCommand);
  } catch (error) {
    config[process.env.NODE_ENV].log().error(error);
    return error;
  }
};

export const getImage = async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: req.params.imgName,
    });
    const data = await s3.send(command);
    const imagemin = (await import("imagemin")).default;
    const imageminWebp = (await import("imagemin-webp")).default;
    const dataIMGMIN = await imagemin.buffer(data.Body, {
      plugins: [imageminWebp({ quality: 50 })],
    });
    res.writeHead(200, { "Content-Type": "image/webp" });
    res.write(dataIMGMIN, "binary");
    res.end(null, "binary");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    if (req.body.oldPhoto !== "noPhoto.jpg") {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config[process.env.NODE_ENV].bucket,
        Key: req.body.oldPhoto,
      });
      await s3.send(deleteCommand);
      const arrayPhoto = req.body.oldPhoto.split(".");
      const deleteCommandSecond = new DeleteObjectCommand({
        Bucket: config[process.env.NODE_ENV].bucket,
        Key: `${arrayPhoto[0]}.webp`,
      });
      await s3.send(deleteCommandSecond);
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const deleteImageSecond = async (req, res, next) => {
  try {
    if (req.photNameToDelete !== "noPhoto.jpg") {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config[process.env.NODE_ENV].bucket,
        Key: req.photNameToDelete,
      });
      await s3.send(deleteCommand);
    }
    res.json(req.result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getPDF = async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: req.params.pdfName,
    });
    const data = await s3.send(command);
    res.writeHead(200, { "Content-Type": "aplication/pdf" });
    res.write(data.Body, "binary");
    res.end(null, "binary");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const uploadImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: config[process.env.NODE_ENV].bucket,
    metadata: (req, file, cb) => {
      cb(null, { ...req.body });
    },
    key: (req, file, cb) => {
      const extension = file.originalname.split(".")[1];
      cb(null, "IMG" + "-" + Date.now().toString() + "." + extension);
    },
  }),
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload JPG and PNG images only!"));
    }
    if (file.size > 2000000) {
      cb(new Error("Tamaño Exedido!"));
    }
    cb(undefined, true);
  },
});

export const minitest = (req, res, next) => {
  try {
    next();
  } catch (error) {}
};

export const uploadImageSubCat = multer({
  storage: multerS3({
    s3: s3,
    bucket: config[process.env.NODE_ENV].bucket,
    metadata: (req, file, cb) => {
      cb(null, { ...req.body });
    },
    key: (req, file, cb) => {
      const extension = file.originalname.split(".")[1];
      cb(
        null,
        `STI_${req.params.codigo}_${req.params.subCat}`,
        "." + extension
      );
    },
  }),
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload JPG and PNG images only!"));
    }
    if (file.size > 2000000) {
      cb(new Error("Tamaño Exedido!"));
    }
    cb(undefined, true);
  },
});

export const uploadPDF = multer({
  storage: multerS3({
    s3: s3,
    bucket: config[process.env.NODE_ENV].bucket,
    metadata: (req, file, cb) => {
      cb(null, { ...req.body });
    },
    key: (req, file, cb) => {
      cb(null, "ficha-" + req.params.codigo + "." + "pdf");
    },
  }),
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf)$/)) {
      cb(new Error("Please upload PDF only!"));
    }
    cb(undefined, true);
  },
});

export const upload = (req, res, next) => {
  const file = req.file;
  tinyfy
    .fromFile(file.path)
    .toFile(file.path)
    .catch((error) => {
      return next(error);
    });
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.status(200).send({
    statusCode: 200,
    status: "success",
    uploadedFile: file,
  });
};

export const fichaUpload = (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  req.uploadInfo = {
    statusCode: 200,
    status: "success",
    uploadedFile: file,
  };
  next();
};

export const imageUpload = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    }

    const fileNN = file.key.split(".");
    const command = new GetObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: file.key,
    });
    const data = await s3.send(command);
    const imagemin = (await import("imagemin")).default;
    const imageminWebp = (await import("imagemin-webp")).default;
    const dataIMGMIN = await imagemin.buffer(data.Body, {
      plugins: [imageminWebp({ quality: 50 })],
    });

    const uploadCommand = new PutObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: `${fileNN[0]}.webp`,
      Body: dataIMGMIN,
      ACL: "public-read",
      CacheControl: "max-age=604800",
      ContentType: "image/webp",
    });

    await s3.send(uploadCommand);

    req.fileName = file.key;
    req.uploadInfo = {
      statusCode: 200,
      status: "success",
      uploadedFile: file,
    };
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const imageUploadSC = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    }

    const command = new GetObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: file.key,
    });
    const data = await s3.send(command);

    const imagemin = (await import("imagemin")).default;
    const imageminWebp = (await import("imagemin-webp")).default;

    const dataIMGMIN = await imagemin.buffer(data.Body, {
      plugins: [imageminWebp({ quality: 50 })],
    });

    const uploadCommand = new PutObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: `STI_${req.params.codigo}_${req.params.subCat}.webp`,
      Body: dataIMGMIN,
      ACL: "public-read",
      CacheControl: "max-age=604800",
      ContentType: "image/webp",
    });

    await s3.send(uploadCommand);

    req.fileName = file.key;
    req.uploadInfo = {
      statusCode: 200,
      status: "success",
      uploadedFile: file,
    };

    res.status(200).json(req.uploadInfo);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};
