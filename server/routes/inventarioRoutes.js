import { Router } from 'express';
import { addNewItem, getAllItemsOfType, getAllItem, getClientesConMasCompras, getTableInfItem,
	updateItem, deleteItem, uploadPhotoName, getGananciasTotalesSNS, filterTagsByRegex, getItem,
	changeFileStatus, optenerGastosGananciasTotales, addCaracteristica, getItemsLowStock, getItemsNoStock,
	getAllItemsSubTipoName, optenerVentasPotenciales, getItemsMasVendido, reOrderItems, getGICofItem, ventasDeItemPorMesGrafico,
	addMarca, deleteMarcas, getMarcas, subCantidadUpdate, cantidadUpdate, getPeorMejorItem, gananciasPosiblesConItemMayor,
	getItemReport, getItemBalance, searchText, getSimilarItems, getItemsDestacados, getTags, deleteTag, addTag,
	convertToFavorite, deConvertToFavorite, filterItemsByRegex, optenerVariacionPosneg, deleteCaracteristica,
	addItemReview } from '../controllers/itemController';
import { addNewTipo, getAllTipos, addNewSubTipo, getTipo, getSubTipos, uploadPhotoNameCat, uploadPhotoNameSubCat, cambiarItemCarpeta, getSiteMapLinks,
	reOrderTipo, reOrderSubTipo, deleteSubTipoTransac, updateSubTipoTransac, updateTipoTransac, deleteTipoTransac } from '../controllers/tipoController';
import { uploadImage, uploadPDF, fichaUpload, imageUpload, getPDF, deleteImage, deleteImageSecond } from '../controllers/uploadsController';
import { normalLoginRequired, adminLoginRequired, transaccionalLoginRequired, allLoginRequired } from '../controllers/usersController';

const routes = new Router();

// !removed routes.get('/searchItem/:searchTerms', searchItem);

// !removed routes.get('/getTopFiveIngresosGananciasGastos', normalLoginRequired, getTopFiveIngresosGananciasGastos);

// !removed routes.get('/getAllItemsSort/:subORtipo/:filtro/:tipoBusqueda/:tipoSort/:limit', getAllItemSort);

// *** GETs INVENTARIO

routes.get('/getTipos', getAllTipos);

routes.get('/getTipo/:codigo', getTipo);

routes.get('/getSubTipos/:tipoCod', getSubTipos);

routes.get('/getItem/:tipo/:codigo', getItem);

routes.get('/getItems', getAllItem);

routes.get('/getItemsDestacados', getItemsDestacados);

routes.get('/getItemsByType/:tipo', getAllItemsOfType);

routes.get('/getItemsSubTipo/:tipo/:subTipo', getAllItemsSubTipoName);

routes.get('/getItemsRelacionados/:tipo/:codigo', getSimilarItems);

routes.get('/getItemsSearch/:searchTerms', searchText);

routes.get('/pdf/:pdfName', getPDF);

routes.get('/getTags', getTags);

routes.get('/marcas/getAll', getMarcas);

routes.get('/getSiteMap', getSiteMapLinks);

// *** POST Inventario

routes.post('/getListOfItemsFilteredByRegex', filterItemsByRegex);

routes.post('/getListOfTagsFilteredByRegex', filterTagsByRegex);

routes.post('/addTipo', transaccionalLoginRequired, addNewTipo);

routes.put('/updateTipo', transaccionalLoginRequired, updateTipoTransac);

routes.put('/addSubTipo', transaccionalLoginRequired, addNewSubTipo);

routes.put('/uptateSupTipos', transaccionalLoginRequired, updateSubTipoTransac);

routes.post('/addItem', normalLoginRequired, addNewItem);

routes.put('/updateItem', transaccionalLoginRequired, updateItem);

// !removed routes.put('/modCant/:tipo', transaccionalLoginRequired, updateCantidad);

routes.post('/addItemReview', allLoginRequired, addItemReview);

routes.post('/addCaracteristica', transaccionalLoginRequired, addCaracteristica);

routes.post('/deteleCaracteristicas', transaccionalLoginRequired, deleteCaracteristica);

routes.post('/addTag', transaccionalLoginRequired, addTag);

routes.post('/deteleTags', transaccionalLoginRequired, deleteTag);

routes.post('/toFavorite', transaccionalLoginRequired, convertToFavorite);

routes.post('/toUnFavorite', transaccionalLoginRequired, deConvertToFavorite);

routes.put('/uploadVariationSC', transaccionalLoginRequired, subCantidadUpdate);

routes.put('/uploadVariationSimple', transaccionalLoginRequired, cantidadUpdate);

// !removed routes.put('/offer/remove', transaccionalLoginRequired, removeOffer);

// !removed routes.put('/offer/add', transaccionalLoginRequired, addOffer);

routes.post('/marcas/add', transaccionalLoginRequired, addMarca);

routes.post('/changeFolder', transaccionalLoginRequired, cambiarItemCarpeta);

routes.post('/reorderItems', transaccionalLoginRequired, reOrderItems);

routes.post('/reorderTipos', transaccionalLoginRequired, reOrderTipo);

routes.post('/reorderSubTipos', transaccionalLoginRequired, reOrderSubTipo);

routes.delete('/deleteItem/:codigo', adminLoginRequired, deleteItem, deleteImageSecond);

routes.delete('/deleteTipo/:codigo', adminLoginRequired, deleteTipoTransac);

routes.delete('/deleteSupTipo/:codigo/:subTipoName', adminLoginRequired, deleteSubTipoTransac);

routes.delete('/marcas/delete/:deleteString', transaccionalLoginRequired, deleteMarcas);

// *** GETs Reportes

routes.get('/getItemMayorGananciaPosible', normalLoginRequired, gananciasPosiblesConItemMayor);

routes.get('/getItemsLowStock', normalLoginRequired, getItemsLowStock);

routes.get('/getItemsNoStock', normalLoginRequired, getItemsNoStock);

routes.get('/getClienteConMasCompras', normalLoginRequired, getClientesConMasCompras);

routes.get('/getItemsMasVendido', normalLoginRequired, getItemsMasVendido);

routes.get('/getGananciasTotalesSNS', normalLoginRequired, getGananciasTotalesSNS);

routes.get('/gananciasInvercionTotal', normalLoginRequired, optenerGastosGananciasTotales);

routes.get('/getPeorMejorItem', normalLoginRequired, getPeorMejorItem);

routes.get('/getVariacionPosnegAll', normalLoginRequired, optenerVariacionPosneg);

routes.get('/ventasPotenciales', normalLoginRequired, optenerVentasPotenciales);

routes.get('/getItemBalance/:codigo', normalLoginRequired, getItemBalance);

routes.get('/getItemReport/:codigo', normalLoginRequired, getItemReport);

routes.get('/getTableInfItem', normalLoginRequired, getTableInfItem);

routes.get('/getItemVentasPorMes/:codigoItem', normalLoginRequired, ventasDeItemPorMesGrafico);

routes.get('/getItemGIC/:codigoItem', normalLoginRequired, getGICofItem);

// *** POST UPLOADS

routes.post('/uploads/image/:codigo', transaccionalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoName);

routes.post('/uploads/imageCat/:codigo', transaccionalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoNameCat);

routes.post('/uploads/imageSubCat/:codigo/:subCat', transaccionalLoginRequired, uploadImage.single('img'), imageUpload, deleteImage, uploadPhotoNameSubCat);

routes.post('/uploads/ficha/:codigo', transaccionalLoginRequired, uploadPDF.single('pdf'), fichaUpload, changeFileStatus);

export default routes;