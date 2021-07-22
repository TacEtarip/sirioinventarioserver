require('dotenv').config();

import http from 'http';
import throng from 'throng';
import config from '../config/index';
import app from '../server/index.js';
import connectDB from '../server/lib/mongoConnection';


const server = http.createServer(app);

const PORT = config[process.env.NODE_ENV].PORT;

const log = config[process.env.NODE_ENV].log();

const WORKERS = process.env.WEB_CONCURRENCY || 1;

app.set('port', PORT);

const start = (id, disconnect) => {
	log.info(`Id Worker ${id}`);
	server.listen(PORT || 0);
	connectDB(config[process.env.NODE_ENV].mongoKey);
};

throng({ worker: start, count: WORKERS });


server.on('listening', () => {
	log.info(
		`Hi there! I'm listening on port ${server.address().port} in ${app.get('env')} mode.`,
	);
});