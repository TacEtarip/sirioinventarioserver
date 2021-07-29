import { Router } from 'express';
import { addItemToCarrito, getCarrito, removeProductoDeCarrito, getCarritoEstado, carritoEditableRMV } from '../controllers/carritoController';
import { lowLoginRequired } from '../controllers/usersController';


const routes = new Router();

routes.post('/agregarItem', lowLoginRequired, addItemToCarrito);

routes.post('/removeProductoDeCarrito', lowLoginRequired, carritoEditableRMV, removeProductoDeCarrito);

routes.get('/getCarrito', lowLoginRequired, getCarritoEstado, getCarrito);

export default routes;