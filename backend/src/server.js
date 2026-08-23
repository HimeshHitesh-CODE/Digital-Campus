import app from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(` Digital Campus Backend Server Running   `);
  console.log(` Environment : ${config.nodeEnv}        `);
  console.log(` Port        : ${config.port}           `);
  console.log(` API Base    : http://localhost:${config.port}/api/v1 `);
  console.log(`=========================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
