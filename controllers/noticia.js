const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Noticia = require('../models/noticia');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 3;

exports.getNoticia = (req, res, next) => {
  const prodId = req.params.noticiaId;
  Noticia.findById(prodId)
    .then(noticia => {
      res.render('noticia/noticia-detail', {
        noticia: noticia,
        pageTitle: noticia.title,
        path: '/noticias'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Noticia.find()
    .countDocuments()
    .then(numNoticias => {
      totalItems = numNoticias;
      return Noticia.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(noticias => {
      res.render('noticia/index', {
        noticias: noticias,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.noticiaId')
    .execPopulate()
    .then(user => {
      const noticias = user.cart.items;
      res.render('noticia/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        noticias: noticias
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};