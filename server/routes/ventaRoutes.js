import {Router} from 'express';
import {generarVenta, getDNI, getRUC, ventaSimple, getVentasActivas, getVenta} from '../controllers/ventaController';
import {ventaSimpleItemUpdate, getCantidadTotal, generarVentaNueva, 
    agregarItemVenta, getVentasActivasParaCard, ventaEjecutar, ventaAnular} from '../controllers/itemController';
import {loginRequired} from '../controllers/usersController';

const routes = new Router();

routes.post('/generarVenta', loginRequired, generarVenta);
 
routes.get('/dni/:dni', loginRequired, getDNI);

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