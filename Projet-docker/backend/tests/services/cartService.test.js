const cartService = require('../../src/services/cartService');
const Card = require('../../src/models/card.model');
const Cart = require('../../src/models/cart.model');
const { connect, disconnect, clearDatabase } = require('../utils/memoryServer');

describe('cartService', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  const createCard = (overrides = {}) =>
    Card.create({
      name: 'Test Card',
      slug: `card-${Math.random().toString(36).slice(2, 8)}`,
      series: 'Base',
      rarity: 'Rare',
      type: 'Fire',
      price: 10,
      stock: 10,
      description: 'Desc',
      imageUrl: 'https://example.com/card.jpg',
      ...overrides,
    });

  describe('addItem', () => {
    it('ajoute une ligne au panier et calcule le total (Core Functionality)', async () => {
      const card = await createCard();
      const sessionId = 'session-core';

      const cart = await cartService.addItem(sessionId, card._id, 2);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.total).toBeCloseTo(20);
      expect(cart.itemCount).toBe(2);
    });

    it('rejette les quantités invalides (Input Validation)', async () => {
      const card = await createCard();
      await expect(cartService.addItem('session-invalid', card._id, 0)).rejects.toThrow('quantité');
    });

    it('renvoie une erreur si la carte est absente (Error Handling)', async () => {
      await expect(cartService.addItem('session-missing', '000000000000000000000000', 1)).rejects.toThrow(
        'Carte introuvable'
      );
    });
  });

  describe('updateItem / removeItem', () => {
    it('met à jour la quantité et supprime quand quantité <= 0 (Side Effects)', async () => {
      const card = await createCard();
      const sessionId = 'session-update';
      await cartService.addItem(sessionId, card._id, 1);

      const updated = await cartService.updateItem(sessionId, card._id, 3);
      expect(updated.items[0].quantity).toBe(3);

      const removed = await cartService.updateItem(sessionId, card._id, 0);
      expect(removed.items).toHaveLength(0);
    });
  });

  describe('checkout', () => {
    it('retourne un orderId et vide le panier (Core + Side Effects)', async () => {
      const card = await createCard({ price: 15 });
      const sessionId = 'session-checkout';
      await cartService.addItem(sessionId, card._id, 2);

      const result = await cartService.checkout(sessionId);

      expect(result.status).toBe('paid');
      expect(result.total).toBe(30);
      expect(result.items).toHaveLength(1);

      const cartAfter = await Cart.findOne({ sessionId });
      expect(cartAfter.items).toHaveLength(0);
    });

    it('refuse un panier vide (Error Handling)', async () => {
      await expect(cartService.checkout('session-empty')).rejects.toThrow('Panier vide');
    });
  });
});
