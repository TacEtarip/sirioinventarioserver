import { Router } from "express";
import {
  addLinkToPDF,
  agregarItemVenta,
  filtrarTopFive,
  generarVentaNueva,
  getCantidadTotal,
  getVentasActivasParaCard,
  ventaAnular,
  ventaAnularPost,
  ventaEjecutar,
  ventaSimpleItemUpdate,
} from "../controllers/itemController";
import {
  generarComprobante,
  crearGuiaV2,
  obtenerGuia,
} from "../controllers/nubeFactController";
import {
  agregarVentaUsuario,
  allLoginRequired,
  getVentasActivasList,
  normalLoginRequired,
  tieneVentaActiva,
  transaccionalLoginRequired,
} from "../controllers/usersController";
import {
  createExcel,
  eliminarItemScVenta,
  eliminarItemVenta,
  getCantidadDeVentasPorEstado,
  getDNI,
  getGananciaIngresoPorItem,
  getGananciaTotalPorItem,
  getGananciasTodoItem,
  getInfoToPlotVentasPrecioOverTime,
  getLastTenVentas,
  getMejoresClientes,
  getRUC,
  getVenta,
  getVentasEjecutadas,
  getVentasListLoggedUser,
  getVentasPorDiaMes,
  getVentaToCreateGuide,
  createGuide,
  aprobarContrato,
  actualizarCuotas,
} from "../controllers/ventaController";

const routes = new Router();

// , normalLoginRequiredroutes.get('/getVentasEjecutadasTest', getVentasEjecutadasTest);

routes.get("/getLastVentas/:vendedor", allLoginRequired, getLastTenVentas);

routes.get(
  "/getGananciaTotalPorItem/:codigoItem",
  normalLoginRequired,
  getGananciaTotalPorItem
);

routes.get(
  "/getItemGananciaIngreso/:codigoItem",
  normalLoginRequired,
  getGananciaIngresoPorItem
);

routes.get(
  "/getVentasPorDiaMes/:month/:year/:calcular",
  normalLoginRequired,
  getVentasPorDiaMes
);

routes.get("/getMejoresClientes", normalLoginRequired, getMejoresClientes);

routes.get(
  "/getItemsGanancias",
  normalLoginRequired,
  getGananciasTodoItem,
  filtrarTopFive
);

routes.get(
  "/getInfoToPlotVentasOverTime",
  normalLoginRequired,
  getInfoToPlotVentasPrecioOverTime
);

// !removed routes.post('/generarVenta', transaccionalLoginRequired, generarVenta);

routes.put("/eliminarItemVenta", transaccionalLoginRequired, eliminarItemVenta);

routes.put(
  "/eliminarItemSCVenta",
  transaccionalLoginRequired,
  eliminarItemScVenta
);

routes.put("/anularVentaPost", transaccionalLoginRequired, ventaAnularPost);

routes.get("/dni/:dni", allLoginRequired, getDNI);

routes.post("/createExcelReport", normalLoginRequired, createExcel);

routes.post("/getEjecutadas", normalLoginRequired, getVentasEjecutadas);

routes.post(
  "/getCantidadVentas",
  normalLoginRequired,
  getCantidadDeVentasPorEstado
);

routes.get("/testTotal", normalLoginRequired, getCantidadTotal);

routes.get("/ruc/:ruc", allLoginRequired, getRUC);

routes.get("/obtenerVenta/:ventaCod", normalLoginRequired, getVenta);

routes.post(
  "/ventaSimple",
  transaccionalLoginRequired,
  ventaSimpleItemUpdate,
  generarComprobante,
  addLinkToPDF
);

routes.post(
  "/agregarVenta",
  transaccionalLoginRequired,
  tieneVentaActiva,
  generarVentaNueva,
  agregarVentaUsuario
);

// ! removed routes.get('/ventasPendientes', normalLoginRequired, getVentaActiva, getVentaUser);

routes.get("/ventasActivasFull", normalLoginRequired, getVentasListLoggedUser);

routes.get("/ventasActivasList", normalLoginRequired, getVentasActivasList);

routes.post("/agregarItemVenta", transaccionalLoginRequired, agregarItemVenta);

routes.post("/ventasForCard", normalLoginRequired, getVentasActivasParaCard);

routes.post(
  "/ejecutarVenta",
  transaccionalLoginRequired,
  ventaEjecutar,
  generarComprobante,
  addLinkToPDF
);

routes.post(
  "/sunat-guide",
  transaccionalLoginRequired,
  getVentaToCreateGuide,
  crearGuiaV2,
  createGuide
);

routes.get(
  "/sunat-guide/:serie/:numero/:tipo_de_comprobante",
  transaccionalLoginRequired,
  obtenerGuia
);

routes.put(
  "/:codigo/aprobarContrato",
  transaccionalLoginRequired,
  aprobarContrato,
);

routes.put(
  "/:codigo/actualizarCuotas",
  transaccionalLoginRequired,
  actualizarCuotas,
);

routes.put("/anularVenta", transaccionalLoginRequired, ventaAnular);

export default routes;
