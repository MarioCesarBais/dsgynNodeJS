const path = require('path');

const express = require('express');

const noticiaController = require('../controllers/noticia');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', noticiaController.getIndex);

router.get('/', noticiaController.getNoticias);

router.get('/noticias/:noticiaId', noticiaController.getNoticia);

router.get('/cart', isAuth, noticiaController.getCart);

router.post('/cart', isAuth, noticiaController.postCart);

router.post('/cart-delete-item', isAuth, noticiaController.postCartDeleteNoticia);

router.get('/checkout', isAuth, noticiaController.getCheckout);

router.get('/orders', isAuth, noticiaController.getOrders);

router.get('/orders/:orderId', isAuth, noticiaController.getInvoice);

module.exports = router;
