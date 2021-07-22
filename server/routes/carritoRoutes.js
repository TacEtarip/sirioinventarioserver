import { Router } from 'express';
import { addItemToCarrito, getCarrito } from '../controllers/carritoController';
import { lowLoginRequired } from '../controllers/usersController';


const routes = new Router();

routes.post('/agregarItem', lowLoginRequired, addItemToCarrito);

routes.get('/getCarrito', lowLoginRequired, getCarrito);

export default routes;