import { Router } from 'express';
import { sendConfirmationEmail } from '../controllers/emailController';
import {
	actulizarCelular, agregarDireccion,
	agregarDocumento, allLoginRequired, cambiarContrasena, confirmarContrasena, confirmarUsuario, doTheLogin, emailExits, getLoginInfoFromToken, getUserInfo, googlePreRegistro, isValid, login, loginGoogle, loginUserToken, ps, register, registerUserLow, registerUserLowGooglePreCheck, userExits } from '../controllers/usersController';

const routes = new Router();

// routes.get('/testEmail', sendTestEmail);

routes.use(ps.initialize());

routes.post('/cambiarContrasena', allLoginRequired, cambiarContrasena);

routes.post('/confirmarContr', allLoginRequired, confirmarContrasena);

routes.put('/actCelular', allLoginRequired, actulizarCelular);

routes.put('/actCelular', allLoginRequired, actulizarCelular);

routes.post('/agregarDireccion', allLoginRequired, agregarDireccion);

routes.post('/agregarDocumento', allLoginRequired, agregarDocumento);

routes.post('/register', register);

routes.get('/google/callback', ps.authenticate('google', { failureRedirect: '/failed', session: false }), googlePreRegistro, loginGoogle);

routes.get('/google', ps.authenticate('google', { scope: ['profile', 'email'], session: false }));

routes.post('/login', login);

routes.get('/userEx/:username', userExits);

routes.get('/emailEx/:email', emailExits);

routes.post('/registerlow', registerUserLow, sendConfirmationEmail);

routes.post('/isValid', isValid);

routes.get('/confirmacion/:idUser', confirmarUsuario);

routes.post('/loginfast', loginUserToken, doTheLogin);

routes.post('/loginGoogleRegistro', registerUserLowGooglePreCheck);

routes.post('/getLoginInfoFromToken', getLoginInfoFromToken);

routes.get('/getUserInfo/:username', allLoginRequired, getUserInfo);

export default routes;