import { Router } from 'express';

import { transaccionalLoginRequired } from '../controllers/usersController';

import { crearCotizacion, getCotis, getCoti, getCotiInfoForCard,
	agregarItemCoti, eliminarItemCoti, eliminarCoti, createExcel, getPDFCotiTest } from '../controllers/cotiController';

const routes = new Router();

routes.post('/generarCoti', transaccionalLoginRequired, crearCotizacion);

routes.post('/getPendientes', transaccionalLoginRequired, getCotis);

routes.get('/obtenerCoti/:cotiCod', transaccionalLoginRequired, getCoti);

routes.post('/cotiForCard', transaccionalLoginRequired, getCotiInfoForCard);

routes.post('/agregarItemCoti', transaccionalLoginRequired, agregarItemCoti);

routes.post('/eliminarItemCoti', transaccionalLoginRequired, eliminarItemCoti);

routes.put('/eliminarCoti', transaccionalLoginRequired, eliminarCoti);

routes.post('/getPdfCoti', transaccionalLoginRequired, getPDFCotiTest);

routes.post('/getExcelCoti', transaccionalLoginRequired, createExcel);

export default routes;