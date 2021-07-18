import { Router } from 'express';
import { generarVenta, getDNI, getRUC, getLastTenVentas, getVenta, getVentasListLoggedUser, getVentasPorDiaMes, getGananciaTotalPorItem,
	getCantidadDeVentasPorEstado, getVentasEjecutadas, eliminarItemVenta, getInfoToPlotVentasPrecioOverTime, getGananciaIngresoPorItem,
	eliminarItemScVenta, createExcel, getVentaUser, getGananciasTodoItem, getMejoresClientes } from '../controllers/ventaController';
import { ventaSimpleItemUpdate, getCantidadTotal, generarVentaNueva,
	agregarItemVenta, getVentasActivasParaCard, ventaEjecutar,
	ventaAnular, ventaAnularPost, addLinkToPDF, filtrarTopFive } from '../controllers/itemController';

import { allLoginRequired, normalLoginRequired, agregarVentaUsuario, getVentaActiva,
	tieneVentaActiva, getVentasActivasList, transaccionalLoginRequired, lowLoginRequired } from '../controllers/usersController';

import { generarComprobante, generarGuia } from '../controllers/nubeFactController';

const routes = new Router();

// , normalLoginRequiredroutes.get('/getVentasEjecutadasTest', getVentasEjecutadasTest);


routes.get('/getLastVentas/:vendedor', allLoginRequired, getLastTenVentas);

routes.get('/getGananciaTotalPorItem/:codigoItem', normalLoginRequired, getGananciaTotalPorItem);

routes.get('/getItemGananciaIngreso/:codigoItem', normalLoginRequired, getGananciaIngresoPorItem);

routes.get('/getVentasPorDiaMes/:month/:year/:calcular', normalLoginRequired, getVentasPorDiaMes);

routes.get('/getMejoresClientes', normalLoginRequired, getMejoresClientes);

routes.get('/getItemsGanancias', normalLoginRequired, getGananciasTodoItem, filtrarTopFive);

routes.get('/getInfoToPlotVentasOverTime', normalLoginRequired, getInfoToPlotVentasPrecioOverTime);

routes.post('/generarVenta', transaccionalLoginRequired, generarVenta);

routes.put('/eliminarItemVenta', transaccionalLoginRequired, eliminarItemVenta);

routes.put('/eliminarItemSCVenta', transaccionalLoginRequired, eliminarItemScVenta);

routes.put('/anularVentaPost', transaccionalLoginRequired, ventaAnularPost);

routes.get('/dni/:dni', allLoginRequired, getDNI);

routes.post('/createExcelReport', normalLoginRequired, createExcel);

routes.post('/getEjecutadas', normalLoginRequired, getVentasEjecutadas);

routes.post('/getCantidadVentas', normalLoginRequired, getCantidadDeVentasPorEstado);

routes.get('/testTotal', normalLoginRequired, getCantidadTotal);

routes.get('/ruc/:ruc', allLoginRequired, getRUC);

routes.get('/obtenerVenta/:ventaCod', normalLoginRequired, getVenta);

routes.post('/ventaSimple', transaccionalLoginRequired, ventaSimpleItemUpdate, generarGuia, generarComprobante, addLinkToPDF);

routes.post('/agregarVenta', transaccionalLoginRequired, tieneVentaActiva, generarVentaNueva, agregarVentaUsuario);

routes.get('/ventasPendientes', normalLoginRequired, getVentaActiva, getVentaUser);

routes.get('/ventasActivasFull', normalLoginRequired, getVentasListLoggedUser);

routes.get('/ventasActivasList', normalLoginRequired, getVentasActivasList);

routes.post('/agregarItemVenta', transaccionalLoginRequired, agregarItemVenta);

routes.post('/ventasForCard', normalLoginRequired, getVentasActivasParaCard);

routes.post('/ejecutarVenta', transaccionalLoginRequired, ventaEjecutar, generarGuia, generarComprobante, addLinkToPDF);

routes.put('/anularVenta', transaccionalLoginRequired, ventaAnular);

export default routes;