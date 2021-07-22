import { Router } from 'express';
import {
	agregarItemCoti, crearCotizacion, createExcel, eliminarCoti, eliminarItemCoti, getCoti, getCotiInfoForCard, getCotis, getPDFCotiTest } from '../controllers/cotiController';
import { transaccionalLoginRequired } from '../controllers/usersController';


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