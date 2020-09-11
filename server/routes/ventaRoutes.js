import {Router} from 'express';
import {generarVenta, getDNI, getRUC, ventaSimple, getVentasActivas, getVenta, 
        getCantidadDeVentasPorEstado, getVentasEjecutadas, eliminarItemVenta, 
        eliminarItemScVenta, createExcel} from '../controllers/ventaController';
import {ventaSimpleItemUpdate, getCantidadTotal, generarVentaNueva, 
    agregarItemVenta, getVentasActivasParaCard, ventaEjecutar, 
    ventaAnular, ventaAnularPost} from '../controllers/itemController';
import {loginRequired} from '../controllers/usersController';

const routes = new Router();

routes.post('/generarVenta', loginRequired, generarVenta);

routes.put('/eliminarItemVenta', eliminarItemVenta);

routes.put('/eliminarItemSCVenta', loginRequired, eliminarItemScVenta);

routes.put('/anularVentaPost', loginRequired, ventaAnularPost);
 
routes.get('/dni/:dni', loginRequired, getDNI);

routes.get('/createExcelReport/:dateOne/:dateTwo', loginRequired, createExcel);


routes.get('/getEjecutadas/:skip/:limit/:dateOne/:dateTwo', loginRequired, getVentasEjecutadas);

routes.get('/getCantidadVentas/:estado/:dateOne/:dateTwo', loginRequired, getCantidadDeVentasPorEstado);

routes.get('/testTotal', loginRequired, getCantidadTotal);

routes.get('/ruc/:ruc', loginRequired, getRUC);

routes.get('/obtenerVenta/:ventaCod', loginRequired, getVenta);
 
routes.post('/ventaSimple', loginRequired, ventaSimpleItemUpdate);

routes.post('/agregarVenta', loginRequired, generarVentaNueva);

routes.get('/ventasPendientes', loginRequired, getVentasActivas);

routes.post('/agregarItemVenta', loginRequired, agregarItemVenta);

routes.post('/ventasForCard', loginRequired, getVentasActivasParaCard);

routes.post('/ejecutarVenta', loginRequired, ventaEjecutar);

routes.put('/anularVenta', loginRequired, ventaAnular);

export default routes; 