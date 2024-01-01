import { DateTime } from "luxon";
import NubeFact from "./NubeFact";
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
  constructor(
    tipo_de_comprobante,
    numero,
    cliente_numero_de_documento,
    cliente_denominacion,
    codigo_unico,
    medio_de_pago
  ) {
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

  // get the date in the format dd-mm-yyyy
  getNowDate() {
    const utc = DateTime.local().setZone("UTC-5");
    const lclString = utc.toLocaleString();
    const arrayDate = lclString.split("/");
    const day = arrayDate[0];
    const month = arrayDate[1];
    const year = arrayDate[2].split(",")[0];
    const date = `${day}-${month}-${year}`;
    return date;
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
   * Adds credits.
   * @param {{ cuota: number, fecha_de_pago: string, importe: number }[]} credits - Array of credit objects
   */
  addCredits(credits) {
    this.venta_al_credito = credits;
  }

  setMedioDePago(medio_de_pago) {
    this.medio_de_pago = medio_de_pago;
  }

  setFechaDeVencimiento(fecha_de_vencimiento) {
    this.fecha_de_vencimiento = fecha_de_vencimiento;
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
