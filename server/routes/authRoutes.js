import {Router} from 'express';
import {loginRequired, register, login} from '../controllers/usersController';

const routes = new Router();

routes.post('/register', register);

routes.post('/login', login);

export default routes;