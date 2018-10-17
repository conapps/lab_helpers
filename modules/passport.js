/**
 * middlewares/passport.js
 *
 * Passport middleware to authenticate users with JWT tokens
 */
const passport = require('passport');
const passportLocal = require('passport-local');
const passportJWT = require('passport-jwt');

const auth = require('../modules/auth.js');
/** Get passport strategies */
const JWTStrategy = passportJWT.Strategy
const LocalStrategy = passportLocal.Strategy;

/** Get the ExtractJWT factory */
const ExtractJWT = passportJWT.ExtractJwt;

/** Passport LocalStrategy configuration */
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, cb) {
  let user;
  
  console.log(email, password);

  try {
    user = auth.getUser(email, password);
  } catch(err) {
    return cb(null, false, {
      message: err.message  
    });
  }
  
  if (user === undefined) {
    return cb(null, false, {
      message: 'incorrect email or password'  
    });
  }

  return cb(null, user, {
    message: 'logged in successfully'  
  });
}));
/** Passport JWTStrategy configuration */
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, function(payload, cb) {
  cb(null, {
    id: payload.id,
    email: payload.email,
    username: payload.username,
    role: payload.role
  });  
}));

























