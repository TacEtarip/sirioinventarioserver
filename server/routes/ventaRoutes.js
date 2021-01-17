import {Router} from 'express';
import {generarVenta, getDNI, getRUC, ventaSimple, getVentasActivas, getVenta, 
        getCantidadDeVentasPorEstado, getVentasEjecutadas, eliminarItemVenta, 
        eliminarItemScVenta, createExcel} from '../controllers/ventaController';
import {ventaSimpleItemUpdate, getCantidadTotal, generarVentaNueva, 
    agregarItemVenta, getVentasActivasParaCard, ventaEjecutar, 
    ventaAnular, ventaAnularPost} from '../controllers/itemController';
import {normalLoginRequired} from '../controllers/usersController';

const routes = new Router();

routes.post('/generarVenta', normalLoginRequired, generarVenta);

routes.put('/eliminarItemVenta', eliminarItemVenta);

routes.put('/eliminarItemSCVenta', normalLoginRequired, eliminarItemScVenta);

routes.put('/anularVentaPost', normalLoginRequired, ventaAnularPost);
 
routes.get('/dni/:dni', normalLoginRequired, getDNI);

routes.get('/createExcelReport/:dateOne/:dateTwo', normalLoginRequired, createExcel);


routes.get('/getEjecutadas/:skip/:limit/:dateOne/:dateTwo', normalLoginRequired, getVentasEjecutadas);

routes.get('/getCantidadVentas/:estado/:dateOne/:dateTwo', normalLoginRequired, getCantidadDeVentasPorEstado);

routes.get('/testTotal', normalLoginRequired, getCantidadTotal);

routes.get('/ruc/:ruc', normalLoginRequired, getRUC);

routes.get('/obtenerVenta/:ventaCod', normalLoginRequired, getVenta);
 
routes.post('/ventaSimple', normalLoginRequired, ventaSimpleItemUpdate);

routes.post('/agregarVenta', normalLoginRequired, generarVentaNueva);

routes.get('/ventasPendientes', normalLoginRequired, getVentasActivas);

routes.post('/agregarItemVenta', normalLoginRequired, agregarItemVenta);

routes.post('/ventasForCard', normalLoginRequired, getVentasActivasParaCard);

routes.post('/ejecutarVenta', normalLoginRequired, ventaEjecutar);

routes.put('/anularVenta', normalLoginRequired, ventaAnular);

export default routes; 