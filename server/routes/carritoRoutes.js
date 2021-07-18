import { Router } from 'express';

import { lowLoginRequired } from '../controllers/usersController';

import { addItemToCarrito, getCarrito } from '../controllers/carritoController';

const routes = new Router();

routes.post('/agregarItem', lowLoginRequired, addItemToCarrito);

routes.get('/getCarrito', lowLoginRequired, getCarrito);

export default routes;