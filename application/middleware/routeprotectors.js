const {
    successPrint,
    errorPrint
} = require('../helpers/debug/debugprinters');

const routerProtectors = {};

routerProtectors.userIsLoggedIn = function (req, res, next) {
    if (req.session.username) {
        next();
    } else {
        req.flash('error', 'You must be logged in to created a post');
        req.session.save(function (err) {
            res.redirect('/login');
        });
    }

}

module.exports = routerProtectors;