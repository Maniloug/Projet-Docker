const mongoose = require('mongoose');

const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/pokemon_cards';

  if (!mongoUri) {
    throw new Error('La variable MONGO_URI est obligatoire');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri);
  console.log('Connexion MongoDB établie');
};

module.exports = { connectToDatabase };
