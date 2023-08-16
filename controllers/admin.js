// const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Noticia = require('../models/noticia');

exports.getAddNoticia = (req, res, next) => {
  res.render('admin/edit-noticia', {
    pageTitle: 'Adicionar Noticia',
    path: '/admin/add-noticia',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddNoticia = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  if (!image) {
    return res.status(422).render('admin/edit-noticia', {
      pageTitle: 'Adicionar Noticia',
      path: '/admin/add-noticia',
      editing: false,
      hasError: true,
      noticia: {
        title: title,
        description: description
      },
      errorMessage: 'Arquivo anexado não é imagem!',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-noticia', {
      pageTitle: 'Adicionar Noticia',
      path: '/admin/add-noticia',
      editing: false,
      hasError: true,
      noticia: {
        title: title,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const noticia = new Noticia({
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    title,
    description,
    imageUrl,
    userId: req.user
  });
  noticia
    .save()
    .then(result => {
      // console.log(result);
      console.log('Noticia criada com sucesso!');
      res.redirect('/admin/noticias');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditNoticia = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const noticiaId = req.params.noticiaId;
  Noticia.findById(noticiaId)
    .then(noticia => {
      if (!noticia) {
        return res.redirect('/');
      }
      res.render('admin/edit-noticia', {
        pageTitle: 'Editar Noticia',
        path: '/admin/edit-noticia',
        editing: editMode,
        noticia: noticia,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditNoticia = (req, res, next) => {
  const noticiaId = req.body.noticiaId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-noticia', {
      pageTitle: 'Editar Noticia',
      path: '/admin/edit-noticia',
      editing: true,
      hasError: true,
      noticia: {
        title: updatedTitle,
        description: updatedDesc,
        _id: noticiaId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Noticia.findById(noticiaId)
    .then(noticia => {
      if (noticia.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      noticia.title = updatedTitle;
      noticia.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(noticia.imageUrl);
        noticia.imageUrl = image.path;
      }
      return noticia.save().then(result => {
        console.log('Notícia Atualizada com Sucesso!');
        res.redirect('/admin/noticias');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getNoticias = (req, res, next) => {
  Noticia.find({ userId: req.user._id })
    .then(noticias => {
      res.render('admin/noticias', {
        noticias,
        pageTitle: 'Admin Noticias',
        path: '/admin/noticias'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteNoticia = (req, res, next) => {
  const noticiaId = req.params.noticiaId;
  Noticia.findById(noticiaId)
    .then(noticia => {
      if (!noticia) {
        return next(new Error('Noticia não Encontrada!'));
      }
      fileHelper.deleteFile(noticia.imageUrl);
      return Noticia.deleteOne({ _id: noticiaId, userId: req.user._id });
    })
    .then(() => {
      console.log('Noticia Excluída com Sucesso!');
      res.status(200).json({ message: 'Successo!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Exclusão de Noticia falhou!' });
    });
};
