require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Card = require('../src/models/card.model');
const { connectToDatabase } = require('../src/config/db');

const seedCards = [
  {
    name: 'Pikachu V',
    slug: 'pikachu-v',
    series: 'Sword & Shield',
    rarity: 'Ultra Rare',
    type: 'Electric',
    price: 24.99,
    stock: 20,
    description: 'Un Pikachu V voltigeur prêt à électriser vos adversaires.',
    imageUrl:
      'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.3Vt_bJQ0pWbsS-FFDlsuaQHaKV%3Fpid%3DApi&f=1&ipt=70ec5e1ad7686b0bd4694b7ec5fe26a8f0e957f8ac9cee57c9c87cea6f64e0cd&ipo=images',
    tags: ['starter deck', 'promo'],
    metadata: { hp: 200, abilities: ['Thunderbolt'], weakness: 'Ground' },
  },
  {
    name: 'Charizard GX',
    slug: 'charizard-gx',
    series: 'Sun & Moon',
    rarity: 'Secret Rare',
    type: 'Fire',
    price: 199.99,
    stock: 5,
    description: 'Le dracaufeu légendaire dans une version GX flamboyante.',
    imageUrl:
      'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.fh2Zm7QxyDsnNz0kEs4GcQHaJp%3Fpid%3DApi&f=1&ipt=888750f1d20947c32173cd4bb612811dc31aa82f668bdb3fbd0789bc76c1598c&ipo=images',
    tags: ['ultra-rare'],
    metadata: { hp: 250, abilities: ['Crimson Storm'], weakness: 'Water' },
  },
];

async function run() {
  await connectToDatabase();
  await Card.deleteMany();
  await Card.insertMany(seedCards);
  console.log('Base peuplée avec succès');
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error('Erreur lors du seed', error);
  process.exit(1);
});
