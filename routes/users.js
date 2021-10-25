const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => res.render('login'));

// Register page
router.get('/register', (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'All of the fields are required to register' });
  }
  // Check if passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords must match' });
  }
  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then(user => {
      if (user) {
        // User exists
        errors.push({ msg: 'A user with that email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
        // Hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hash password
            newUser.password = hash;
            // Save user
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'Account has been created successfully. Please use the login form below to login.'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          })
        );
      }
    });
  }
});

// Login handler
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout handler
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Successfully logged out');
  res.redirect('/users/login');
});

module.exports = router;
