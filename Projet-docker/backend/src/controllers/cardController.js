const cardService = require('../services/cardService');

async function getCards(req, res, next) {
  try {
    const cards = await cardService.listCards(req.query);
    res.json({ data: cards, message: 'Catalogue chargé' });
  } catch (error) {
    next(error);
  }
}

async function getCard(req, res, next) {
  try {
    const card = await cardService.getCardByIdentifier(req.params.cardId);
    if (!card) {
      return res.status(404).json({ error: 'Carte introuvable' });
    }
    res.json({ data: card, message: 'Carte récupérée' });
  } catch (error) {
    next(error);
  }
}

async function createCard(req, res, next) {
  try {
    const card = await cardService.createCard(req.body);
    res.status(201).json({ data: card, message: 'Carte créée' });
  } catch (error) {
    next(error);
  }
}

async function deleteCard(req, res, next) {
  try {
    const card = await cardService.deleteCard(req.params.cardId);
    res.json({ data: card, message: 'Carte supprimée' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCards,
  getCard,
  createCard,
  deleteCard,
};
