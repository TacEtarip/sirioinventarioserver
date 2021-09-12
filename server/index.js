import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import path from 'path';
import tinyfy from 'tinify';
import config from '../config/index';
import authRoutes from './routes/authRoutes';
import carritoRoutes from './routes/carritoRoutes';
import cotiRoutes from './routes/cotiRoutes';
import emailrouter from './routes/emailRoutes';
import inventarioRoutes from './routes/inventarioRoutes';
import ventasRoutes from './routes/ventaRoutes';
import swaggerUI from 'swagger-ui-express';
import swaggerDoc from './documentation/swaggerDocument.json';
import morgan from 'morgan';
// import swaggerJsDoc from 'swagger-jsdoc';

tinyfy.key = config[process.env.NODE_ENV].tinyKey;

/* const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Sirio Dinar Inventario API',
			version: config[process.env.NODE_ENV].version,
			description: 'Rest API para el uso del inventari de la empresa Sirio Dinar. ' +
			'Front End: https://inventario.siriodinar.com/',
		},
		servers: [
			{
				url: 'https://inventario-sirio-dinar.herokuapp.com',
			},
			{
				url: 'http://localhost:5000',
			},
		],
	},
	apis: [path.resolve(__dirname, './routes/*.js')],
};*/

// const specs = swaggerJsDoc(swaggerOptions);

const app = express();


const log = config[process.env.NODE_ENV].log();

app.use(helmet());
app.use(compression());
app.use(cookieParser());

app.use(morgan(':method :url'));

app.options('*', cors({ credentials: true, origin: config[process.env.NODE_ENV].origin }));
app.use(cors({ credentials: true, origin: config[process.env.NODE_ENV].origin }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
	if (req.headers && req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'JWT') {
		const auth = req.headers.authorization;
		jwt.verify(auth.split(' ')[1], config[process.env.NODE_ENV].jwtKey,
			{ audience: auth.split(' ')[2] + ' ' + auth.split(' ')[3] }, (err, decode) => {
				if (err) {
					req.user = undefined;
					return res.status(401).json({ message: 'Usuario No Autorizado' });
				}
				else {
					req.user = decode;
				}
				next();
			});
	}
	else {
		req.user = undefined;
		next();
	}
});

app.use('/inventario', inventarioRoutes);
app.use('/carrito', carritoRoutes);
app.use('/auth', authRoutes);
app.use('/ventas', ventasRoutes);
app.use('/email', emailrouter);
app.use('/coti', cotiRoutes);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

app.use('/static', express.static(path.join(__dirname, 'uploads')));

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	log.error(error);
	log.info(error);
	return res.json({
		error: {
			message: error.message,
		},
	});
});

export default app;