const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Senha e e-mail devem ser válidos!')
      .normalizeEmail(),
    body('password', 'Senha e e-mail devem ser válidos!')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('or favor digite e-mail válido!')
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail já está inscrito, por favor escolha outro e-mail!'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'A senha apenas deve: a) conter no mínimo 5 caracteres; e b) os caracteres somente podem ser alfanuméricos!'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Senha e confirmação devem ser as mesmas!');
        }
        return true;
      })
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

router.get('/confirm/:token', authController.confirmSignUp)

// router.get('/confirm/:token', (req, res, next) => {
//   const token = req.params.token;

//   User.findOneAndUpdate(
//     { confirmationToken: token },
//     { $set: { confirmationToken: null } } // Remove o token de confirmação
//   )
//     .then(user => {
//       if (!user) {
//         console.log('Erro na atualização do token: expirado ou inválido!')
//       }

//       // Redirecione ou renderize uma página de confirmação bem-sucedida
//     res.redirect('/login');
//     })
//     .catch(err => {
//       // Trate erros
//       console.log('Erro na confirmação de inscrição:', err)
//     });
// });


module.exports = router;
