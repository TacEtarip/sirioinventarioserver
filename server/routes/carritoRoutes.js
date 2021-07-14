import { Router } from 'express';

import { lowLoginRequired } from '../controllers/usersController';

import { addItemToCarrito } from '../controllers/carritoController';

const routes = new Router();

routes.post('/agregarItem', lowLoginRequired, addItemToCarrito);

export default routes;