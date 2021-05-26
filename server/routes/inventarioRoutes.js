import {Router} from 'express';
import {addNewItem, getAllItemsOfType, getAllItem, getItem, updateCantidad, getClientesConMasCompras, searchItem,
        updateItem, deleteItem, addOffer, removeOffer, uploadPhotoName, getGananciasTotalesSNS, filterTagsByRegex,
        changeFileStatus, deleteItemsTipo, updateItemsTipo, getAllItemSort, optenerGastosGananciasTotales, addCaracteristica,
        deleteItemsSubTipo, updateItemsSubTipo, getAllItemsSubTipoName, optenerVentasPotenciales, getItemsMasVendido,
        addMarca, deleteMarcas, getMarcas, subCantidadUpdate, cantidadUpdate, getPeorMejorItem, getRandomImageOfTipo,
        testFind, getItemReport, getItemBalance, searchText, getSimilarItems, getItemsDestacados, getTags, deleteTag, addTag,
        convertToFavorite, deConvertToFavorite, filterItemsByRegex, optenerVariacionPosneg, deleteCaracteristica } from '../controllers/itemController';
import { addNewTipo, getAllTipos, deleteTipo, updateTipo, addNewSubTipo, getTipo, getSubTipos, uploadPhotoNameCat,
        updateSubTipo, deleteSubTipo } from '../controllers/tipoController';
import {  uploadImage, uploadPDF, fichaUpload, imageUpload, getImage, getPDF, deleteImage, deleteImageSecond } from '../controllers/uploadsController';
import {normalLoginRequired, login, adminLoginRequired} from '../controllers/usersController';

const routes = new Router();

// routes.get('/addTagsAll', addTagsAll);

routes.get('/searchItem/:searchTerms', searchItem);

routes.post('/addCaracteristica', normalLoginRequired, addCaracteristica);

routes.post('/deteleCaracteristicas', normalLoginRequired, deleteCaracteristica);

routes.get('/getTags', getTags);

routes.post('/deteleTags', normalLoginRequired, deleteTag);

routes.post('/addTag', normalLoginRequired, addTag);

routes.get('/getClienteConMasCompras', getClientesConMasCompras);

routes.get('/getItemsMasVendido', normalLoginRequired, getItemsMasVendido);

routes.get('/getGananciasTotalesSNS', normalLoginRequired, getGananciasTotalesSNS);

routes.get('/gananciasInvercionTotal', normalLoginRequired, optenerGastosGananciasTotales);

routes.get('/getPeorMejorItem', normalLoginRequired, getPeorMejorItem);

routes.get('/getVariacionPosnegAll', normalLoginRequired,  optenerVariacionPosneg);

routes.get('/ventasPotenciales', normalLoginRequired, optenerVentasPotenciales);

routes.post('/getListOfItemsFilteredByRegex', filterItemsByRegex);

routes.post('/getListOfTagsFilteredByRegex', filterTagsByRegex);

routes.get('/getItemsDestacados', getItemsDestacados);

routes.get('/getItemsRelacionados/:tipo/:codigo', getSimilarItems);

routes.get('/getItemsSearch/:searchTerms', searchText);

routes.get('/getItemBalance/:codigo', getItemBalance);

routes.get('/getItemReport/:codigo', getItemReport);

routes.get('/testFind', testFind);

routes.post('/addItem', normalLoginRequired, addNewItem);

routes.post('/toFavorite', normalLoginRequired, convertToFavorite);

routes.post('/toUnFavorite', normalLoginRequired, deConvertToFavorite);

routes.get('/getItems', getAllItem);

routes.get('/getItemsByType/:tipo', getAllItemsOfType);

routes.get('/getItem/:tipo/:codigo', getItem);

routes.get('/getAllItemsSort/:subORtipo/:filtro/:tipoBusqueda/:tipoSort/:limit', getAllItemSort);

routes.get('/getTipo/:codigo', getTipo);

routes.get('/getItemsSubTipo/:tipo/:subTipo', getAllItemsSubTipoName);

routes.put('/uploadVariationSC', normalLoginRequired, subCantidadUpdate);

routes.put('/uploadVariationSimple', normalLoginRequired, cantidadUpdate);

// routes.put('/uploadPhotoName', uploadPhotoName);

routes.put('/modCant/:tipo', normalLoginRequired, updateCantidad);

routes.put('/updateItem', normalLoginRequired,updateItem);

routes.put('/updateTipo', normalLoginRequired, updateTipo, updateItemsTipo);

routes.delete('/deleteItem/:codigo', adminLoginRequired, deleteItem, deleteImageSecond);

routes.delete('/deleteTipo/:codigo', adminLoginRequired, deleteTipo, deleteItemsTipo);

routes.delete('/deleteSupTipo/:codigo/:subTipoName', adminLoginRequired, deleteSubTipo, deleteItemsSubTipo);

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

routes.post('/uploads/imageCat/:codigo', normalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoNameCat);

// routes.post('/uploads/ficha/:codigo', uploadPDF.single('pdf'), upload);

routes.post('/uploads/ficha/:codigo', normalLoginRequired, uploadPDF.single('pdf'), fichaUpload, changeFileStatus);

routes.get('/getRandomImageOfTipo/:tipo/:subTipo', getRandomImageOfTipo);

routes.get('/image/:imgName', getImage);
routes.get('/pdf/:pdfName', getPDF);

  
export default routes; 