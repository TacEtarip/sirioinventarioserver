import { Router } from 'express';

import { normalLoginRequired } from '../controllers/usersController';

import { crearCotizacion, getCotis, getCoti, getCotiInfoForCard, 
    agregarItemCoti, eliminarItemCoti, eliminarCoti, createExcel, getPDFCotiTest } from '../controllers/cotiController';

const routes = new Router();

routes.post('/generarCoti', normalLoginRequired, crearCotizacion);

routes.post('/getPendientes', normalLoginRequired, getCotis);

routes.get('/obtenerCoti/:cotiCod', normalLoginRequired, getCoti);

routes.post('/cotiForCard', normalLoginRequired, getCotiInfoForCard);

routes.post('/agregarItemCoti', normalLoginRequired, agregarItemCoti);

routes.post('/eliminarItemCoti', normalLoginRequired, eliminarItemCoti);

routes.put('/eliminarCoti', normalLoginRequired, eliminarCoti);

routes.post('/getPdfCoti', normalLoginRequired, getPDFCotiTest);

routes.post('/getExcelCoti', normalLoginRequired, createExcel);

export default routes;