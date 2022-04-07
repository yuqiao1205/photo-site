var express = require('express');
var router = express.Router();

var printers = require('../helpers/debug/debugprinters')

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('indexx', { title: 'CSC 317 App', name:"Yan Peng" });
// });


router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'index',
    layout: "userlayout"
  });
});

router.get('/registration', function (req, res, next) {
  res.render('registration', {
    title: 'registration'
  });
});

router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'login'
  });
});

router.all('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      printers.errorPrint('session could not be destroyed');
      throw new PostError(
        "Server internal error: failed to clear the session!",
        "/logout",
        500
      );
    } else {
      printers.successPrint("session was destroyed");
      res.clearCookie('csid');
      res.locals.logged = false;
      res.redirect('/');
    }
  });
});

router.get('/user', function (req, res, next) {
  res.render('user', {
    title: 'user',
    layout: "userlayout"
  });
});

router.get('/viewpost', function (req, res, next) {
  res.render('viewpost', {
    title: 'viewpost',
    layout: "userlayout"
  });
});

router.get('/postimage', function (req, res, next) {
  res.render('postimage', {
    title: 'postimage'
  });

});

module.exports = router;