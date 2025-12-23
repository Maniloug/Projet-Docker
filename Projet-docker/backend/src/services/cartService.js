const Cart = require('../models/cart.model');
const Card = require('../models/card.model');

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const isSameCard = (lineCard, cardId) => {
  if (!lineCard) return false;
  if (typeof lineCard.equals === 'function') {
    return lineCard.equals(cardId);
  }
  return lineCard._id?.equals(cardId);
};

async function ensureCart(sessionId) {
  if (!sessionId) {
    throw createHttpError('Identifiant de panier manquant', 400);
  }

  let cart = await Cart.findOne({ sessionId }).populate('items.card');
  if (!cart) {
    cart = await Cart.create({ sessionId, items: [] });
    await cart.populate('items.card');
  }
  const validItems = cart.items.filter((item) => Boolean(item.card));
  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
    await cart.populate('items.card');
  }
  return cart;
}

function formatCart(cart) {
  const items = cart.items
    .filter((item) => Boolean(item.card))
    .map((item) => {
      const card = item.card?.toObject ? item.card.toObject() : item.card;
      const quantity = item.quantity || 0;
      const lineTotal = Number(card.price || 0) * quantity;
      return {
        card,
        quantity,
        lineTotal,
      };
    });
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    sessionId: cart.sessionId,
    items,
    total,
    itemCount,
  };
}

async function getCart(sessionId) {
  const cart = await ensureCart(sessionId);
  return formatCart(cart);
}

async function addItem(sessionId, cardId, quantity = 1) {
  if (quantity <= 0) {
    throw createHttpError('La quantité doit être positive');
  }

  const [cart, card] = await Promise.all([
    ensureCart(sessionId),
    Card.findById(cardId),
  ]);

  if (!card) {
    throw createHttpError('Carte introuvable', 404);
  }

  const existingLine = cart.items.find((line) => isSameCard(line.card, cardId));
  if (existingLine) {
    existingLine.quantity += quantity;
  } else {
    cart.items.push({ card: card._id, quantity });
  }

  await cart.save();
  await cart.populate('items.card');
  return formatCart(cart);
}

async function updateItem(sessionId, cardId, quantity) {
  if (quantity <= 0) {
    return removeItem(sessionId, cardId);
  }

  const cart = await ensureCart(sessionId);
  const line = cart.items.find((item) => isSameCard(item.card, cardId));

  if (!line) {
    throw createHttpError('Article introuvable dans le panier', 404);
  }

  line.quantity = quantity;
  await cart.save();
  await cart.populate('items.card');
  return formatCart(cart);
}

async function removeItem(sessionId, cardId) {
  const cart = await ensureCart(sessionId);
  cart.items = cart.items.filter((item) => !isSameCard(item.card, cardId));
  await cart.save();
  await cart.populate('items.card');
  return formatCart(cart);
}

async function clearCart(sessionId) {
  const cart = await ensureCart(sessionId);
  cart.items = [];
  await cart.save();
}

async function checkout(sessionId) {
  const cart = await ensureCart(sessionId);
  if (cart.items.length === 0) {
    throw createHttpError('Panier vide, impossible de simuler le paiement', 400);
  }

  const summary = formatCart(cart);
  const orderId = `POKE-${Date.now()}`;

  cart.items = [];
  await cart.save();

  return {
    status: 'paid',
    orderId,
    total: summary.total,
    items: summary.items,
  };
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  checkout,
};
