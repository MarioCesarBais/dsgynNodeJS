exports.get401 = (req, res, next) => {
  res.status(401).render('401', {
    pageTitle: 'Operação Não Autorizada!',
    path: '/401',
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Página Não Encontrada!',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Erro!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
};
