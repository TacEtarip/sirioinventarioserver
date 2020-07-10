import {Router} from 'express';
import {addNewItem, getAllItemsOfType, getAllItem, getItem, updateCantidad, 
        updateItem, deleteItem, addOffer, removeOffer, uploadPhotoName} from '../controllers/itemController';
import { addNewTipo, getAllTipos } from '../controllers/tipoController';
import { upload, uploadImage, uploadPDF } from '../controllers/uploadsController';
import {loginRequired} from '../controllers/usersController';

const routes = new Router();

routes.post('/addItem', loginRequired, addNewItem);

routes.get('/getItems', loginRequired, getAllItem);

routes.get('/getItemsByType/:tipo', getAllItemsOfType);

routes.get('/getItem/:tipo', getItem);

routes.put('/uploadPhotoName', uploadPhotoName);

routes.put('/modCant/:tipo', loginRequired, updateCantidad);

routes.put('/updateItem', loginRequired, updateItem);

routes.delete('/deleteItem', loginRequired, deleteItem);

routes.put('/offer/add', loginRequired, addOffer);

routes.put('/offer/remove', loginRequired, removeOffer);

routes.post('/addTipo', loginRequired,addNewTipo);

routes.get('/getTipos', getAllTipos);

routes.post('/uploads/image/:codigo', loginRequired, uploadImage.single('img'), upload);

routes.post('/uploads/ficha/:codigo', loginRequired, uploadPDF.single('pdf'), upload);

export default routes;