const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Noticia = require('../models/noticia');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 6;

exports.getNoticias = (req, res, next) => {
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
      res.render('noticia/noticia-list', {
        noticias,
        pageTitle: 'Noticias',
        path: '/noticias',
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
        pageTitle: 'Notícias',
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

// exports.getCart = (req, res, next) => {
//   req.user
//     .populate('cart.items.noticiaId')
//     .execPopulate()
//     .then(user => {
//       const noticias = user.cart.items;
//       res.render('noticia/cart', {
//         path: '/cart',
//         pageTitle: 'Your Cart',
//         noticias: noticias
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.postCart = (req, res, next) => {
//   const prodId = req.body.noticiaId;
//   Noticia.findById(prodId)
//     .then(noticia => {
//       return req.user.addToCart(noticia);
//     })
//     .then(result => {
//       console.log(result);
//       res.redirect('/cart');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.postCartDeleteNoticia = (req, res, next) => {
//   const prodId = req.body.noticiaId;
//   req.user
//     .removeFromCart(prodId)
//     .then(result => {
//       res.redirect('/cart');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.getCheckout = (req, res, next) => {
//   req.user
//     .populate('cart.items.noticiaId')
//     .execPopulate()
//     .then(user => {
//       const noticias = user.cart.items;
//       let total = 0;
//       noticias.forEach(p => {
//         total += p.quantity * p.noticiaId.price;
//       });
//       res.render('noticia/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout',
//         noticias: noticias,
//         totalSum: total
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.postOrder = (req, res, next) => {
//   // Token is created using Checkout or Elements!
//   // Get the payment token ID submitted by the form:
//   const token = req.body.stripeToken; // Using Express
//   let totalSum = 0;

//   req.user
//     .populate('cart.items.noticiaId')
//     .execPopulate()
//     .then(user => {  
//       user.cart.items.forEach(p => {
//         totalSum += p.quantity * p.noticiaId.price;
//       });

//       const noticias = user.cart.items.map(i => {
//         return { quantity: i.quantity, noticia: { ...i.noticiaId._doc } };
//       });
//       const order = new Order({
//         user: {
//           email: req.user.email,
//           userId: req.user
//         },
//         noticias: noticias
//       });
//       return order.save();
//     })
//     .then(result => {
//       const charge = stripe.charges.create({
//         amount: totalSum * 100,
//         currency: 'usd',
//         description: 'Demo Order',
//         source: token,
//         metadata: { order_id: result._id.toString() }
//       });
//       return req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect('/orders');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.getOrders = (req, res, next) => {
//   Order.find({ 'user.userId': req.user._id })
//     .then(orders => {
//       res.render('noticia/orders', {
//         path: '/orders',
//         pageTitle: 'Your Orders',
//         orders: orders
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// exports.getInvoice = (req, res, next) => {
//   const orderId = req.params.orderId;
//   Order.findById(orderId)
//     .then(order => {
//       if (!order) {
//         return next(new Error('No order found.'));
//       }
//       if (order.user.userId.toString() !== req.user._id.toString()) {
//         return next(new Error('Unauthorized'));
//       }
//       const invoiceName = 'invoice-' + orderId + '.pdf';
//       const invoicePath = path.join('data', 'invoices', invoiceName);

//       const pdfDoc = new PDFDocument();
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader(
//         'Content-Disposition',
//         'inline; filename="' + invoiceName + '"'
//       );
//       pdfDoc.pipe(fs.createWriteStream(invoicePath));
//       pdfDoc.pipe(res);

//       pdfDoc.fontSize(26).text('Invoice', {
//         underline: true
//       });
//       pdfDoc.text('-----------------------');
//       let totalPrice = 0;
//       order.noticias.forEach(prod => {
//         totalPrice += prod.quantity * prod.noticia.price;
//         pdfDoc
//           .fontSize(14)
//           .text(
//             prod.noticia.title +
//               ' - ' +
//               prod.quantity +
//               ' x ' +
//               '$' +
//               prod.noticia.price
//           );
//       });
//       pdfDoc.text('---');
//       pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

//       pdfDoc.end();
//       // fs.readFile(invoicePath, (err, data) => {
//       //   if (err) {
//       //     return next(err);
//       //   }
//       //   res.setHeader('Content-Type', 'application/pdf');
//       //   res.setHeader(
//       //     'Content-Disposition',
//       //     'inline; filename="' + invoiceName + '"'
//       //   );
//       //   res.send(data);
//       // });
//       // const file = fs.createReadStream(invoicePath);

//       // file.pipe(res);
//     })
//     .catch(err => next(err));
// };
