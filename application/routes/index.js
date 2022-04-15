var express = require('express');
var router = express.Router();
var isLoggedIn = require('../middleware/routeprotectors').userIsLoggedIn;
var getRecentPosts = require('../middleware/postsmiddleware').getRecentPosts;
var getCommentsByPostId = require('../middleware/postsmiddleware').getCommentsByPostId;
var printers = require('../helpers/debug/debugprinters');
var db = require("../config/database");
const  getPostById  = require('../middleware/postsmiddleware').getPostById;


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

router.get('/post/:id(\\d+)',getPostById, getCommentsByPostId,(req, res, next) => {
  let baseSQL = "SELECT u.id, u.username, p.title, p.description, p.photopath, p.thumbnail, p.created\
            FROM user u\
            JOIN posts p\
            ON u.id=fk_userId\
            WHERE p.id=?;";

  let postId = req.params.id;
  //server side validation;
  db.execute(baseSQL, [postId])
    .then(([results, fields]) => {
      if (results && results.length == 1) {
        let post = results[0];
        res.render('viewpost', {
          currentPost: post
          
        })
      } else {
        req.flash("error", "This is not the post you are looking for! ");
        res.redirect('/');
      }
    })

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