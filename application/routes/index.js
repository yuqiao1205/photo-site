var express = require('express');
var router = express.Router();
var isLoggedIn = require('../middleware/routeprotectors').userIsLoggedIn;
const {
  getRecentPosts,
  getPostById,
  getCommentsByPostId
} = require('../middleware/postsmiddleware');
const printers = require('../helpers/debug/debugprinters');
const db = require("../config/database");

router.get('/', getRecentPosts, function (req, res, next) {
  res.render('index', {
    title: 'index',
  });
});

router.get('/registration', function (req, res, next) {
  res.render('registration', {
    title: 'registration',
    layout: "formlayout"
  });
});

router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'login',
    layout: "formlayout"
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

router.get('/post/:id(\\d+)', getPostById, getCommentsByPostId, (req, res, next) => {
  res.render('viewpost', {
    title: `Post ${req.params.id}`
  
  });

});

router.get('/post/help', (req, res, next) => {
  res.send({
    literal: 'literal help'
  });
});

router.use('/postimage', isLoggedIn);
router.get('/postimage', (req, res, next) => {
  res.render('postimage', {
    title: 'Post an Image',
    layout: "formlayout"
  });
});

module.exports = router;