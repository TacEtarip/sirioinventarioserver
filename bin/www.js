require('dotenv').config();

import http from 'http';
import throng from 'throng';

import app from '../server/index.js';
import config from '../config/index';

const server = http.createServer(app);

const PORT = config.develoment.PORT;

const log = config.develoment.log();

const WORKERS = process.env.WEB_CONCURRENCY || 1;

app.set('port', PORT);

const start = () => {
  server.listen(PORT || 0);
};

throng({
  workers: WORKERS,
  lifetime: Infinity,
},  start);



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