import {Router} from 'express';
import {generarVenta, getDNI, getRUC, ventaSimple, getVentasActivas, getVenta, getVentasListLoggedUser, getVentasPorDiaMes, getGananciaTotalPorItem,
        getCantidadDeVentasPorEstado, getVentasEjecutadas, eliminarItemVenta, getInfoToPlotVentasPrecioOverTime, getGananciaIngresoPorItem,
        eliminarItemScVenta, createExcel, getVentaUser, getGananciasTodoItem, getMejoresClientes} from '../controllers/ventaController';
import {ventaSimpleItemUpdate, getCantidadTotal, generarVentaNueva, 
    agregarItemVenta, getVentasActivasParaCard, ventaEjecutar,
    ventaAnular, ventaAnularPost, addLinkToPDF, actualizarItems, filtrarTopFive} from '../controllers/itemController';
import {allLoginRequired, normalLoginRequired, agregarVentaUsuario, getVentaActiva, 
    tieneVentaActiva, adminLoginRequired, getVentasActivasList } from '../controllers/usersController';

import { generarComprobante, generarGuia } from '../controllers/nubeFactController';

const routes = new Router();

routes.get('/getGananciaTotalPorItem/:codigoItem', getGananciaTotalPorItem);

routes.get('/getItemGananciaIngreso/:codigoItem', getGananciaIngresoPorItem);

routes.get('/getVentasPorDiaMes/:month/:year/:calcular', getVentasPorDiaMes);

routes.get('/getMejoresClientes', getMejoresClientes);

routes.get('/getItemsGanancias', getGananciasTodoItem, filtrarTopFive);

routes.get('/getInfoToPlotVentasOverTime', getInfoToPlotVentasPrecioOverTime);

routes.post('/generarVenta', normalLoginRequired, generarVenta);

routes.put('/eliminarItemVenta', normalLoginRequired, eliminarItemVenta);

routes.put('/eliminarItemSCVenta', normalLoginRequired, eliminarItemScVenta);

routes.put('/anularVentaPost', normalLoginRequired, ventaAnularPost);
 
routes.get('/dni/:dni', allLoginRequired, getDNI);

routes.post('/createExcelReport', normalLoginRequired, createExcel);


routes.post('/getEjecutadas', normalLoginRequired, getVentasEjecutadas);

routes.post('/getCantidadVentas', normalLoginRequired, getCantidadDeVentasPorEstado);

routes.get('/testTotal', normalLoginRequired, getCantidadTotal);

routes.get('/ruc/:ruc', allLoginRequired, getRUC);

routes.get('/obtenerVenta/:ventaCod', normalLoginRequired, getVenta);
 
routes.post('/ventaSimple', normalLoginRequired, ventaSimpleItemUpdate, generarGuia, generarComprobante, addLinkToPDF);

routes.post('/agregarVenta', normalLoginRequired, tieneVentaActiva, generarVentaNueva, agregarVentaUsuario);

routes.get('/ventasPendientes', normalLoginRequired, getVentaActiva, getVentaUser);

routes.get('/ventasActivasFull', normalLoginRequired, getVentasListLoggedUser);

routes.get('/ventasActivasList', normalLoginRequired, getVentasActivasList);

routes.post('/agregarItemVenta', normalLoginRequired, agregarItemVenta);

routes.post('/ventasForCard', normalLoginRequired, getVentasActivasParaCard);

routes.post('/ejecutarVenta', normalLoginRequired, ventaEjecutar, generarGuia, generarComprobante, addLinkToPDF);

routes.put('/anularVenta', normalLoginRequired, ventaAnular);

export default routes; 