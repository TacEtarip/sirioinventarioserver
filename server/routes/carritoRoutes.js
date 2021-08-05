import { Router } from 'express';
import { addItemToCarrito, getCarrito, removeProductoDeCarrito, aptoParaVenta,
	getCarritoEstado, carritoEditableRMV } from '../controllers/carritoController';
import { lowLoginRequired } from '../controllers/usersController';


const routes = new Router();

routes.post('/agregarItem', lowLoginRequired, addItemToCarrito);

routes.post('/removeProductoDeCarrito', lowLoginRequired, carritoEditableRMV, removeProductoDeCarrito);

routes.post('/iniciarCompra', lowLoginRequired, aptoParaVenta);

routes.get('/getCarrito', lowLoginRequired, getCarritoEstado, getCarrito);

export default routes;