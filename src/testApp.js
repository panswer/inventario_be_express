const express = require('express');
const cors = require('cors');

function createTestApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(cors());

  app.use('/api', require('./routes/index'));

  return app;
}

module.exports = createTestApp;
