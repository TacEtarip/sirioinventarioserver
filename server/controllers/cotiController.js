import aws from "aws-sdk";
import mongoose from "mongoose";
import config from "../../config/index";
import { createExcelCoti } from "../lib/createExelCoti";
import { createDocument } from "../lib/createPDFcoti";
import cotiModel from "../models/cotiModel";

const Cotizacion = mongoose.model("Cotizacion", cotiModel);

const s3 = new aws.S3({
  accessKeyId: config[process.env.NODE_ENV].awsID,
  secretAccessKey: config[process.env.NODE_ENV].awsKey,
  Bucket: config[process.env.NODE_ENV].bucket,
  region: "us-east-1",
});

export const crearCotizacion = async (req, res) => {
  try {
    req.body.venta._id = undefined;
    req.body.venta.codigo = undefined;
    const newCoti = new Cotizacion(req.body.venta);
    newCoti.codigo = await generarCodigoCoti();
    newCoti.celular_cliente = tranformarTelefono(
      req.body.venta.celular_cliente
    );
    const saveResult = await newCoti.save();
    res.json({
      message: `Cotización generada con el codigo: ${saveResult.codigo}`,
      coti: saveResult,
    });
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

export const getCotis = async (req, res) => {
  try {
    let result;
    if (req.body.dateOne === "noone" || req.body.dateTwo === "noone") {
      result = await Cotizacion.find({ estado: req.body.estado })
        .skip(parseInt(req.body.skip))
        .limit(parseInt(req.body.limit));
    } else {
      result = await Cotizacion.find({
        estado: req.body.estado,
        date: {
          $gte: new Date(req.body.dateOne),
          $lt: new Date(req.body.dateTwo),
        },
      })
        .skip(parseInt(req.body.skip))
        .limit(parseInt(req.body.limit));
    }
    res.json(result);
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

const generarCodigoCoti = async () => {
  try {
    const count = (await Cotizacion.countDocuments({})) + 1;
    let preCod = "COTSD01-000000";
    for (let index = 0; index < count.toString().length; index++) {
      preCod = preCod.slice(0, -1);
    }
    const codigo = preCod + count.toString();
    return codigo;
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

const tranformarTelefono = (celular = "") => {
  let newPhone = celular.split(" ").join("");
  if (!celular.startsWith("+")) {
    newPhone = "+51" + celular.split(" ").join("");
  }
  return newPhone;
};

export const getCoti = async (req, res) => {
  try {
    const result = await Cotizacion.findOne({ codigo: req.params.cotiCod });
    res.json(result);
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

export const getCotiInfoForCard = async (req, res) => {
  try {
    const result = await Cotizacion.aggregate([
      { $match: { codigo: req.body.codCoti } },
      { $unwind: "$itemsVendidos" },
      { $replaceRoot: { newRoot: "$itemsVendidos" } },
      { $unwind: { path: "$cantidadSC", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { "cantidadSC.cantidadVenta": { $gt: 0 } },
            { cantidadSC: null },
          ],
        },
      },
    ]);
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const agregarItemCoti = async (req, res) => {
  try {
    const preInfo = await Cotizacion.aggregate([
      { $match: { codigo: req.body.codigoCoti } },
      { $unwind: "$itemsVendidos" },
      { $replaceRoot: { newRoot: "$itemsVendidos" } },
      { $match: { codigo: req.body.itemVendido.codigo } },
      { $count: "thisItem" },
    ]);

    if (preInfo.length !== 0) {
      // const oldSale = await Venta.findOne({codigo: req.body.codigoVenta, itemsVendidos: {$elemMatch: {codigo: req.body.itemVendido.codigo}}});
      const oldSale = await Cotizacion.aggregate([
        { $match: { codigo: req.body.codigoCoti } },
        { $unwind: "$itemsVendidos" },
        { $replaceRoot: { newRoot: "$itemsVendidos" } },
        { $match: { codigo: req.body.itemVendido.codigo } },
      ]);

      const newConst =
        (Math.round(
          (oldSale[0].totalPrice -
            req.body.itemVendido.totalPrice +
            Number.EPSILON) *
            100
        ) /
          100) *
        -1;

      const newConstNOIGV =
        (Math.round(
          (oldSale[0].totalPriceNoIGV -
            req.body.itemVendido.totalPriceNoIGV +
            Number.EPSILON) *
            100
        ) /
          100) *
        -1;

      const ventaAct = await Cotizacion.findOneAndUpdate(
        {
          codigo: req.body.codigoCoti,
          itemsVendidos: {
            $elemMatch: { codigo: req.body.itemVendido.codigo },
          },
        },
        {
          $set: { "itemsVendidos.$": req.body.itemVendido },
          $inc: { totalPrice: newConst, totalPriceNoIGV: newConstNOIGV },
        },
        { useFindAndModify: false, new: true }
      );
      return res.json({ message: "Cantidades actualizadas", coti: ventaAct });
    }
    const ventaActT = await Cotizacion.findOneAndUpdate(
      { codigo: req.body.codigoCoti },
      {
        $push: { itemsVendidos: req.body.itemVendido },
        $inc: {
          totalPrice: req.body.itemVendido.totalPrice,
          totalPriceNoIGV: req.body.itemVendido.totalPriceNoIGV,
        },
      },
      { useFindAndModify: false, new: true }
    );
    res.json({ message: "Item agregado correctamente", coti: ventaActT });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const eliminarItemCoti = async (req, res) => {
  try {
    const result = await Cotizacion.findOneAndUpdate(
      { codigo: req.body.codigo },
      {
        $inc: {
          totalPrice: req.body.totalPrice * -1,
          totalPriceNoIGV: req.body.totalPriceNoIGV * -1,
        },
        $pull: { itemsVendidos: { codigo: req.body.codigoItem } },
      },
      { useFindAndModify: false, new: true }
    );
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const eliminarCoti = async (req, res) => {
  try {
    await Cotizacion.findOneAndUpdate(
      { codigo: req.body.codigo },
      { estado: "eliminada" }
    );
    res.json({ eliminada: true });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const clonarCoti = async (req, res) => {
  try {
    const newCoti = new Cotizacion(req.body.coti);
    newCoti.codigo = await generarCodigoCoti();
    newCoti.celular_cliente = tranformarTelefono(req.body.coti.celular_cliente);
    const saveResult = await newCoti.save();
    res.json({
      message: `Cotización generada con el codigo: ${saveResult.codigo}`,
      coti: saveResult,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const createExcel = async (req, res) => {
  try {
    const dataImg = await s3
      .getObject({
        Bucket: config[process.env.NODE_ENV].bucket,
        Key: "sirio-logo-small.png",
      })
      .promise();
    const coti = await Cotizacion.findOne({ codigo: req.body.codigo });
    const arrayBuffers = [];
    if (req.body.imagen) {
      for (let index = 0; index < coti.itemsVendidos.length; index++) {
        arrayBuffers.push(
          await s3
            .getObject({
              Bucket: config[process.env.NODE_ENV].bucket,
              Key: coti.itemsVendidos[index].photo,
            })
            .promise()
        );
      }
    }
    const buffer = await createExcelCoti(
      "Cotización",
      "Temp Coti",
      [
        "Nº",
        "IMAGÉN",
        "UNIDAD DE MEDIDA",
        "NOMBRE",
        "DESCRIPCIÓN",
        "CANTIDAD",
        "P/CU",
        "TOTAL",
      ],
      coti,
      dataImg.Body,
      req.body.extra,
      req.body.imagen,
      arrayBuffers
    );
    res.writeHead(200, {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${coti.codigo}.xlsx`,
    });
    res.write(buffer, "binary");
    res.end(null, "binary");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getPDFCotiTest = async (req, res) => {
  try {
    const coti = await Cotizacion.findOne({ codigo: req.body.codigo });
    const dataImg = await s3
      .getObject({
        Bucket: config[process.env.NODE_ENV].bucket,
        Key: "sirio-logo-small.png",
      })
      .promise();
    const arrayBuffers = [];
    if (req.body.imagen) {
      for (let index = 0; index < coti.itemsVendidos.length; index++) {
        arrayBuffers.push(
          await s3
            .getObject({
              Bucket: config[process.env.NODE_ENV].bucket,
              Key: coti.itemsVendidos[index].photo,
            })
            .promise()
        );
      }
    }
    const doc = createDocument(
      dataImg.Body,
      coti,
      req.body.extra,
      arrayBuffers,
      req.body.imagen
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=quote.pdf");
    doc.pipe(res);
    doc.end();
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
