const { Router } = require('express');
const cardRoutes = require('./cardRoutes');
const cartRoutes = require('./cartRoutes');

const router = Router();

router.use('/cards', cardRoutes);
router.use('/cart', cartRoutes);

module.exports = router;
