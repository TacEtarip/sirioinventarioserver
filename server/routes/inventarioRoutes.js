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
        reOrderTipo, reOrderSubTipo, deleteSubTipoTransac, updateSubTipoTransac, updateTipoTransac, deleteTipoTransac, createSiteMap } from '../controllers/tipoController';
import {  uploadImage, uploadPDF, fichaUpload, imageUpload, getImage, getPDF, deleteImage, deleteImageSecond } from '../controllers/uploadsController';
import {normalLoginRequired, adminLoginRequired, transaccionalLoginRequired} from '../controllers/usersController';

const routes = new Router();

// routes.get('/addTagsAll', addTagsAll);

// routes.get('/setOrderNumer', addOrderToItems);

// routes.get('/testFindTipo', testFintTipo);

// routes.get('/testAgre', gananciasPosiblesConItemMayor);

routes.get('/getSiteMap', createSiteMap);

routes.get('/getTableInfItem', normalLoginRequired, getTableInfItem);

routes.get('/getTopFiveIngresosGananciasGastos', normalLoginRequired, getTopFiveIngresosGananciasGastos);

routes.get('/getItemVentasPorMes/:codigoItem', normalLoginRequired, ventasDeItemPorMesGrafico);

routes.get('/getItemGIC/:codigoItem', normalLoginRequired, getGICofItem);

routes.get('/getItemMayorGananciaPosible', normalLoginRequired, gananciasPosiblesConItemMayor);

routes.get('/getItemsLowStock', normalLoginRequired, getItemsLowStock);

routes.get('/getItemsNoStock', normalLoginRequired, getItemsNoStock);

routes.post('/changeFolder', transaccionalLoginRequired, cambiarItemCarpeta);

routes.post('/reorderItems', transaccionalLoginRequired, reOrderItems);

routes.post('/reorderTipos', transaccionalLoginRequired, reOrderTipo);

routes.post('/reorderSubTipos', transaccionalLoginRequired, reOrderSubTipo);

routes.get('/searchItem/:searchTerms', searchItem);

routes.post('/addCaracteristica', transaccionalLoginRequired, addCaracteristica);

routes.post('/deteleCaracteristicas', transaccionalLoginRequired, deleteCaracteristica);

routes.get('/getTags', getTags);

routes.post('/deteleTags', transaccionalLoginRequired, deleteTag);

routes.post('/addTag', transaccionalLoginRequired, addTag);

routes.get('/getClienteConMasCompras', normalLoginRequired, getClientesConMasCompras);

routes.get('/getItemsMasVendido', normalLoginRequired,getItemsMasVendido);

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

routes.get('/getItemBalance/:codigo', normalLoginRequired, getItemBalance);

routes.get('/getItemReport/:codigo', normalLoginRequired, getItemReport);

// routes.get('/testFind', testFind);

routes.post('/addItem', addNewItem);

routes.post('/toFavorite', transaccionalLoginRequired, convertToFavorite);

routes.post('/toUnFavorite', transaccionalLoginRequired, deConvertToFavorite);

routes.get('/getItems', getAllItem);

routes.get('/getItemsByType/:tipo', getAllItemsOfType);

routes.get('/getItem/:tipo/:codigo', getItem);

routes.get('/getAllItemsSort/:subORtipo/:filtro/:tipoBusqueda/:tipoSort/:limit', getAllItemSort);

routes.get('/getTipo/:codigo', getTipo);

routes.get('/getItemsSubTipo/:tipo/:subTipo', getAllItemsSubTipoName);

routes.put('/uploadVariationSC', transaccionalLoginRequired, subCantidadUpdate);

routes.put('/uploadVariationSimple', transaccionalLoginRequired, cantidadUpdate);

// routes.put('/uploadPhotoName', uploadPhotoName);

routes.put('/modCant/:tipo', transaccionalLoginRequired, updateCantidad);

routes.put('/updateItem', transaccionalLoginRequired, updateItem);

routes.put('/updateTipo', transaccionalLoginRequired, updateTipoTransac);

routes.delete('/deleteItem/:codigo', adminLoginRequired, deleteItem, deleteImageSecond);

routes.delete('/deleteTipo/:codigo', adminLoginRequired, deleteTipoTransac);

routes.delete('/deleteSupTipo/:codigo/:subTipoName', adminLoginRequired, deleteSubTipoTransac);

routes.put('/addSubTipo', transaccionalLoginRequired, addNewSubTipo);

routes.put('/offer/add', transaccionalLoginRequired, addOffer);

routes.put('/offer/remove', transaccionalLoginRequired, removeOffer);

routes.post('/addTipo', transaccionalLoginRequired, addNewTipo);

routes.get('/getTipos', getAllTipos);

routes.get('/getSubTipos/:tipoCod', getSubTipos);

routes.get('/marcas/getAll', getMarcas);

routes.delete('/marcas/delete/:deleteString', transaccionalLoginRequired, deleteMarcas);

routes.post('/marcas/add', transaccionalLoginRequired,addMarca);

routes.put('/uptateSupTipos', transaccionalLoginRequired, updateSubTipoTransac);

routes.post('/uploads/image/:codigo', transaccionalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoName);

routes.post('/uploads/imageCat/:codigo', transaccionalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoNameCat);

routes.post('/uploads/imageSubCat/:codigo/:subCat', transaccionalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoNameSubCat);

// routes.post('/uploads/ficha/:codigo', uploadPDF.single('pdf'), upload);

routes.post('/uploads/ficha/:codigo', transaccionalLoginRequired, uploadPDF.single('pdf'), fichaUpload, changeFileStatus);

// routes.get('/getRandomImageOfTipo/:tipo/:subTipo', getRandomImageOfTipo);

routes.get('/image/:imgName', getImage);
routes.get('/pdf/:pdfName', getPDF);

  
export default routes; 