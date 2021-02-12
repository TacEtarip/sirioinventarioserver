import Item from '../lib/Item';
import NFB from '../lib/NubeFactBuilder';
import config from '../../config/index';
import fetch from 'node-fetch';
import jsonGuia from '../resources/guiaNbf.json';

export const anularComprobanteSunat = async (tipo = 1, serie = '', numero = 0, motivo = '') => {
    try {
        const bodyToSend = { operacion: 'generar_anulacion', tipo_de_comprobante: tipo, serie, numero, motivo};
        const response = await fetch('https://api.nubefact.com/api/v1/9e79db57-8322-4c1a-ac73-fa5093668c3c', {
        method: 'post',
        headers: { 'Content-Type': 'application/json', Authorization: config[process.env.NODE_ENV].nbfToken },
        body: JSON.stringify(bodyToSend)
        }).then(resT => resT.json());
        console.log(response);
        return response.enlace_del_pdf;
    } catch (error) {
        throw error;
    }
};



export const generarGuia = (req, res, next) => {
    if (!req.body.venta.guia) {
        return next();
    }
    const temporalJSON = { ...jsonGuia };
    temporalJSON.numero = req.countGuia + 1;
    if (req.ventResult.documento.type === 'factura') {
        temporalJSON.cliente_tipo_de_documento = 6;
    } else if (req.ventResult.documento.type === 'boleta') {
        temporalJSON.cliente_tipo_de_documento = 1;
    }
    temporalJSON.cliente_numero_de_documento = req.ventResult.documento.codigo;
    temporalJSON.cliente_denominacion = req.ventResult.documento.name;
    temporalJSON.cliente_direccion = req.ventResult.documento.direccion || '';
    temporalJSON.fecha_de_emision = new Date().toLocaleDateString('es-PE');
    console.log(temporalJSON.fecha_de_emision);
    temporalJSON.fecha_de_inicio_de_traslado = new Date().toLocaleDateString('es-PE');
    temporalJSON.numero_de_bultos = req.body.venta.bultos;
    temporalJSON.peso_bruto_total = req.body.venta.peso;
    if (req.body.venta.transportista_codigo.length === 8) {
        temporalJSON.transportista_documento_tipo = 1;
        temporalJSON.tipo_de_transporte = '02';
    } else {
        temporalJSON.transportista_documento_tipo = 6;
        temporalJSON.tipo_de_transporte ='01';
    }
    temporalJSON.transportista_documento_numero = req.body.venta.transportista_codigo;
    temporalJSON.transportista_denominacion = req.body.venta.transportista_nombre;
    temporalJSON.transportista_placa_numero = req.body.venta.transportista_placa;
    temporalJSON.conductor_documento_tipo = temporalJSON.transportista_documento_tipo;
    temporalJSON.conductor_documento_numero = temporalJSON.transportista_documento_numero;
    temporalJSON.conductor_denominacion =  temporalJSON.transportista_denominacion;
    temporalJSON.punto_de_partida_ubigeo = req.body.venta.partida_ubigeo;
    temporalJSON.punto_de_partida_direccion = req.body.venta.partida_direccion;
    temporalJSON.punto_de_llegada_ubigeo = req.body.venta.llegada_ubigeo;
    temporalJSON.punto_de_llegada_direccion = req.body.venta.llegada_direccion;
    temporalJSON.formato_de_pdf = 'A4';
    temporalJSON.cliente_email = req.ventResult.cliente_email || '';
    temporalJSON.enviar_automaticamente_a_la_sunat = true;
    temporalJSON.enviar_automaticamente_al_cliente = true;

    fetch('https://api.nubefact.com/api/v1/9e79db57-8322-4c1a-ac73-fa5093668c3c', {
        method: 'post',
        headers: { 'Content-Type': 'application/json', Authorization: config[process.env.NODE_ENV].nbfToken },
        body: JSON.stringify(temporalJSON)
        })
        .then(resT => resT.json())
        .then(json => {
            req.sunat_guia = json;
            if (json.errors) {
                console.log('hANDLE');
            }
            next();
        })
        .catch(err => res.status(err.status).json(err));
};

const formatearMetodoPago = (ventResult) => {
    let medioPago = ventResult.medio_de_pago.split('|')[0];
    let medioPagoDesc = ventResult.medio_de_pago.split('|')[1];
    let showMedio = '';
    switch (medioPago) {
        case 'efectivo':
            showMedio = 'Efectivo';
            break;
        case 'tarjeta':
            showMedio = 'Tarjeta: ' + medioPagoDesc;
            break;
        case 'yape':
            showMedio = 'Yape: ' + medioPagoDesc;
            break; 
        case 'otro':
            showMedio = medioPagoDesc;
            break;   
        default:
            break;
    }

    return showMedio;
};

const generarBoleta = (ventResult, countF, sunat_guia) => {

    const newBoleta = 
        new NFB(2, 1 + countF, ventResult.documento.codigo, ventResult.documento.name, ventResult.codigo, formatearMetodoPago(ventResult));
        newBoleta.addPrecios(ventResult.totalPriceNoIGV, 
            ventResult.totalPrice - ventResult.totalPriceNoIGV, 
            ventResult.totalPrice);

        if (ventResult.cliente_email) {
            newBoleta.addEmail(ventResult.cliente_email);
        }

        ventResult.itemsVendidos.forEach(item => {
            let newItem = 
            new Item('NIU', item.codigo, item.name + ' | ' + item.descripcion, item.cantidad, 
            item.priceNoIGV, item.priceIGV, item.totalPriceNoIGV, 
            item.totalPrice - item.totalPriceNoIGV, item.totalPrice);
            newBoleta.addItem(newItem.toJSON());
        });
        if (ventResult.guia) {
            newBoleta.addGuide({ guia_tipo: 1, guia_serie_numero: sunat_guia.serie.toString() + '-' + sunat_guia.numero });
        }
    return newBoleta.build().toJSON();
};

const generarFactura = (ventResult, countF, sunat_guia) => {
    const newBoleta = 
        new NFB(1, 1+ countF, ventResult.documento.codigo, ventResult.documento.name, ventResult.codigo, formatearMetodoPago(ventResult));

    newBoleta.addPrecios(ventResult.totalPriceNoIGV, 
        ventResult.totalPrice - ventResult.totalPriceNoIGV, 
        ventResult.totalPrice);

    if (ventResult.cliente_email) {
        newBoleta.addEmail(ventResult.cliente_email);
    }

    ventResult.itemsVendidos.forEach(item => {
        let newItem = 
        new Item('NIU', item.codigo, item.name + ' | ' + item.descripcion, item.cantidad, 
        item.priceNoIGV, item.priceIGV, item.totalPriceNoIGV, 
        item.totalPrice - item.totalPriceNoIGV, item.totalPrice);
        newBoleta.addItem(newItem.toJSON());
    });
    newBoleta.addDireccion(ventResult.documento.direccion);
    if (ventResult.guia) {
        newBoleta.addGuide({ guia_tipo: 1, guia_serie_numero: sunat_guia.serie.toString() + '-' + sunat_guia.numero });
    }
    return newBoleta.build().toJSON();
};

export const generarComprobante = (req, res, next) => {
    let jsonToSend = {};
    if (req.ventResult.documento.type === 'boleta') {
        jsonToSend = generarBoleta(req.ventResult, req.count, req.sunat_guia);
    } else if (req.ventResult.documento.type === 'factura') {
        jsonToSend = generarFactura(req.ventResult, req.count, req.sunat_guia);
    } else {
        return res.json({ message: `Succes||${req.ventResult.codigo}`, _sunat: null });
    }
    fetch('https://api.nubefact.com/api/v1/9e79db57-8322-4c1a-ac73-fa5093668c3c', {
        method: 'post',
        headers: { 'Content-Type': 'application/json', Authorization: config[process.env.NODE_ENV].nbfToken },
        body: JSON.stringify(jsonToSend)
        })
        .then(resT => resT.json())
        .then(json => {
            req.sunat = json;
            next();
        })
        .catch(err =>
            res.status(err.status || 500).json({ message: `Succes||${req.ventResult.codigo}`, _sunat: null }));
};

export const secondTest = async (req, res) => {
    try {
        const result = await fetch('https://api.nubefact.com/api/v1/9e79db57-8322-4c1a-ac73-fa5093668c3c', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', Authorization: config[process.env.NODE_ENV].nbfToken },
            body: JSON.stringify(testNF.build().toJSON())
            });
        const jsonRes = result.json();
        res.json(jsonRes);
    } catch (error) {
        res.status(500).json(error);
    }
};

