const { Router } = require('express');
const cardController = require('../controllers/cardController');

const router = Router();

router.get('/', cardController.getCards);
router.post('/', cardController.createCard);
router.get('/:cardId', cardController.getCard);
router.delete('/:cardId', cardController.deleteCard);

module.exports = router;
