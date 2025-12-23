const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const apiRouter = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint pour Docker
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'pokeboutique-api'
  });
});

app.use('/api', apiRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Ressource introuvable' });
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
  });
});

module.exports = app;
