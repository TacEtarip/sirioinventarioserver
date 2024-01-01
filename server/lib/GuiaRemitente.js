export default class GuiaRemitente {
  constructor(tipoDeComprobante, numero) {
    this.operacion = "generar_guia";
    this.tipo_de_comprobante = tipoDeComprobante;
    this.serie = tipoDeComprobante === 7 ? "TTT2" : "VVV2";
    this.numero = numero;
    this.fecha_de_emision = this.getNowDate();
    this.enviar_automaticamente_al_cliente = true;
    this.formato_de_pdf = "TICKET";
    this.items = [];
    this.vehiculos_secundarios = [];
    this.conductores_secundarios = [];
    this.documento_relacionado = [];
  }

  addDocumentoRelacionado(tipo, serie, numero) {
    this.documento_relacionado.push({
      tipo,
      serie,
      numero,
    });
    return this;
  }

  addCliente(
    tipoDeDocumento,
    numeroDeDocumento,
    denominacion,
    direccion,
    email
  ) {
    this.cliente_tipo_de_documento = tipoDeDocumento;
    this.cliente_numero_de_documento = numeroDeDocumento;
    this.cliente_denominacion = denominacion;
    this.cliente_direccion = direccion;
    this.cliente_email = email;
    return this;
  }

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

  addObservaciones(observaciones) {
    this.observaciones = observaciones;
    return this;
  }

  addMotivoDeTraslado(motivoDeTraslado) {
    this.motivo_de_traslado = motivoDeTraslado;
    return this;
  }

  addMotivoDeTrasladoOtros(motivoDeTrasladoOtros) {
    this.motivo_de_traslado_otros = motivoDeTrasladoOtros;
    return this;
  }

  addPesoBruto(pesoBruto, unidadDeMedida) {
    this.peso_bruto_total = pesoBruto;
    this.peso_bruto_unidad_de_medida = unidadDeMedida;
    return this;
  }

  addNumeroDeBultos(numeroDeBultos) {
    this.numero_de_bultos = numeroDeBultos;
    return this;
  }

  addTipoDeTransporte(tipoDeTransporte) {
    this.tipo_de_transporte = tipoDeTransporte;
    return this;
  }

  addFechaDeInicioDeTraslado(fechaDeInicioDeTraslado) {
    this.fecha_de_inicio_de_traslado = fechaDeInicioDeTraslado;
    return this;
  }

  addTransportista(documentoTipo, documentoNumero, denominacion) {
    this.transportista_documento_tipo = documentoTipo;
    this.transportista_documento_numero = documentoNumero;
    this.transportista_denominacion = denominacion;
    return this;
  }

  addTransportistaPlacaNumero(transportistaPlacaNumero) {
    this.transportista_placa_numero = transportistaPlacaNumero;
    return this;
  }

  addTucVehiculo(tucVehiculo) {
    this.tuc_vehiculo = tucVehiculo;
    return this;
  }

  addConductor(
    documentoTipo,
    documentoNumero,
    nombre,
    apellidos,
    numeroLicencia
  ) {
    this.conductor_documento_tipo = documentoTipo;
    this.conductor_documento_numero = documentoNumero;
    this.conductor_nombre = nombre;
    this.conductor_apellidos = apellidos;
    this.conductor_numero_licencia = numeroLicencia;
    return this;
  }

  addDestinatario(
    destinatarioDocumentoTipo,
    destinatarioDocumentoNumero,
    destinatarioDenominacion
  ) {
    this.destinatario_documento_tipo = destinatarioDocumentoTipo;
    this.destinatario_documento_numero = destinatarioDocumentoNumero;
    this.destinatario_denominacion = destinatarioDenominacion;
    return this;
  }

  addPuntoDePartida(ubigeo, direccion) {
    this.punto_de_partida_ubigeo = ubigeo;
    this.punto_de_partida_direccion = direccion;
    return this;
  }

  addPuntoDeLlegada(ubigeo, direccion) {
    this.punto_de_llegada_ubigeo = ubigeo;
    this.punto_de_llegada_direccion = direccion;
    return this;
  }

  addPuntoDePartidaCodigoEstablecimientoSunat(
    puntoDePartidaCodigoEstablecimientoSunat
  ) {
    this.punto_de_partida_codigo_establecimiento_sunat =
      puntoDePartidaCodigoEstablecimientoSunat;
    return this;
  }

  addPuntoDeLlegadaCodigoEstablecimientoSunat(
    puntoDeLlegadaCodigoEstablecimientoSunat
  ) {
    this.punto_de_llegada_codigo_establecimiento_sunat =
      puntoDeLlegadaCodigoEstablecimientoSunat;
    return this;
  }

  addItem(item) {
    this.items.push(item);
    return this;
  }

  addVehiculoSecundario(placaNumero, tucVehiculo) {
    this.vehiculos_secundarios.push({
      placa_numero: placaNumero,
      tuc: tucVehiculo,
    });
    return this;
  }

  addConductorSecundario(
    documentoTipo,
    documentoNumero,
    nombre,
    apellidos,
    numeroLicencia
  ) {
    this.conductores_secundarios.push({
      documento_tipo: documentoTipo,
      documento_numero: documentoNumero,
      nombre,
      apellidos,
      numero_licencia: numeroLicencia,
    });
    return this;
  }
}
