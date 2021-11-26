import mongoose from "mongoose";
import itemSchema from "../models/itemModel";
import { UserSchema } from "../models/userModel";
import ventaModel from "../models/ventaModel";

const Item = mongoose.model("Item", itemSchema);
const Venta = mongoose.model("Venta", ventaModel);
const User = mongoose.model("User", UserSchema);

const tipoDeAlertasGlobal = [
  { cod: 0, mensaje: "Item Eliminado" },
  { cod: 1, mensaje: "Cambio de precio" },
  { cod: 2, mensaje: "Cantidad agotada" },
];

export const addItemToCarrito = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ username: req.user.aud.split(" ")[0] });
    const item = await Item.findOne({ codigo: req.body.codigo });

    // console.log(item);

    let inOrder;

    if (item.subConteo) {
      if (item.subConteo.nameSecond !== "") {
        inOrder = item.subConteo.order.find(
          (o) =>
            o.name === req.body.orderToAdd.name &&
            o.nameSecond === req.body.orderToAdd.nameSecond
        );
      } else {
        inOrder = item.subConteo.order.find(
          (o) => o.name === req.body.orderToAdd.name
        );
      }
    }

    if (item.deleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(410).json({ errorMSG: "El item ha sido elminado" });
    } else if (item.priceIGV !== req.body.priceIGV) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({ errorMSG: "El precio del producto ha cambiado" });
    } else if (item.cantidad < req.body.cantidad) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({ errorMSG: "Ya no contamos con la cantidad deseada" });
    } else if (item.subConteo) {
      if (inOrder.cantidad < req.body.cantidad) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(409)
          .json({ errorMSG: "Ya no contamos con la cantidad deseada" });
      }
    }

    if (user.carrito === "not") {
      const newVenta = new Venta({
        totalPrice: req.body.cantidad * item.priceIGV,
        totalPriceNoIGV: req.body.cantidad * item.priceNoIGV,
        estado: "pendiente",
        vendedor: req.user.aud.split(" ")[0],
        tipoVendedor: "low",
        medio_de_pago: "efectivo",
        cliente_email: user.email,
        itemsVendidos: [],
        carrito_venta: true,
      });
      newVenta.itemsVendidos.push({
        codigo: item.codigo,
        tipo: "producto",
        descripcion: item.description,
        name: item.name,
        priceIGV: item.priceIGV,
        priceNoIGV: item.priceNoIGV,
        priceCosto: item.costoPropio,
        cantidad: req.body.cantidad,
        cantidadSC: [],
        totalPrice: req.body.cantidad * item.priceIGV,
        totalPriceNoIGV: req.body.cantidad * item.priceNoIGV,
        unidadDeMedida: item.unidadDeMedida,
        photo: item.photo,
      });
      if (item.subConteo) {
        if (item.subConteo.nameSecond !== "") {
          newVenta.itemsVendidos[0].cantidadSC.push({
            name: inOrder.name,
            nameSecond: inOrder.nameSecond,
            cantidadDisponible: inOrder.cantidad,
            cantidadVenta: req.body.cantidad,
          });
        } else {
          newVenta.itemsVendidos[0].cantidadSC.push({
            name: inOrder.name,
            nameSecond: undefined,
            cantidadDisponible: inOrder.cantidad,
            cantidadVenta: req.body.cantidad,
          });
        }
      }
      const codigo = await generarCodigo();
      newVenta.codigo = codigo;
      req.ventaGenerada = await newVenta.save();
      await User.findOneAndUpdate(
        { username: req.user.aud.split(" ")[0] },
        { carrito: req.ventaGenerada.codigo },
        { useFindAndModify: false, new: true }
      );
    } else {
      const ventaActiva = await Venta.findOne({ codigo: user.carrito });
      const itemExiste = ventaActiva.itemsVendidos.findIndex(
        (iv) => iv.codigo === item.codigo
      );
      if (itemExiste === -1) {
        const itemVendido = {
          codigo: item.codigo,
          tipo: "producto",
          descripcion: item.description,
          name: item.name,
          priceIGV: item.priceIGV,
          priceNoIGV: item.priceNoIGV,
          priceCosto: item.costoPropio,
          cantidad: req.body.cantidad,
          cantidadSC: [],
          totalPrice: req.body.cantidad * item.priceIGV,
          totalPriceNoIGV: req.body.cantidad * item.priceNoIGV,
          unidadDeMedida: item.unidadDeMedida,
          photo: item.photo,
        };

        if (item.subConteo) {
          if (item.subConteo.nameSecond !== "") {
            itemVendido.cantidadSC.push({
              name: inOrder.name,
              nameSecond: inOrder.nameSecond,
              cantidadDisponible: inOrder.cantidad,
              cantidadVenta: req.body.cantidad,
            });
          } else {
            itemVendido.cantidadSC.push({
              name: inOrder.name,
              nameSecond: undefined,
              cantidadDisponible: inOrder.cantidad,
              cantidadVenta: req.body.cantidad,
            });
          }
        }
        req.ventaGenerada = await Venta.findOneAndUpdate(
          { codigo: user.carrito },
          {
            $push: { itemsVendidos: itemVendido },
            $inc: {
              totalPrice: itemVendido.totalPrice,
              totalPriceNoIGV: itemVendido.totalPriceNoIGV,
            },
          },
          { useFindAndModify: false, new: true }
        );
      } else if (itemExiste > -1) {
        if (item.subConteo) {
          let cantidadSCE = -1;
          if (item.subConteo.nameSecond === "") {
            cantidadSCE = ventaActiva.itemsVendidos[
              itemExiste
            ].cantidadSC.findIndex((csc) => csc.name === inOrder.name);
          } else {
            cantidadSCE = ventaActiva.itemsVendidos[
              itemExiste
            ].cantidadSC.findIndex(
              (csc) =>
                csc.name === inOrder.name &&
                csc.nameSecond === inOrder.nameSecond
            );
          }

          if (cantidadSCE === -1) {
            const cantidadToUpdate =
              ventaActiva.itemsVendidos[itemExiste].cantidad +
              req.body.cantidad;
            const totalPrecioNuevo = item.priceIGV * cantidadToUpdate;
            const totalPrecioNuevoNoIGV = item.priceNoIGV * cantidadToUpdate;

            const constPrecioTotalVenta =
              ventaActiva.totalPrice -
              ventaActiva.itemsVendidos[itemExiste].totalPrice +
              totalPrecioNuevo;
            const constPrecioTotalVentaNoIGV =
              ventaActiva.totalPriceNoIGV -
              ventaActiva.itemsVendidos[itemExiste].totalPriceNoIGV +
              totalPrecioNuevoNoIGV;

            req.ventaGenerada = await Venta.findOneAndUpdate(
              { codigo: user.carrito, "itemsVendidos.codigo": item.codigo },
              {
                totalPrice: constPrecioTotalVenta,
                totalPriceNoIGV: constPrecioTotalVentaNoIGV,
                $set: {
                  "itemsVendidos.$.priceIGV": item.priceIGV,
                  "itemsVendidos.$.priceNoIGV": item.priceNoIGV,
                  "itemsVendidos.$.priceCosto": item.costoPropio,
                  "itemsVendidos.$.cantidad": cantidadToUpdate,
                  "itemsVendidos.$.totalPriceNoIGV": totalPrecioNuevoNoIGV,
                  "itemsVendidos.$.totalPrice": totalPrecioNuevo,
                },
                $push: {
                  "itemsVendidos.$.cantidadSC": {
                    name: inOrder.name,
                    nameSecond: inOrder.nameSecond || undefined,
                    cantidadDisponible: inOrder.cantidad,
                    cantidadVenta: req.body.cantidad,
                  },
                },
              },
              { useFindAndModify: false, new: true }
            );
          } else {
            const cantidadToUpdate =
              ventaActiva.itemsVendidos[itemExiste].cantidad -
              ventaActiva.itemsVendidos[itemExiste].cantidadSC[cantidadSCE]
                .cantidadVenta +
              req.body.cantidad;
            const totalPrecioNuevo = item.priceIGV * cantidadToUpdate;
            const totalPrecioNuevoNoIGV = item.priceNoIGV * cantidadToUpdate;

            const constPrecioTotalVenta =
              ventaActiva.totalPrice -
              ventaActiva.itemsVendidos[itemExiste].totalPrice +
              totalPrecioNuevo;
            const constPrecioTotalVentaNoIGV =
              ventaActiva.totalPriceNoIGV -
              ventaActiva.itemsVendidos[itemExiste].totalPriceNoIGV +
              totalPrecioNuevoNoIGV;
            ventaActiva.itemsVendidos[itemExiste].cantidadSC[
              cantidadSCE
            ].cantidadDisponible = inOrder.cantidad;
            ventaActiva.itemsVendidos[itemExiste].cantidadSC[
              cantidadSCE
            ].cantidadVenta = req.body.cantidad;

            req.ventaGenerada = await Venta.findOneAndUpdate(
              { codigo: user.carrito, "itemsVendidos.codigo": item.codigo },
              {
                totalPrice: constPrecioTotalVenta,
                totalPriceNoIGV: constPrecioTotalVentaNoIGV,
                $set: {
                  "itemsVendidos.$.priceIGV": item.priceIGV,
                  "itemsVendidos.$.priceNoIGV": item.priceNoIGV,
                  "itemsVendidos.$.priceCosto": item.costoPropio,
                  "itemsVendidos.$.cantidad": cantidadToUpdate,
                  "itemsVendidos.$.totalPriceNoIGV": totalPrecioNuevoNoIGV,
                  "itemsVendidos.$.totalPrice": totalPrecioNuevo,
                  "itemsVendidos.$.cantidadSC":
                    ventaActiva.itemsVendidos[itemExiste].cantidadSC,
                },
              },
              { useFindAndModify: false, new: true }
            );
          }
        } else {
          const precioTotal = req.body.cantidad * item.priceIGV;
          const precioTotalNoIGV = req.body.cantidad * item.priceNoIGV;

          const constPrecioTotalVenta =
            ventaActiva.totalPrice -
            ventaActiva.itemsVendidos[itemExiste].totalPrice +
            precioTotal;
          const constPrecioTotalVentaNoIGV =
            ventaActiva.totalPriceNoIGV -
            ventaActiva.itemsVendidos[itemExiste].totalPriceNoIGV +
            precioTotalNoIGV;

          req.ventaGenerada = await Venta.findOneAndUpdate(
            { codigo: user.carrito, "itemsVendidos.codigo": item.codigo },
            {
              totalPrice: constPrecioTotalVenta,
              totalPriceNoIGV: constPrecioTotalVentaNoIGV,
              $set: {
                "itemsVendidos.$.priceIGV": item.priceIGV,
                "itemsVendidos.$.priceNoIGV": item.priceNoIGV,
                "itemsVendidos.$.priceCosto": item.costoPropio,
                "itemsVendidos.$.cantidad": req.body.cantidad,
                "itemsVendidos.$.totalPriceNoIGV": precioTotalNoIGV,
                "itemsVendidos.$.totalPrice": precioTotal,
              },
            },
            { useFindAndModify: false, new: true }
          );
        }
      }
    }

    await session.commitTransaction();
    session.endSession();
    return res.json(req.ventaGenerada);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ errorMSG: error });
  }
};

const generarCodigo = async () => {
  try {
    const count = (await Venta.countDocuments({})) + 1;
    let preCod = "SD01-000000";
    for (let index = 0; index < count.toString().length; index++) {
      preCod = preCod.slice(0, -1);
    }
    const codigo = preCod + count.toString();
    return codigo;
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

export const comprobarCarrito = async (req, res, next) => {
  try {
    const item = await Item.findOne({ codigo: req.body.codigo });

    let inOrder;

    if (item.subConteo) {
      if (item.subConteo.nameSecond !== "") {
        inOrder = item.subConteo.order.find(
          (o) =>
            o.name === req.body.orderToAdd.name &&
            o.nameSecond === req.body.orderToAdd.nameSecond
        );
      } else {
        inOrder = item.subConteo.order.find(
          (o) => o.name === req.body.orderToAdd.name
        );
      }
    }

    if (item.deleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(410).json({ errorMSG: "El item ha sido elminado" });
    } else if (item.priceIGV !== req.body.priceIGV) {
      return res
        .status(409)
        .json({ errorMSG: "El precio del producto ha cambiado" });
    } else if (item.cantidad < req.body.cantidad) {
      return res
        .status(409)
        .json({ errorMSG: "Ya no contamos con la cantidad deseada" });
    } else if (item.subConteo) {
      if (inOrder.cantidad < req.body.cantidad) {
        return res
          .status(409)
          .json({ errorMSG: "Ya no contamos con la cantidad deseada" });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

export const getCarrito = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const carrito = await Venta.aggregate([
      { $match: { codigo: req.carrito_codigo } },
      { $unwind: "$itemsVendidos" },
      { $replaceRoot: { newRoot: "$itemsVendidos" } },
      { $unwind: { path: "$cantidadSC", preserveNullAndEmptyArrays: true } },
      { $sort: { codigo: -1 } },
    ]);

    // Comprobar Carrito
    const tipoDeAlertas = [
      { cod: 0, mensaje: "Item Eliminado" },
      { cod: 1, mensaje: "Cambio de precio" },
    ];
    const alerts = [];

    const arraySearch = [];
    let previousCode = "";
    for (let index = 0; index < carrito.length; index++) {
      if (carrito[index].codigo !== previousCode) {
        arraySearch.push(carrito[index].codigo);
      }
      previousCode = carrito[index].codigo;
    }
    const itemsEnVenta = await Item.aggregate([
      { $match: { codigo: { $in: arraySearch } } },
      { $sort: { codigo: -1 } },
    ]);
    const finalArrayCarrito = [];
    let indexOfItems = 0;
    let itemDeletedCod = "";
    let itemCambioPrecioCod = "";

    for (let index = 0; index < carrito.length; index++) {
      if (itemsEnVenta[indexOfItems].deleted) {
        if (itemDeletedCod !== itemsEnVenta[indexOfItems].codigo) {
          itemDeletedCod = itemsEnVenta[indexOfItems].codigo;
          alerts.push({
            ...tipoDeAlertas[0],
            item_cod: itemsEnVenta[indexOfItems].codigo,
            item_name: itemsEnVenta[indexOfItems].name,
          });

          await Venta.findOneAndUpdate(
            { codigo: req.carrito_codigo },
            {
              $inc: {
                totalPrice: -(
                  carrito[index].cantidad * carrito[index].priceIGV
                ),
                totalPriceNoIGV: -(
                  carrito[index].cantidad * carrito[index].priceNoIGV
                ),
              },
              $pull: { itemsVendidos: { codigo: itemDeletedCod } },
            },
            { useFindAndModify: false, new: true }
          );
        }
      } else {
        if (
          itemsEnVenta[indexOfItems].priceIGV !== carrito[index].priceIGV &&
          itemCambioPrecioCod !== itemsEnVenta[indexOfItems].codigo
        ) {
          itemCambioPrecioCod = itemsEnVenta[indexOfItems].codigo;
          alerts.push({
            ...tipoDeAlertas[1],
            item_cod: itemsEnVenta[indexOfItems].codigo,
            item_name: itemsEnVenta[indexOfItems].name,
          });

          const totalPrecioNuevo =
            itemsEnVenta[indexOfItems].priceIGV * carrito[index].cantidad;
          const totalPrecioNuevoNoIGV =
            itemsEnVenta[indexOfItems].priceNoIGV * carrito[index].cantidad;
          await Venta.findOneAndUpdate(
            {
              codigo: req.carrito_codigo,
              "itemsVendidos.codigo": itemsEnVenta[indexOfItems].codigo,
            },
            {
              $inc: {
                totalPrice: totalPrecioNuevo - carrito[index].totalPrice,
                totalPriceNoIGV:
                  totalPrecioNuevoNoIGV - carrito[index].totalPriceNoIGV,
              },
              $set: {
                "itemsVendidos.$.totalPrice": totalPrecioNuevo,
                "itemsVendidos.$.totalPriceNoIGV": totalPrecioNuevoNoIGV,
                "itemsVendidos.$.priceIGV": itemsEnVenta[indexOfItems].priceIGV,
                "itemsVendidos.$.priceNoIGV":
                  itemsEnVenta[indexOfItems].priceNoIGV,
              },
            },
            { useFindAndModify: false, new: true }
          );
        }

        carrito[index].priceIGV = itemsEnVenta[indexOfItems].priceIGV;
        carrito[index].priceNoIGV = itemsEnVenta[indexOfItems].priceNoIGV;
        carrito[index].totalPrice =
          itemsEnVenta[indexOfItems].priceIGV * carrito[index].cantidad;
        carrito[index].totalPriceNoIGV =
          itemsEnVenta[indexOfItems].priceNoIGV * carrito[index].cantidad;

        if (itemsEnVenta[indexOfItems].subConteo) {
          const carritoToLoop = carrito[index];
          const cantidadDisponible = itemsEnVenta[
            indexOfItems
          ].subConteo.order.find(
            (o) =>
              o.name === carritoToLoop.cantidadSC.name &&
              o.nameSecond === carrito[index].cantidadSC.nameSecond
          );

          finalArrayCarrito.push({
            ...carrito[index],
            cantidadDisponible: cantidadDisponible.cantidad,
            codVent: req.carrito_codigo,
          });
        } else {
          finalArrayCarrito.push({
            ...carrito[index],
            cantidadDisponible: itemsEnVenta[indexOfItems].cantidad,
            codVent: req.carrito_codigo,
          });
        }
      }

      if (
        carrito[index].codigo !==
        (carrito[index + 1] ? carrito[index + 1].codigo : "xxxxx")
      ) {
        indexOfItems++;
      }
    }
    await session.commitTransaction();
    session.endSession();
    res.json({
      carrito: finalArrayCarrito,
      cod_carrito: req.carrito_codigo,
      estado_carrito: req.estadoCarrito,
      alerts: alerts,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ errorMSG: error });
  }
};

export const removeProductoDeCarrito = async (req, res) => {
  try {
    let newCarrito;
    const carritoActParsed = req.carritoActual[0];

    if (
      carritoActParsed.cantidadSC &&
      carritoActParsed.cantidad - carritoActParsed.cantidadSC.cantidadVenta > 0
    ) {
      newCarrito = await Venta.findOneAndUpdate(
        { codigo: req.body.codVent, "itemsVendidos.codigo": req.body.codigo },
        {
          $inc: {
            totalPrice: -(
              carritoActParsed.cantidadSC.cantidadVenta *
              carritoActParsed.priceIGV
            ),
            totalPriceNoIGV: -(
              carritoActParsed.cantidadSC.cantidadVenta *
              carritoActParsed.priceNoIGV
            ),
            "itemsVendidos.$.cantidad":
              -carritoActParsed.cantidadSC.cantidadVenta,
            "itemsVendidos.$.totalPrice": -(
              carritoActParsed.cantidadSC.cantidadVenta *
              carritoActParsed.priceIGV
            ),
            "itemsVendidos.$.totalPriceNoIGV": -(
              carritoActParsed.cantidadSC.cantidadVenta *
              carritoActParsed.priceNoIGV
            ),
          },
          $pull: {
            "itemsVendidos.$.cantidadSC": {
              name: carritoActParsed.cantidadSC.name,
              nameSecond: carritoActParsed.cantidadSC.nameSecond,
            },
          },
        },
        { useFindAndModify: false, new: true }
      );
    } else {
      newCarrito = await Venta.findOneAndUpdate(
        { codigo: req.body.codVent },
        {
          $inc: {
            totalPrice: -(
              carritoActParsed.cantidad * carritoActParsed.priceIGV
            ),
            totalPriceNoIGV: -(
              carritoActParsed.cantidad * carritoActParsed.priceNoIGV
            ),
          },
          $pull: { itemsVendidos: { codigo: carritoActParsed.codigo } },
        },
        { useFindAndModify: false, new: true }
      );
    }

    req.newCarrito = newCarrito;
    res.json(newCarrito);
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

export const getCarritoEstado = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.user.aud.split(" ")[0] });
    req.carrito_codigo = user.carrito;
    next();
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

export const carritoEditableRMV = async (req, res, next) => {
  try {
    const carrito = await Venta.findOne({ codigo: req.body.codVent });
    req.estadoCarrito = carrito.estado_carrito_comprando;

    let carritoActual;

    if (req.body.cantidadSC) {
      carritoActual = await Venta.aggregate([
        { $match: { codigo: req.body.codVent } },
        { $unwind: "$itemsVendidos" },
        { $replaceRoot: { newRoot: "$itemsVendidos" } },
        { $unwind: { path: "$cantidadSC", preserveNullAndEmptyArrays: true } },
        { $match: { codigo: req.body.codigo } },
        { $match: { "cantidadSC.name": req.body.cantidadSC.name } },
        { $match: { "cantidadSC.nameSecond": req.body.cantidadSC.nameSecond } },
        { $sort: { codigo: -1 } },
      ]);
    } else {
      carritoActual = await Venta.aggregate([
        { $match: { codigo: req.body.codVent } },
        { $unwind: "$itemsVendidos" },
        { $replaceRoot: { newRoot: "$itemsVendidos" } },
        { $unwind: { path: "$cantidadSC", preserveNullAndEmptyArrays: true } },
        { $match: { codigo: req.body.codigo } },
      ]);
    }
    if (carritoActual.length === 0) {
      return res.status(409).json();
    }
    req.carritoActual = carritoActual;
    next();
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

export const aptoParaVenta = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.aud.split(" ")[0] });
    req.carrito_codigo = user.carrito;

    const searchArray = [];
    req.body.carrito.forEach((itemCarrito) => {
      searchArray.push(itemCarrito.codigo);
    });

    const itemsEnVenta = await Item.aggregate([
      { $match: { codigo: { $in: searchArray } } },
      { $sort: { codigo: -1 } },
    ]);

    const alertasLista = comprobarCarritoApto(
      [],
      itemsEnVenta,
      req.body.carrito
    );

    res.json(alertasLista);
  } catch (error) {
    return res.status(500).json({ errorMSG: error });
  }
};

const comprobarCarritoApto = (
  alerts = [],
  itemsEnVenta = [],
  carrito = [],
  index = 0,
  indexOfItems = 0
) => {
  if (itemsEnVenta[indexOfItems].deleted) {
    alerts.push({
      ...tipoDeAlertasGlobal[0],
      item_cod: itemsEnVenta[indexOfItems].codigo,
      item_name: itemsEnVenta[indexOfItems].name,
    });
  }

  if (itemsEnVenta[indexOfItems].priceIGV !== carrito[index].priceIGV) {
    alerts.push({
      ...tipoDeAlertasGlobal[1],
      item_cod: itemsEnVenta[indexOfItems].codigo,
      item_name: itemsEnVenta[indexOfItems].name,
    });
  }

  if (carrito[index].cantidadSC) {
    const itemSC = itemsEnVenta[indexOfItems].subConteo.order.find(
      (xi) =>
        xi.name === carrito[index].cantidadSC.name &&
        xi.nameSecond === carrito[index].cantidadSC.nameSecond
    );
    if (itemSC.cantidad - carrito[index].cantidadSC.cantidad < 0) {
      alerts.push({
        ...tipoDeAlertasGlobal[2],
        item_cod: itemsEnVenta[indexOfItems].codigo,
        item_name:
          itemsEnVenta[indexOfItems].name +
          " | " +
          itemSC.carrito[index].cantidadSC.name +
          " " +
          itemSC.carrito[index].cantidadSC.nameSecond,
      });
    }
  } else if (
    itemsEnVenta[indexOfItems].cantidad - carrito[index].cantidad <
    0
  ) {
    alerts.push({
      ...tipoDeAlertasGlobal[2],
      item_cod: itemsEnVenta[indexOfItems].codigo,
      item_name: itemsEnVenta[indexOfItems].name,
    });
  }

  if (
    carrito[index].codigo !==
    (carrito[index + 1] ? carrito[index + 1].codigo : "xxxxx")
  ) {
    indexOfItems++;
  }
  if (index + 1 === carrito.length) {
    return alerts;
  }
  index++;
  return comprobarCarritoApto(
    alerts,
    itemsEnVenta,
    carrito,
    index,
    indexOfItems
  );
};
