require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectToDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectToDatabase();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Backend en écoute sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Impossible de démarrer le serveur', error);
    process.exit(1);
  }
}

start();
