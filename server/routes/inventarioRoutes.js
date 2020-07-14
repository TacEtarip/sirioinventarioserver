import {Router} from 'express';
import {addNewItem, getAllItemsOfType, getAllItem, getItem, updateCantidad, 
        updateItem, deleteItem, addOffer, removeOffer, uploadPhotoName, 
        changeFileStatus, deleteItemsTipo, updateItemsTipo, getAllItemSort } from '../controllers/itemController';
import { addNewTipo, getAllTipos, deleteTipo, updateTipo } from '../controllers/tipoController';
import { upload, uploadImage, uploadPDF, fichaUpload, imageUpload, getImage, getPDF, deleteImage, deleteImageSecond } from '../controllers/uploadsController';
import {loginRequired, login} from '../controllers/usersController';

const routes = new Router();

routes.post('/addItem', loginRequired, addNewItem);

routes.get('/getItems', getAllItem);

routes.get('/getItemsByType/:tipo', getAllItemsOfType);

routes.get('/getItem/:tipo/:codigo', getItem);

routes.get('/getAllItemsSort/:filtro/:tipoBusqueda/:tipoSort', getAllItemSort);

// routes.put('/uploadPhotoName', uploadPhotoName);

routes.put('/modCant/:tipo', loginRequired, updateCantidad);

routes.put('/updateItem', loginRequired,updateItem);

routes.put('/updateTipo', loginRequired, updateTipo, updateItemsTipo);

routes.delete('/deleteItem/:codigo', loginRequired, deleteItem, deleteImageSecond);

routes.delete('/deleteTipo/:codigo', loginRequired, deleteTipo, deleteItemsTipo);

routes.put('/offer/add', loginRequired, addOffer);

routes.put('/offer/remove', loginRequired, removeOffer);

routes.post('/addTipo', loginRequired,addNewTipo);

routes.get('/getTipos', getAllTipos);

routes.post('/uploads/image/:codigo', loginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoName);

// routes.post('/uploads/ficha/:codigo', uploadPDF.single('pdf'), upload);

routes.post('/uploads/ficha/:codigo', loginRequired, uploadPDF.single('pdf'), fichaUpload, changeFileStatus);


routes.get('/image/:imgName', getImage);
routes.get('/pdf/:pdfName', getPDF);


export default routes; 