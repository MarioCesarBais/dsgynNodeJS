const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-noticia => GET
router.get('/add-noticia', isAuth, adminController.getAddNoticia);

// /admin/noticias => GET
router.get('/noticias', isAuth, adminController.getNoticias);

// /admin/add-noticia => POST
router.post(
  '/add-noticia',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddNoticia
);

router.get('/edit-noticia/:noticiaId', isAuth, adminController.getEditNoticia);

router.post(
  '/edit-noticia',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),

    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditNoticia
);

router.delete('/noticia/:noticiaId', isAuth, adminController.deleteNoticia);

module.exports = router;
