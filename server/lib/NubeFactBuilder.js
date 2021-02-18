import { DateTime } from 'luxon';
import NubeFact from './NubeFact';
/**
 * Builder for NubeFactClass
 *
 * @class NubeFactBuilder
 */
export default class NubeFactBuilder {

    /**
     *Creates an instance of NubeFactBuilder.
     * @param {*} tipo_de_comprobante 1 Factura o 2 Boleta
     * @param {*} numero 
     * @param {*} cliente_numero_de_documento ruc o dni
     * @param {*} cliente_denominacion nombre completo 
     * @memberof NubeFactBuilder
     */
    constructor(tipo_de_comprobante, numero, cliente_numero_de_documento, cliente_denominacion, codigo_unico, medio_de_pago) {
        this.tipo_de_comprobante = tipo_de_comprobante;
        this.numero = numero;
        this.cliente_numero_de_documento = cliente_numero_de_documento;
        this.cliente_denominacion = cliente_denominacion;
        this.fecha_de_emision = this.getNowDate();
        this.items = [];
        this.guias = [];
        this.codigo_unico = codigo_unico;
        this.medio_de_pago = medio_de_pago;
    }

    getNowDate() {
        const utc = DateTime.local().setZone('UTC-5');
        lclString = utc.toLocaleString();
        const arrayDate = lclString.split('-');
        const tempoPos = arrayDate[0];
        arrayDate[0] = arrayDate[1];
        arrayDate[1] = tempoPos;
        console.log(arrayDate.join('-'));
        return arrayDate.join('-');
    }

    addDireccion(cliente_direccion) {
        this.cliente_direccion = cliente_direccion;
    }

    addPrecios(total_gravada, total_igv, total) {
        this.total = total;
        this.total_gravada = total_gravada;
        this.total_igv = total_igv;
    }

    addItem(item) {
        this.items.push(item);
    }

    addGuide(guide) {
        this.guias.push(guide);
    }

    build() {
        return new NubeFact(this);
    }

    /**
     *
     *
     * @param {*} cliente_email
     * @memberof NubeFactBuilder
     */
    addEmail(cliente_email) {
        this.enviar_automaticamente_al_cliente = true;
        this.cliente_email = cliente_email;
    }
}