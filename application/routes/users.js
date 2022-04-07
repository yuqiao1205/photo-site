var express = require('express');
var router = express.Router();
var db = require("../config/database");
var printers = require('../helpers/debug/debugprinters')
var UserError = require('../helpers/error/UserError')
var bcrypt = require('bcrypt')

const bodyParser = require('body-parser')
const {
  check,
  validationResult
} = require('express-validator');
const {
  restart
} = require('nodemon');

const urlencodedParser = bodyParser.urlencoded({
  extended: false
})

/* GET users listing. */
// router.get('/', function (req, res, next) {
//   res.send('respond with a resource');
// });

/* retister server side validation*/
router.post('/register',
  check('username', 'This username must be 3+ characters long').exists().isLength({
    min: 3,
    max: 8
  }),
  check('username').matches(/^[a-z]/i).withMessage("must begin with character"),
  check('username').matches(/^[a-z0-9]+$/i).withMessage("only alphanumeric characters"),
  check('email', 'Email is not valid').isEmail().normalizeEmail(),
  check('password', 'Password is not valid').exists().isLength({
    min: 8,
    max: 15
  }),
  check('password').isStrongPassword({
    minUppercase: 1,
    minNumbers: 1
  }),
  check('password').matches(/[/*-+!@#$^&*]/),
  check('cpassword', 'Password not match').exists().custom((value, {
    req
  }) => value === req.body.password),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // res.redirect("/registration");
      //  res.send("email already exists");
      res.render('registration', {
        title: 'registration',
        errors: "might be some data is invalid or email/username already exits",
        username: req.body.username,
        email: req.body.email
      });
    };

    console.log(req.body);

    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let cpassword = req.body.cpassword;


    db.execute("SELECT * FROM user WHERE username=?", [username])
      .then(([results, fields]) => {
        if (results && results.length == 0) {
          return db.execute("SELECT * FROM user WHERE email=?", [email]);
        } else {
          throw new UserError(
            "Registration Faild: Username already exists",
            "/login",
            200
          );
        }
      })
      .then(([results, fields]) => {
        if (results && results.length == 0) {
          return bcrypt.hash(password, 15)

        } else {
          throw new UserError(
            "Registration Faild: Email already exists",
            "/registration",
            200
          );
        }
      })

      .then((hashedPassword) => {

        let baseSQL = "INSERT INTO user (username,email,password,created) VALUES (?,?,?,now());"
        return db.execute(baseSQL, [username, email, hashedPassword])

      })
      .then(([results, field]) => {
        if (results && results.affectedRows) {
          printers.successPrint("User.js -> User was created");
          req.flash('success','User account has been made!');
          res.redirect('/login');
        } else {
          throw new UserError(
            "Server Error,user could not becreated",
            "/registration",
            500 
          );
        }
      })
      .catch((err) => {
        printers.errorPrint("Cannot register user due to error!", err);

        if (err instanceof UserError) {
          printers.errorPrint(err.getMessage());
          req.flash('error',err.getMessage());
          res.status(err.getStatus());
          res.redirect(err.getRedirectURL());
        } else {
          next(err);
        }

      });
  });

// router.get('/logout', function (req, res, next) {
//   res.redirect('/');
// });

router.post('/login', (req, res, next) => {
  // console.log(req.body);
  // res.send(req.body);

  let username = req.body.username;
  let password = req.body.password;

  /**do server side validation */

  let baseSQL = "SELECT id, username, password FROM user WHERE username=?;"
  let userId;
  db.execute(baseSQL, [username])
    .then(([results, field]) => {
      if (results && results.length == 1) {
        let hashedPassword = results[0].password;
        userId = results[0].id;
       
        return bcrypt.compare(password, hashedPassword)

      } else {
        throw new UserError("invalid username and/or password", "/login", 200);
      }
    })
    .then((passwordsMatched) => {
      if (passwordsMatched) {
        printers.successPrint(`User ${username}/${userId} is logged in`);
       
        req.session.username = username;
        req.session.userid = userId;
        res.locals.logged = true;

        req.flash('success','You have been successfully Logged in!');
        res.render('index', {
          title: "Index",
          layout: "userlayout",
          logged: true
        });
      } else {
        throw new UserError("Invalid username and/or password", "/login", 200);
      }
    })
    .catch((err) => {
      printers.errorPrint("user login failed");

      if (err instanceof UserError) {
        printers.errorPrint(err.getMessage());

        req.flash('error', err.getMessage());
        res.status(err.getStatus());
        res.redirect('/login')
        // res.render('login', {
        //   title: 'login',
        //   errors: "username and/or password not exist,try again",
        //   username: username
        // });
      } else {
        next(err);
      }
    });
});

module.exports = router;