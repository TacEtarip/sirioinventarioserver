/**
 *
 *
 * @class Item
 */
export default class Item {
  /**
   *Creates an instance of Item.
   * @param {*} unidad_de_medida
   * @param {*} codigo
   * @param {*} descripcion
   * @param {*} cantidad
   * @param {*} valor_unitario sin igv
   * @param {*} precio_unitario con igv
   * @param {*} subtotal cantidad x valor unitario (sin igv)
   * @param {*} igv
   * @param {*} total con igv
   * @memberof Item
   */
  constructor(
    unidad_de_medida,
    codigo,
    descripcion,
    cantidad,
    valor_unitario,
    precio_unitario,
    subtotal,
    igv,
    total
  ) {
    this.unidad_de_medida = unidad_de_medida;
    this.codigo = codigo;
    this.descripcion = descripcion;
    this.cantidad = cantidad;
    this.valor_unitario = valor_unitario;
    this.precio_unitario = precio_unitario;
    this.subtotal = subtotal;
    this.tipo_de_igv = 1;
    this.igv = igv;
    this.total = total;
  }

  toString() {
    return JSON.stringify(this);
  }

  toJSON(proto) {
    const jsoned = {};
    const toConvert = proto || this;
    Object.getOwnPropertyNames(toConvert).forEach((prop) => {
      const val = toConvert[prop];
      // don't include those
      if (prop === "toJSON" || prop === "constructor") {
        return;
      }
      if (typeof val === "function") {
        jsoned[prop] = val.bind(jsoned);
        return;
      }
      jsoned[prop] = val;
    });

    const inherited = Object.getPrototypeOf(toConvert);
    if (inherited !== null) {
      Object.keys(this.toJSON(inherited)).forEach((key) => {
        if (!!jsoned[key] || key === "constructor" || key === "toJSON") {
          return;
        }
        if (typeof inherited[key] === "function") {
          jsoned[key] = inherited[key].bind(jsoned);
          return;
        }
        jsoned[key] = inherited[key];
      });
    }
    return jsoned;
  }
}
