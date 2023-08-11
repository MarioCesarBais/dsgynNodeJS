// const path = require('path');

const express = require('express');

const noticiaController = require('../controllers/noticia');
// const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', noticiaController.getIndex);

router.get('/noticias/:noticiaId', noticiaController.getNoticia);

module.exports = router;
