const cloudinary = require('cloudinary').v2;

require('dotenv').config(); // para produção comentar esta linha e informar variáveis de ambiente em settings

const path = require('path');
const fs = require('fs');
// const https = require('https'); # nunca utilizado

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const errorController = require('./controllers/error');
const noticiaController = require('./controllers/noticia');
const isAuth = require('./middleware/is-auth');
const isAdm = require('./middleware/is-adm');
const User = require('./models/user');

// Use as variáveis de ambiente conforme necessário no seu código
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDefaultDatabase = process.env.MONGO_DEFAULT_DATABASE;

const MONGODB_URI = `mongodb+srv://${mongoUser}:${mongoPassword}@cluster0.fzkflsz.mongodb.net/${mongoDefaultDatabase}?retryWrites=true&w=majority`

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
  useUnifiedTopology: true
});
const csrfProtection = csrf();

cloudinary.config({
  cloud_name: process.env.YOUR_CLOUD_NAME,
  api_key: process.env.YOUR_API_KEY,
  api_secret: process.env.YOUR_API_SECRET
});

const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'images', // Especifique a pasta no Cloudinary onde deseja armazenar as imagens
    allowedFormats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const noticiaRoutes = require('./routes/noticia');
const authRoutes = require('./routes/auth');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  multer({ storage, fileFilter }).single('image')
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images'))); // transferido p/ Cloudinary
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.isAdm = (req.session.user && req.session.user.role === 'adm')
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

// app.post('/create-order', isAuth, noticiaController.postOrder);

app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(noticiaRoutes);
app.use(authRoutes);

app.use(errorController.get401);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error)
  const isAuthenticated = req.session ? req.session.isLoggedIn : false
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated
  });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    // https      // # descomentar linha 5
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
      const port = process.env.PORT || 3000
      app.listen(port);
      console.log(`CONECTADO na porta: ${port}`)
  })
  .catch(err => {
    console.log(err);
  });
