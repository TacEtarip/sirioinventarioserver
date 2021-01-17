require('dotenv').config();

import http from 'http';
import throng from 'throng';
import connectDB from '../server/lib/mongoConnection';

import app from '../server/index.js';
import config from '../config/index';

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

throng({worker: start, count: WORKERS});


server.on('listening', () => {
  /*
    const registerService = () => axios.put(`https://siriodinar-registro-ms.herokuapp.com/register/${config.name}/${config.version}/${server.address().port}`)
                                  .catch(err => log.fatal(err));
    
    const unregisterService = () => axios.delete(`https://siriodinar-registro-ms.herokuapp.com/register/${config.name}/${config.version}/${server.address().port}`)
                                  .catch(err => log.fatal(err));

    registerService();

    const interval = setInterval(registerService, 15000);
    
    const cleanup = async () => {
        let clean = false;
        if (!clean) {
          clean = true;
          clearInterval(interval);
          await unregisterService();
        }
    };

    process.on('uncaughtException', async () => {
      await cleanup();
      process.exit(0);
    });
  
    process.on('SIGINT', async () => {
      await cleanup();
      process.exit(0);
    });
  
    process.on('SIGTERM', async () => {
      await cleanup();
      process.exit(0);
    });*/

    log.info(
        `Hi there! I'm listening on port ${server.address().port} in ${app.get('env')} mode.`,
      );
});