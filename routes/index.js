var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');

const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(userModel.authenticate()));

// Passport serialization and deserialization
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
  
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login',{error:req.flash('error')});


});

router.get('/feed', function(req, res, next) {
  res.render('feed');
});


router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({

    // saves the user name here
    username: req.session.passport.user
  })
 

  res.render('profile',{user});
});

// Register route
router.post('/register', function(req, res) {
  const { username, email, fullname, password } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, password, function(err, user) {
    if (err) {
      console.error('Error registering user:', err);
      return res.redirect('/register'); // Redirect to register page on error
    }
    passport.authenticate('local')(req, res, function() {
      res.redirect('/profile');
    });
  });
});

// Login route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login' , 
  failureFlash: true 
}), function(req, res) {});

router.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
