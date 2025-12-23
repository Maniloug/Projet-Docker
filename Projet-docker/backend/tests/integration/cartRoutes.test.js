const request = require('supertest');
const app = require('../../src/app');
const Card = require('../../src/models/card.model');
const { connect, disconnect, clearDatabase } = require('../utils/memoryServer');

const SESSION_HEADER = { 'x-session-id': 'integration-session' };

describe('API Cart routes', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  const createCard = () =>
    Card.create({
      name: 'Integration Card',
      slug: `integration-card-${Math.random().toString(36).slice(2, 8)}`,
      series: 'Base',
      rarity: 'Common',
      type: 'Water',
      price: 12,
      stock: 5,
      description: 'Integration desc',
      imageUrl: 'https://example.com/integration.jpg',
    });

  it('GET /api/cart renvoie un panier vide mais valide (Core Functionality)', async () => {
    const response = await request(app).get('/api/cart').set(SESSION_HEADER).expect(200);

    expect(response.body.data).toMatchObject({ items: [], total: 0, itemCount: 0 });
  });

  it('POST /api/cart ajoute une carte et calcule le total (Side Effects)', async () => {
    const card = await createCard();

    await request(app)
      .post('/api/cart')
      .set(SESSION_HEADER)
      .send({ cardId: card._id.toString(), quantity: 2 })
      .expect(201);

    const response = await request(app).get('/api/cart').set(SESSION_HEADER).expect(200);

    expect(response.body.data.total).toBe(24);
    expect(response.body.data.items[0].quantity).toBe(2);
  });

  it('POST /api/cart/checkout refuse les paniers vides (Error Handling)', async () => {
    const response = await request(app).post('/api/cart/checkout').set(SESSION_HEADER).expect(400);
    expect(response.body.error).toMatch(/Panier vide/);
  });
});
