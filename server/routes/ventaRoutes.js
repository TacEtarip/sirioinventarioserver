import {Router} from 'express';
import {generarVenta} from '../controllers/ventaController';
import {loginRequired} from '../controllers/usersController';

const routes = new Router();

routes.post('/generarVenta', loginRequired, generarVenta);

export default routes;