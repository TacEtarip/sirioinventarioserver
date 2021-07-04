/**
 *
 *
 * @class NubeFact clase para crear un archivo JSON a mandar a nubefact API
 */
export default class NubeFact {
	/**
     *Creates an instance of NubeFact. Necesita un Nube builder.
     * @param {*} builder
     * @memberof NubeFact
     */
	constructor(builder) {
		this.operacion = 'generar_comprobante';
		/**
         *  1 = FACTURA
            2 = BOLETA
            3 = NOTA DE CRÉDITO
            4 = NOTA DE DÉBITO
         */
		this.tipo_de_comprobante = builder.tipo_de_comprobante;
		if (this.tipo_de_comprobante === 1) {
			this.cliente_tipo_de_documento = '6';
			this.serie = 'FFF1';
		}
		else {
			this.cliente_tipo_de_documento = '1';
			this.serie = 'BBB1';
		}
		this.numero = builder.numero;
		this.sunat_transaction = 1;
		this.cliente_numero_de_documento = builder.cliente_numero_de_documento;
		this.cliente_denominacion = builder.cliente_denominacion;
		this.cliente_direccion = builder.cliente_direccion || '';
		this.cliente_email = builder.cliente_email || '';
		this.fecha_de_emision = builder.fecha_de_emision;
		this.moneda = 1;
		this.porcentaje_de_igv = 18.00;
		this.total_gravada = builder.total_gravada;
		this.total_igv = builder.total_igv;
		this.total = builder.total;
		this.detraccion = false;
		this.enviar_automaticamente_a_la_sunat = true;
		this.enviar_automaticamente_al_cliente = false;
		this.formato_de_pdf = 'A4';
		this.items = builder.items || [];
		this.guias = builder.guias || [];
		this.codigo_unico = builder.codigo_unico || '';
		this.cliente_email = builder.cliente_email || '';
		this.enviar_automaticamente_al_cliente = builder.enviar_automaticamente_al_cliente || false;
		this.medio_de_pago = builder.medio_de_pago;
	}

	toString() {
		return Object.keys(this);
	}

	toJSON(proto) {
		const jsoned = {};
		const toConvert = proto || this;
		Object.getOwnPropertyNames(toConvert).forEach((prop) => {
			const val = toConvert[prop];
			if (prop === 'toJSON' || prop === 'constructor') {
				return;
			}
			if (typeof val === 'function') {
				jsoned[prop] = val.bind(jsoned);
				return;
			}
			jsoned[prop] = val;
		});

		const inherited = Object.getPrototypeOf(toConvert);
		if (inherited !== null) {
			Object.keys(this.toJSON(inherited)).forEach(key => {
				if (!!jsoned[key] || key === 'constructor' || key === 'toJSON') {return;}
				if (typeof inherited[key] === 'function') {
					jsoned[key] = inherited[key].bind(jsoned);
					return;
				}
				jsoned[key] = inherited[key];
			});
		}
		return jsoned;
	}
}