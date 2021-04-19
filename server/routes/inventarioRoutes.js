import {Router} from 'express';
import {addNewItem, getAllItemsOfType, getAllItem, getItem, updateCantidad, 
        updateItem, deleteItem, addOffer, removeOffer, uploadPhotoName, getGananciasTotalesSNS,
        changeFileStatus, deleteItemsTipo, updateItemsTipo, getAllItemSort, optenerGastosGananciasTotales,
        deleteItemsSubTipo, updateItemsSubTipo, getAllItemsSubTipoName, optenerVentasPotenciales,
        addMarca, deleteMarcas, getMarcas, subCantidadUpdate, cantidadUpdate, getPeorMejorItem, 
        testFind, getItemReport, getItemBalance, searchText, getSimilarItems, getItemsDestacados,
        convertToFavorite, deConvertToFavorite, filterItemsByRegex, optenerVariacionPosneg } from '../controllers/itemController';
import { addNewTipo, getAllTipos, deleteTipo, updateTipo, addNewSubTipo, getTipo, getSubTipos, updateSubTipo, deleteSubTipo } from '../controllers/tipoController';
import {  uploadImage, uploadPDF, fichaUpload, imageUpload, getImage, getPDF, deleteImage, deleteImageSecond } from '../controllers/uploadsController';
import {normalLoginRequired, login, adminLoginRequired} from '../controllers/usersController';

const routes = new Router();



routes.get('/getGananciasTotalesSNS', getGananciasTotalesSNS);

routes.get('/gananciasInvercionTotal', optenerGastosGananciasTotales);

routes.get('/getPeorMejorItem', getPeorMejorItem);

routes.get('/getVariacionPosnegAll',  optenerVariacionPosneg);

routes.get('/ventasPotenciales', optenerVentasPotenciales);

routes.post('/getListOfItemsFilteredByRegex', filterItemsByRegex);

routes.get('/getItemsDestacados', getItemsDestacados);

routes.get('/getItemsRelacionados/:tipo/:codigo', getSimilarItems);

routes.get('/getItemsSearch/:searchTerms', searchText);

routes.get('/getItemBalance/:codigo', normalLoginRequired, getItemBalance);

routes.get('/getItemReport/:codigo', normalLoginRequired, getItemReport);

routes.get('/testFind', testFind);

routes.post('/addItem', normalLoginRequired, addNewItem);

routes.post('/toFavorite', normalLoginRequired, convertToFavorite);

routes.post('/toUnFavorite', normalLoginRequired, deConvertToFavorite);

routes.get('/getItems', getAllItem);

routes.get('/getItemsByType/:tipo', getAllItemsOfType);

routes.get('/getItem/:tipo/:codigo', getItem);

routes.get('/getAllItemsSort/:subORtipo/:filtro/:tipoBusqueda/:tipoSort/:limit', getAllItemSort);

routes.get('/getTipo/:codigo', getTipo);

routes.get('/getItemsSubTipo/:subTipo', getAllItemsSubTipoName);

routes.put('/uploadVariationSC', normalLoginRequired, subCantidadUpdate);

routes.put('/uploadVariationSimple', normalLoginRequired, cantidadUpdate);

// routes.put('/uploadPhotoName', uploadPhotoName);

routes.put('/modCant/:tipo', normalLoginRequired, updateCantidad);

routes.put('/updateItem', normalLoginRequired,updateItem);

routes.put('/updateTipo', normalLoginRequired, updateTipo, updateItemsTipo);

routes.delete('/deleteItem/:codigo', adminLoginRequired, deleteItem, deleteImageSecond);

routes.delete('/deleteTipo/:codigo', normalLoginRequired, deleteTipo, deleteItemsTipo);

routes.delete('/deleteSupTipo/:codigo/:subTipoName', normalLoginRequired, deleteSubTipo, deleteItemsSubTipo);

routes.put('/addSubTipo', normalLoginRequired, addNewSubTipo);

routes.put('/offer/add', normalLoginRequired, addOffer);

routes.put('/offer/remove', normalLoginRequired, removeOffer);

routes.post('/addTipo', normalLoginRequired, addNewTipo);

routes.get('/getTipos', getAllTipos);

routes.get('/getSubTipos/:tipoCod', getSubTipos);

routes.get('/marcas/getAll', getMarcas);

routes.delete('/marcas/delete/:deleteString', normalLoginRequired, deleteMarcas);

routes.post('/marcas/add', normalLoginRequired,addMarca);

routes.put('/uptateSupTipos', normalLoginRequired, updateSubTipo, updateItemsSubTipo);


routes.post('/uploads/image/:codigo', normalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoName);

// routes.post('/uploads/ficha/:codigo', uploadPDF.single('pdf'), upload);

routes.post('/uploads/ficha/:codigo', normalLoginRequired, uploadPDF.single('pdf'), fichaUpload, changeFileStatus);


routes.get('/image/:imgName', getImage);
routes.get('/pdf/:pdfName', getPDF);

  
export default routes; 