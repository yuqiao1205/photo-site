const routerProtectors = {}; 

routerProtectors.userIsLoggedIn = function (req, res, next) {
    if (req.session.username) {
        next();
    } else {
        req.flash('error', 'You must be logged in to create a post!');
        req.session.save(function (err) {
            if(err){
                res.end(err);
            }
            res.redirect('/login');
        });
    }
}

module.exports = routerProtectors;