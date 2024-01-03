import { DateTime } from "luxon";
import fetch from "node-fetch";
import config from "../../config/index";
import GuiaRemitente from "../lib/GuiaRemitente";
import Item from "../lib/Item";
import NFB from "../lib/NubeFactBuilder";

const logger = config[process.env.NODE_ENV].log();

export const crearGuiaV2 = async (req, res, next) => {
  try {
    const venta = res.locals.venta;
    const countGuias = res.locals.countGuias + 1;

    const {
      tipoDeComprobante,
      tipoDeDocumento,
      numeroDeDocumento,
      denominacion,
      direccion,
      email,
      observaciones,
      motivoDeTraslado,
      motivoDeTrasladoOtros,
      pesoBruto,
      pesoBrutoUnidadDeMedida,
      numeroDeBultos,
      fechaDeInicioDeTraslado,
      tipoDeTransporte,
      transportistaTipoDeDocumento,
      transportistaNumeroDeDocumento,
      transportistaDenominacion,
      transportistaPlacaNumero,
      tucVehiculoPrincipal,
      conductorDocumentoTipo,
      conductorDocumentoNumero,
      conductorDenominacion,
      conductorNombre,
      conductorApellidos,
      conductorNumeroLicencia,
      destinatarioDocumentoTipo,
      destinatarioDocumentoNumero,
      destinatarioDenominacion,
      puntoDePartidaUbigeo,
      puntoDePartidaDireccion,
      puntoDePartidaCodigoEstablecimientoSunat,
      puntoDeLlegadaUbigeo,
      puntoDeLlegadaDireccion,
      puntoDeLlegadaCodigoEstablecimientoSunat,
      // vehiculosSecundarios,
      // conductoresSecundarios,
      // documentosRelacionados,
      // createFromDocument,
    } = req.body;

    const guia = new GuiaRemitente(tipoDeComprobante, countGuias)
      .addCliente(
        tipoDeDocumento,
        numeroDeDocumento,
        denominacion,
        direccion,
        email
      )
      .addObservaciones(observaciones)
      .addPesoBruto(pesoBruto, pesoBrutoUnidadDeMedida)
      .addFechaDeInicioDeTraslado(fechaDeInicioDeTraslado)
      .addTransportistaPlacaNumero(transportistaPlacaNumero)
      .addPuntoDePartida(puntoDePartidaUbigeo, puntoDePartidaDireccion)
      .addPuntoDeLlegada(puntoDeLlegadaUbigeo, puntoDeLlegadaDireccion);


    if (guia.motivo_de_traslado === "04" || guia.motivo_de_traslado === "18") {
      guia
        .addPuntoDePartidaCodigoEstablecimientoSunat(
          puntoDePartidaCodigoEstablecimientoSunat
        )
        .addPuntoDeLlegadaCodigoEstablecimientoSunat(
          puntoDeLlegadaCodigoEstablecimientoSunat
        );
    }

    if (venta.serie && venta.numero && venta.tipoComprobante) {
      guia.addDocumentoRelacionado(
        venta.tipoComprobante,
        venta.serie,
        venta.numero
      );
    }

    if (!venta.serie && !venta.numero && !venta.tipoComprobante) {
      for (const item of venta.itemsVendidos) {
        const newItem = {
          unidad_de_medida: "NIU",
          codigo: item.codigo,
          descripcion: item.name + " | " + item.descripcion,
          cantidad: item.cantidad,
        };

        if (item.unidadDeMedida === "UND") {
          newItem.unidad_de_medida = "NIU";
        } else if (item.unidadDeMedida === "PAR") {
          newItem.unidad_de_medida = "PR";
        } else if (item.unidadDeMedida === "CAJA") {
          newItem.unidad_de_medida = "BX";
        }

        guia.addItem(newItem);
      }
    }

    // for (const vehiculo of vehiculosSecundarios) {
    //   guia.addVehiculoSecundario(vehiculo.placaNumero, vehiculo.tuc);
    // }

    if (guia.tipo_de_comprobante === 7) {
      guia.addMotivoDeTraslado(motivoDeTraslado);
      if (guia.motivo_de_traslado === "13") {
        guia.addMotivoDeTrasladoOtros(motivoDeTrasladoOtros);
      }

      guia
        .addNumeroDeBultos(numeroDeBultos)
        .addTipoDeTransporte(tipoDeTransporte)
        .addTransportista(
          transportistaTipoDeDocumento,
          transportistaNumeroDeDocumento,
          transportistaDenominacion
        );

      if (guia.tipo_de_transporte === "02") {
        guia.addConductor(
          conductorDocumentoTipo,
          conductorDocumentoNumero,
          conductorDenominacion,
          conductorNombre,
          conductorApellidos,
          conductorNumeroLicencia
        );

        // for (const conductor of conductoresSecundarios) {
        //   guia.addConductorSecundario(
        //     conductor.documentoTipo,
        //     conductor.documentoNumero,
        //     conductor.denominacion,
        //     conductor.nombre,
        //     conductor.apellidos,
        //     conductor.numeroLicencia
        //   );
        // }
      }
    } else {
      guia
        .addTucVehiculo(tucVehiculoPrincipal)
        .addConductor(
          conductorDocumentoTipo,
          conductorDocumentoNumero,
          conductorDenominacion,
          conductorNombre,
          conductorApellidos,
          conductorNumeroLicencia
        )
        .addDestinatario(
          destinatarioDocumentoTipo,
          destinatarioDocumentoNumero,
          destinatarioDenominacion
        );
    }

    const result = await fetch(
      "https://api.nubefact.com/api/v1/9e79db57-8322-4c1a-ac73-fa5093668c3c",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: config[process.env.NODE_ENV].nbfToken,
        },
        body: JSON.stringify(temporalJSON),
      }
    );

    const jsonRes = await result.json();

    if (jsonRes.tipo_de_comprobante) {
      logger.info(jsonRes);
      res.locals.guia = jsonRes;
      return next();
    }

    logger.error(jsonRes);
    return res.status(400).json({ message: "Error al crear guía" });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error desconocido al crear guía" });
  }
};

export const obtenerGuia = async (req, res) => {
  try {
    const result = await fetch(
      "https://api.nubefact.com/api/v1/9e79db57-8322-4c1a-ac73-fa5093668c3c",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: config[process.env.NODE_ENV].nbfToken,
        },
        body: JSON.stringify({
          operacion: "consultar_guia",
          tipo_de_comprobante: req.params.tipoComprobante,
          serie: req.params.serie,
          numero: req.params.numero,
        }),
      }
    );

    const jsonRes = await result.json();

    if (jsonRes.tipo_de_comprobante) {
      logger.info(jsonRes);
      return res.json(jsonRes);
    }

    logger.error(jsonRes);
    return res.status(400).json({ message: "Error obtener guia" });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: "Error desconocido al obtener guia" });
  }
};

export const anularComprobanteSunat = async (
  tipo = 1,
  serie = "",
  numero = 0,
  motivo = ""
) => {
  try {
    const bodyToSend = {
      operacion: "generar_anulacion",
      tipo_de_comprobante: tipo,
      serie,
      numero,
      motivo,
    };
    const response = await fetch(
      "https://api.nubefact.com/api/v1/9e79db57-8322-4c1a-ac73-fa5093668c3c",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: config[process.env.NODE_ENV].nbfToken,
        },
        body: JSON.stringify(bodyToSend),
      }
    ).then((resT) => resT.json());
    return response.enlace_del_pdf;
  } catch (error) {
    throw error;
  }
};

const getNowDate = () => {
  const utc = DateTime.local().setZone("UTC-5");
  const lclString = utc.toLocaleString();
  const arrayDate = lclString.split("/");
  const day = arrayDate[0];
  const month = arrayDate[1];
  const year = arrayDate[2].split(",")[0];
  const date = `${day}-${month}-${year}`;
  return date;
};

const formatearMetodoPago = (ventResult) => {
  const medioPago = ventResult.medio_de_pago.split("|")[0];
  const medioPagoDesc = ventResult.medio_de_pago.split("|")[1];
  let showMedio = "";
  switch (medioPago) {
    case "efectivo":
      showMedio = "Efectivo";
      break;
    case "tarjeta":
      showMedio = "Tarjeta: " + medioPagoDesc;
      break;
    case "yape":
      showMedio = "Yape: " + medioPagoDesc;
      break;
    case "otro":
      showMedio = medioPagoDesc;
      break;
    default:
      break;
  }

  return showMedio;
};

const generarBoleta = (ventResult, countF) => {
  let zeroOffset = "";

  if (ventResult.documento.codigo.toString().length < 8) {
    for (
      let index = 0;
      index < 8 - ventResult.documento.codigo.toString().length;
      index++
    ) {
      zeroOffset += "0";
    }
  }

  const codigoDoc =
    ventResult.documento.codigo.toString().length < 8
      ? zeroOffset + ventResult.documento.codigo.toString()
      : ventResult.documento.codigo;

  const newBoleta = new NFB(
    2,
    1 + countF,
    codigoDoc,
    ventResult.documento.name,
    ventResult.codigo,
    formatearMetodoPago(ventResult)
  );
  newBoleta.addPrecios(
    ventResult.totalPriceNoIGV,
    ventResult.totalPrice - ventResult.totalPriceNoIGV,
    ventResult.totalPrice
  );

  newBoleta.addCredits(ventResult.credits);

  newBoleta.setFechaDeVencimiento(ventResult.fechaDeVencimiento);

  if (ventResult.credits && ventResult.credits.length > 0) {
    newBoleta.setMedioDePago("");
  }

  if (ventResult.cliente_email) {
    newBoleta.addEmail(ventResult.cliente_email);
  }

  ventResult.itemsVendidos.forEach((item) => {
    const newItem = new Item(
      "NIU",
      item.codigo,
      item.name + " | " + item.descripcion,
      item.cantidad,
      item.priceNoIGV,
      item.priceIGV,
      item.totalPriceNoIGV,
      item.totalPrice - item.totalPriceNoIGV,
      item.totalPrice
    );
    if (item.unidadDeMedida === "UND") {
      newItem.unidad_de_medida = "NIU";
    } else if (item.unidadDeMedida === "PAR") {
      newItem.unidad_de_medida = "PR";
    } else if (item.unidadDeMedida === "CAJA") {
      newItem.unidad_de_medida = "BX";
    }
    newBoleta.addItem(newItem.toJSON());
  });

  for (const guia of ventResult.guias) {
    newBoleta.addGuide({
      guia_tipo: guia.tipoDeComprobante === 7 ? 1 : 2,
      guia_serie_numero: `${guia.serie.toString()}-${guia.numero}`,
    });
  }

  return newBoleta.build().toJSON();
};

const generarFactura = (ventResult, countF, sunat_guia) => {
  let zeroOffset = "";

  if (ventResult.documento.codigo.toString().length < 11) {
    for (
      let index = 0;
      index < 11 - ventResult.documento.codigo.toString().length;
      index++
    ) {
      zeroOffset += "0";
    }
  }

  const codigoDoc =
    ventResult.documento.codigo.toString().length < 11
      ? zeroOffset + ventResult.documento.codigo.toString()
      : ventResult.documento.codigo;

  const newFactura = new NFB(
    1,
    1 + countF,
    codigoDoc,
    ventResult.documento.name,
    ventResult.codigo,
    formatearMetodoPago(ventResult)
  );

  newFactura.addPrecios(
    ventResult.totalPriceNoIGV,
    ventResult.totalPrice - ventResult.totalPriceNoIGV,
    ventResult.totalPrice
  );

  newFactura.addCredits(ventResult.credits);

  newFactura.setFechaDeVencimiento(ventResult.fechaDeVencimiento);

  if (ventResult.credits && ventResult.credits.length > 0) {
    newFactura.setMedioDePago("");
  }

  if (ventResult.cliente_email) {
    newFactura.addEmail(ventResult.cliente_email);
  }

  ventResult.itemsVendidos.forEach((item) => {
    const newItem = new Item(
      "NIU",
      item.codigo,
      item.name + " | " + item.descripcion,
      item.cantidad,
      item.priceNoIGV,
      item.priceIGV,
      item.totalPriceNoIGV,
      item.totalPrice - item.totalPriceNoIGV,
      item.totalPrice
    );
    if (item.unidadDeMedida === "UND") {
      newItem.unidad_de_medida = "NIU";
    } else if (item.unidadDeMedida === "PAR") {
      newItem.unidad_de_medida = "PR";
    } else if (item.unidadDeMedida === "CAJA") {
      newItem.unidad_de_medida = "BX";
    }
    newFactura.addItem(newItem.toJSON());
  });
  newFactura.addDireccion(ventResult.documento.direccion);
  for (const guia of ventResult.guias) {
    newBoleta.addGuide({
      guia_tipo: guia.tipoDeComprobante === 7 ? 1 : 2,
      guia_serie_numero: `${guia.serie.toString()}-${guia.numero}`,
    });
  }
  return newFactura.build().toJSON();
};

export const generarComprobante = (req, res, next) => {
  let jsonToSend = {};

  logger.info(req.ventResult.documento);

  if (req.ventResult.documento.type === "boleta") {
    jsonToSend = generarBoleta(req.ventResult, req.count);
  } else if (req.ventResult.documento.type === "factura") {
    jsonToSend = generarFactura(req.ventResult, req.count);
  } else {
    return res.json({
      message: `Success||${req.ventResult.codigo}`,
      _sunat: null,
    });
  }

  logger.info('jsonToSend', jsonToSend);

  const fetchWithRetry = (retryCount = 0, jsonToSend = {}) => {
    fetch(
      process.env.NUBE_FACT_API_URL ||
        "https://api.nubefact.com/api/v1/9e79db57-8322-4c1a-ac73-fa5093668c3c",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: config[process.env.NODE_ENV].nbfToken,
        },
        body: JSON.stringify(jsonToSend),
      }
    )
      .then((resT) => resT.json())
      .then((json) => {
        if ((json.codigo === 23 || json.codigo === "23") && retryCount < 3) {
          // Let's retry 3 times at max
          jsonToSend.numero = json.numero + 1;
          return fetchWithRetry(retryCount + 1, jsonToSend);
        }
        req.sunat = json;
        logger.info('jsonSunat', json);
        next();
      })
      .catch((err) => {
        logger.error(err);
        res
          .status(err.status || 500)
          .json({ message: `Success||${req.ventResult.codigo}`, _sunat: null });
      });
  };

  fetchWithRetry(0, jsonToSend);
};

export const secondTest = async (req, res) => {
  try {
    const result = await fetch(
      "https://api.nubefact.com/api/v1/9e79db57-8322-4c1a-ac73-fa5093668c3c",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: config[process.env.NODE_ENV].nbfToken,
        },
        body: JSON.stringify(testNF.build().toJSON()),
      }
    );
    const jsonRes = result.json();
    res.json(jsonRes);
  } catch (error) {
    res.status(500).json(error);
  }
};
