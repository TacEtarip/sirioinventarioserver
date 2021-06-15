import {Router} from 'express';
import {addNewItem, getAllItemsOfType, getAllItem, getItem, updateCantidad, getClientesConMasCompras, searchItem, getTableInfItem,
        updateItem, deleteItem, addOffer, removeOffer, uploadPhotoName, getGananciasTotalesSNS, filterTagsByRegex,
        changeFileStatus, getAllItemSort, optenerGastosGananciasTotales, addCaracteristica, getItemsLowStock, getItemsNoStock,
         getAllItemsSubTipoName, optenerVentasPotenciales, getItemsMasVendido, reOrderItems, getGICofItem, ventasDeItemPorMesGrafico,
        addMarca, deleteMarcas, getMarcas, subCantidadUpdate, cantidadUpdate, getPeorMejorItem, gananciasPosiblesConItemMayor,
        testFind, getItemReport, getItemBalance, searchText, getSimilarItems, getItemsDestacados, getTags, deleteTag, addTag,
        convertToFavorite, deConvertToFavorite, filterItemsByRegex, optenerVariacionPosneg, deleteCaracteristica,
        getTopFiveIngresosGananciasGastos } from '../controllers/itemController';
import { addNewTipo, getAllTipos, addNewSubTipo, getTipo, getSubTipos, uploadPhotoNameCat, uploadPhotoNameSubCat, cambiarItemCarpeta, 
        reOrderTipo, reOrderSubTipo, deleteSubTipoTransac, updateSubTipoTransac, updateTipoTransac, deleteTipoTransac } from '../controllers/tipoController';
import {  uploadImage, uploadPDF, fichaUpload, imageUpload, getImage, getPDF, deleteImage, deleteImageSecond } from '../controllers/uploadsController';
import {normalLoginRequired, adminLoginRequired} from '../controllers/usersController';

const routes = new Router();

// routes.get('/addTagsAll', addTagsAll);

// routes.get('/setOrderNumer', addOrderToItems);

// routes.get('/testFindTipo', testFintTipo);

// routes.get('/testAgre', gananciasPosiblesConItemMayor);

routes.get('/getTableInfItem', getTableInfItem);

routes.get('/getTopFiveIngresosGananciasGastos', getTopFiveIngresosGananciasGastos);

routes.get('/getItemVentasPorMes/:codigoItem', ventasDeItemPorMesGrafico);

routes.get('/getItemGIC/:codigoItem', getGICofItem);

routes.get('/getItemMayorGananciaPosible', gananciasPosiblesConItemMayor);

routes.get('/getItemsLowStock', getItemsLowStock);

routes.get('/getItemsNoStock', getItemsNoStock);

routes.post('/changeFolder', normalLoginRequired, cambiarItemCarpeta);

routes.post('/reorderItems', normalLoginRequired, reOrderItems);

routes.post('/reorderTipos', normalLoginRequired, reOrderTipo);

routes.post('/reorderSubTipos', normalLoginRequired, reOrderSubTipo);

routes.get('/searchItem/:searchTerms', searchItem);

routes.post('/addCaracteristica', normalLoginRequired, addCaracteristica);

routes.post('/deteleCaracteristicas', normalLoginRequired, deleteCaracteristica);

routes.get('/getTags', getTags);

routes.post('/deteleTags', normalLoginRequired, deleteTag);

routes.post('/addTag', normalLoginRequired, addTag);

routes.get('/getClienteConMasCompras', getClientesConMasCompras);

routes.get('/getItemsMasVendido',getItemsMasVendido);

routes.get('/getGananciasTotalesSNS', getGananciasTotalesSNS);

routes.get('/gananciasInvercionTotal', optenerGastosGananciasTotales);

routes.get('/getPeorMejorItem', getPeorMejorItem);

routes.get('/getVariacionPosnegAll',  optenerVariacionPosneg);

routes.get('/ventasPotenciales', optenerVentasPotenciales);

routes.post('/getListOfItemsFilteredByRegex', filterItemsByRegex);

routes.post('/getListOfTagsFilteredByRegex', filterTagsByRegex);

routes.get('/getItemsDestacados', getItemsDestacados);

routes.get('/getItemsRelacionados/:tipo/:codigo', getSimilarItems);

routes.get('/getItemsSearch/:searchTerms', searchText);

routes.get('/getItemBalance/:codigo', normalLoginRequired, getItemBalance);

routes.get('/getItemReport/:codigo', normalLoginRequired, getItemReport);

// routes.get('/testFind', testFind);

routes.post('/addItem', addNewItem);

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

routes.put('/updateItem', normalLoginRequired, updateItem);

routes.put('/updateTipo', normalLoginRequired, updateTipoTransac);

routes.delete('/deleteItem/:codigo', adminLoginRequired, deleteItem, deleteImageSecond);

routes.delete('/deleteTipo/:codigo', adminLoginRequired, deleteTipoTransac);

routes.delete('/deleteSupTipo/:codigo/:subTipoName', adminLoginRequired, deleteSubTipoTransac);

routes.put('/addSubTipo', normalLoginRequired, addNewSubTipo);

routes.put('/offer/add', normalLoginRequired, addOffer);

routes.put('/offer/remove', normalLoginRequired, removeOffer);

routes.post('/addTipo', normalLoginRequired, addNewTipo);

routes.get('/getTipos', getAllTipos);

routes.get('/getSubTipos/:tipoCod', getSubTipos);

routes.get('/marcas/getAll', getMarcas);

routes.delete('/marcas/delete/:deleteString', normalLoginRequired, deleteMarcas);

routes.post('/marcas/add', normalLoginRequired,addMarca);

routes.put('/uptateSupTipos', normalLoginRequired, updateSubTipoTransac);

routes.post('/uploads/image/:codigo', normalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoName);

routes.post('/uploads/imageCat/:codigo', normalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoNameCat);

routes.post('/uploads/imageSubCat/:codigo/:subCat', normalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoNameSubCat);

// routes.post('/uploads/ficha/:codigo', uploadPDF.single('pdf'), upload);

routes.post('/uploads/ficha/:codigo', normalLoginRequired, uploadPDF.single('pdf'), fichaUpload, changeFileStatus);

// routes.get('/getRandomImageOfTipo/:tipo/:subTipo', getRandomImageOfTipo);

routes.get('/image/:imgName', getImage);
routes.get('/pdf/:pdfName', getPDF);

  
export default routes; 