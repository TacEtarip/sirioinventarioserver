import { Router } from 'express';
import { 
    allLoginRequired, register, login, callBackGoogle, 
    googleExito, loginGoogle, ps, userExits, emailExits, registerUserLow, 
    isValid, confirmarUsuario, loginUserToken, doTheLogin, googlePreRegistro, 
    getLoginInfoFromToken, getUserInfo, actulizarCelular, agregarDireccion, 
    agregarDocumento, confirmarContrasena, cambiarContrasena } from '../controllers/usersController';
import { sendConfirmationEmail } from '../controllers/emailController';

const routes = new Router();


routes.use(ps.initialize());

routes.post('/cambiarContrasena', allLoginRequired, cambiarContrasena);

routes.post('/confirmarContr', allLoginRequired, confirmarContrasena);

routes.put('/actCelular', allLoginRequired, actulizarCelular);

routes.put('/actCelular', allLoginRequired, actulizarCelular);

routes.post('/agregarDireccion', allLoginRequired, agregarDireccion);

routes.post('/agregarDocumento', allLoginRequired, agregarDocumento);

routes.post('/register', register);

routes.get('/google/callback', ps.authenticate('google', { failureRedirect: '/failed', session: false }), googlePreRegistro, loginGoogle);

routes.get('/google', ps.authenticate('google', { scope: ['profile', 'email'], session: false}));

routes.post('/login', login);

routes.get('/userEx/:username', userExits);

routes.get('/emailEx/:email', emailExits);

routes.post('/registerlow', registerUserLow, sendConfirmationEmail);

routes.post('/isValid', isValid);

routes.get('/confirmacion/:idUser', confirmarUsuario);

routes.post('/loginfast', loginUserToken, doTheLogin);

routes.post('/getLoginInfoFromToken', getLoginInfoFromToken);

routes.get('/getUserInfo/:username', allLoginRequired, getUserInfo);

export default routes;