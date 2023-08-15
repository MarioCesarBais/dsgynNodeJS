module.exports = (req, res, next) => {
    if (!(req.session.user && req.session.user.role === 'adm')) {
        return res.render('401', { pageTitle: 'Operação Não Autorizada', path: '/' });
    }
    next()
}