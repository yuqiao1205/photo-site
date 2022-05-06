var express = require('express');
var router = express.Router();
var printers = require('../helpers/debug/debugprinters')
var UserError = require('../helpers/error/UserError')

const UserModel = require('../models/Users');

const {
  check,
  validationResult
} = require('express-validator');

// register server side validation
router.post('/register',
  check('username', 'This username must be 3+ characters long').isLength({
    min: 3,
    max: 8
  }),
  check('username').matches(/^[a-z]/i).withMessage("Username must  begin with character"),
  check('username').matches(/^[a-z0-9]+$/i).withMessage("Username should contain only alphanumeric characters"),
  check('email').isEmail().normalizeEmail().withMessage("Email is not valid"),
  check('password').isLength({
    min: 8,
    max: 15
  }).withMessage('Password must be at least 8 characters and less than 15 characters'),
  check('password').isStrongPassword({
    minUppercase: 1,
    minNumbers: 1,
  }).withMessage('Password must be contain at least 1 uppercase and 1 number'),
  check('password').matches(/[/*-+!@#$^&*]/).withMessage('Password must contain at least 1 special character'),
  check('cpassword', 'Password not match').exists().custom((value, {
    req
  }) => value === req.body.password),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorFormatter = ({
        msg
      }) => {
        return `Error: ${msg}`;
      };

      const errorsResult = errors.formatWith(errorFormatter);

      let errorMessage = '';
      for (const error of errorsResult.errors) {
        errorMessage += error.msg + ' / ';
      }

      req.flash('error', errorMessage);
      res.status(200);
      req.session.save(function (err) {
        res.redirect('/registration');
      });
      return;
    };

    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    UserModel.usernameExists(username)
      .then((userDoesNameExist) => {
        if (userDoesNameExist) {
          throw new UserError(
            "Registration Faild: Username already exists",
            "/registration",
            200
          );
        } else {
          return UserModel.emailExists(email);
        }
      })
      .then((emailDoesExist) => {
        if (emailDoesExist) {
          throw new UserError(
            "Registration Faild: Email already exists",
            "/registration",
            200
          );
        } else {
          return UserModel.create(username, password, email);
        }
      })
      .then((createdUserId) => {
        if (createdUserId < 0) {
          throw new UserError(
            "Server Error,user could not be created",
            "/registration",
            500
          );
        } else {
          printers.successPrint("User.js -> User was created");
          req.flash('success', 'User account has been made, please login now');
          req.session.save(function (err) {
            res.redirect('/login');
          })
        }
      })
      .catch((err) => {
        printers.errorPrint("User could not made " + err);

        if (err instanceof UserError) {
          printers.errorPrint(err.getMessage());
          req.flash('error', err.getMessage())
          res.status(err.getStatus());
          req.session.save(function (err) {
            res.redirect('/registration');
          });
        } else {
          next(err);
        }
      });
  });

// login server side validation
router.post('/login',
  check('username', 'This username must be 3+ characters long').isLength({
    min: 3,
    max: 8
  }),
  check('username').matches(/^[a-z]/i).withMessage("Username must  begin with character"),
  check('username').matches(/^[a-z0-9]+$/i).withMessage("Username should contain only alphanumeric characters"),
  check('password').isLength({
    min: 8,
    max: 15
  }).withMessage('Password must be at least 8 characters and less than 15 characters'),
  check('password').isStrongPassword({
    minUppercase: 1,
    minNumbers: 1,
  }).withMessage('Password must be contain at least 1 uppercase and 1 number'),
  check('password').matches(/[/*-+!@#$^&*]/).withMessage('Password must contain at least 1 special character'),
  (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorFormatter = ({
        msg
      }) => {
        return `Error: ${msg}`;
      };

      const errorsResult = errors.formatWith(errorFormatter);

      let errorMessage = '';
      for (const error of errorsResult.errors) {
        errorMessage += error.msg + ' / ';
      }

      req.flash('error', errorMessage);
      res.status(200);
      req.session.save(function (err) {
        res.redirect('/login');
      });
      return;
    };

    let username = req.body.username;
    let password = req.body.password;

    UserModel.authenticate(username, password)
      .then((loggedUserId) => {
        console.log(loggedUserId);
        if (loggedUserId > 0) {
          printers.successPrint(`User ${username} is logged in`);

          req.session.username = username;
          req.session.userId = loggedUserId;
          res.locals.logged = true;
          req.flash('success', 'Welcome, you have been successfully logged in!');
          req.session.save(function (err) {
            res.redirect('/');
          });
        } else {
          printers.errorPrint("No user record found!");
          throw new UserError("Invalid username and/or password!", "/login", 200);
        }
      })
      .catch((err) => {
        printers.errorPrint("User login failure, err=" + JSON.stringify(err));

        if (err instanceof UserError) {

          res.status(err.getStatus());

          req.flash('error', err.getMessage());
          req.session.save(function (err) {
            res.redirect("/login");
          });
        } else {
          next(err);
        }
      });
  });

module.exports = router;