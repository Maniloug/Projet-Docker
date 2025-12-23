const cartService = require('../services/cartService');

const getSessionId = (req) => req.headers['x-session-id'] || req.ip;

async function getCart(req, res, next) {
  try {
    const sessionId = getSessionId(req);
    const cart = await cartService.getCart(sessionId);
    res.json({ data: cart, message: 'Panier chargé' });
  } catch (error) {
    next(error);
  }
}

async function addToCart(req, res, next) {
  try {
    const sessionId = getSessionId(req);
    const { cardId, quantity = 1 } = req.body;
    const cart = await cartService.addItem(sessionId, cardId, quantity);
    res.status(201).json({ data: cart, message: 'Article ajouté au panier' });
  } catch (error) {
    next(error);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const sessionId = getSessionId(req);
    const { quantity } = req.body;
    const cart = await cartService.updateItem(sessionId, req.params.cardId, quantity);
    res.json({ data: cart, message: 'Quantité mise à jour' });
  } catch (error) {
    next(error);
  }
}

async function removeCartItem(req, res, next) {
  try {
    const sessionId = getSessionId(req);
    const cart = await cartService.removeItem(sessionId, req.params.cardId);
    res.json({ data: cart, message: 'Article retiré du panier' });
  } catch (error) {
    next(error);
  }
}

async function checkout(req, res, next) {
  try {
    const sessionId = getSessionId(req);
    const result = await cartService.checkout(sessionId);
    res.json({ data: result, message: 'Paiement simulé avec succès' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  checkout,
};
