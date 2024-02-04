import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import tinyfy from "tinify";
import config from "../../config/index";
import { createDocumento } from "../lib/documentGenerator";
const sharp = require("sharp");

const s3 = new S3Client({
  credentials: {
    accessKeyId: config[process.env.NODE_ENV].awsID,
    secretAccessKey: config[process.env.NODE_ENV].awsKey,
  },
  region: "us-east-1",
});

export const createPdfFromSale = async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: "sirio-logo.png",
    });
    const data = await s3.send(command);

    const streamToBuffer = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });

    const bufferedImage = await streamToBuffer(data.Body);

    const venta = res.locals.venta;

    const doc = createDocumento(venta, bufferedImage);

    const pdfBuffer = await new Promise((resolve, reject) => {
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on("error", reject);
      doc.end();
    });

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=venta.pdf", // Changed to 'inline'
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer, "binary");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const uploadPDFventa = async (venta) => {
  try {
    const command = new GetObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: "sirio-logo.png",
    });
    const data = await s3.send(command);

    const streamToBuffer = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });

    const bufferedImage = await streamToBuffer(data.Body);

    const doc = createDocumento(venta, bufferedImage);

    const pdfBuffer = await new Promise((resolve, reject) => {
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on("error", reject);
      doc.end();
    });

    const uploadCommand = new PutObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: `${venta.codigo}.pdf`,
      Body: pdfBuffer,
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

    const streamToBuffer = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });

    const data = await s3.send(command);

    const bufferedImage = await streamToBuffer(data.Body);

    const sharpedImage = await sharp(bufferedImage)
      .webp({ quality: 50 })
      .toBuffer();

    res.writeHead(200, { "Content-Type": "image/webp" });
    res.write(sharpedImage, "binary");
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
    const { Body } = await s3.send(command);

    res.writeHead(200, { "Content-Type": "application/pdf" });
    Body.pipe(res);
  } catch (error) {
    console.error(error); // Make sure to log the error for debugging.
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving the PDF." });
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
      cb(new Error("Por favor suba imágenes JPG y PNG!"));
    }
    if (file.size > 2000000) {
      cb(new Error("Tamaño Excedido!"));
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
      cb(new Error("Por favor suba imágenes JPG y PNG!"));
    }
    if (file.size > 2000000) {
      cb(new Error("Tamaño Excedido!"));
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
      cb(new Error("Por favor suba un archivo PDF!"));
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

    const streamToBuffer = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });

    const data = await s3.send(command);

    const bufferedImage = await streamToBuffer(data.Body);

    const sharpedImage = await sharp(bufferedImage)
      .webp({ quality: 50 })
      .toBuffer();

    const uploadCommand = new PutObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: `${fileNN[0]}.webp`,
      Body: sharpedImage,
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
      .json({ message: "Ocurrió un error inesperado. Inténtelo de nuevo" });
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

    const streamToBuffer = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });

    const data = await s3.send(command);

    const bufferedImage = await streamToBuffer(data.Body);

    const sharpedImage = await sharp(bufferedImage)
      .webp({ quality: 50 })
      .toBuffer();

    const uploadCommand = new PutObjectCommand({
      Bucket: config[process.env.NODE_ENV].bucket,
      Key: `STI_${req.params.codigo}_${req.params.subCat}.webp`,
      Body: sharpedImage,
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
      .json({ message: "Ocurrió un error inesperado. Inténtelo de nuevo" });
  }
};
