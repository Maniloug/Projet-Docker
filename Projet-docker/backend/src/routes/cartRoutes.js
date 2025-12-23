const { Router } = require('express');
const cartController = require('../controllers/cartController');

const router = Router();

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.post('/checkout', cartController.checkout);
router.put('/:cardId', cartController.updateCartItem);
router.delete('/:cardId', cartController.removeCartItem);

module.exports = router;
