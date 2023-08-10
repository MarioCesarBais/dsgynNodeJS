module.exports = (req, res, next) => {
    if (!(req.session.user && req.session.user.role === 'adm')) {
        return res.redirect('/login');
    }
    next();
}