import {Router} from 'express';
import {generarVenta, getDNI, getRUC, ventaSimple, getVentasActivas, getVenta, 
        getCantidadDeVentasPorEstado, getVentasEjecutadas, eliminarItemVenta, 
        eliminarItemScVenta, createExcel, getVentaUser} from '../controllers/ventaController';
import {ventaSimpleItemUpdate, getCantidadTotal, generarVentaNueva, 
    agregarItemVenta, getVentasActivasParaCard, ventaEjecutar, 
    ventaAnular, ventaAnularPost, addLinkToPDF} from '../controllers/itemController';
import {allLoginRequired, normalLoginRequired, agregarVentaUsuario, getVentaActiva } from '../controllers/usersController';

import { testJsonCreation, secondTest, generarComprobante, generarGuia } from '../controllers/nubeFactController';

const routes = new Router();


routes.post('/generarVenta', normalLoginRequired, generarVenta);

routes.put('/eliminarItemVenta', normalLoginRequired, eliminarItemVenta);

routes.put('/eliminarItemSCVenta', normalLoginRequired, eliminarItemScVenta);

routes.put('/anularVentaPost', normalLoginRequired, ventaAnularPost);
 
routes.get('/dni/:dni', allLoginRequired, getDNI);

routes.get('/createExcelReport/:dateOne/:dateTwo', normalLoginRequired, createExcel);


routes.get('/getEjecutadas/:skip/:limit/:dateOne/:dateTwo', normalLoginRequired, getVentasEjecutadas);

routes.get('/getCantidadVentas/:estado/:dateOne/:dateTwo', normalLoginRequired, getCantidadDeVentasPorEstado);

routes.get('/testTotal', normalLoginRequired, getCantidadTotal);

routes.get('/ruc/:ruc', allLoginRequired, getRUC);

routes.get('/obtenerVenta/:ventaCod', normalLoginRequired, getVenta);
 
routes.post('/ventaSimple', normalLoginRequired, ventaSimpleItemUpdate, generarGuia, generarComprobante, addLinkToPDF);

routes.post('/agregarVenta', normalLoginRequired, generarVentaNueva, agregarVentaUsuario);

routes.get('/ventasPendientes', normalLoginRequired, getVentaActiva, getVentaUser);

routes.post('/agregarItemVenta', normalLoginRequired, agregarItemVenta);

routes.post('/ventasForCard', normalLoginRequired, getVentasActivasParaCard);

routes.post('/ejecutarVenta', normalLoginRequired, ventaEjecutar, generarGuia, generarComprobante, addLinkToPDF);

routes.put('/anularVenta', normalLoginRequired, ventaAnular);

export default routes; 