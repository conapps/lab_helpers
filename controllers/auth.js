/**
 * controllers/auth.js
 * 
 * Authentication controller.
 */
const express = require('express');
const jwt = require('jsonwebtoken');

const utils = require('../modules/utils.js');
const auth = require('../modules/auth.js');
/** Create the express Router */
const router = express.Router()

/** Exports */
exports = module.exports = router;

/** Routes */
router.get('/', (req, res) => {
  utils.handleSuccess(res, {
    "login": "/helpers/api/auth/login/",
    "signup": "/helpers/api/auth/signup/"
  });  
});

router.post('/login/', (req, res) => {
  const {email, password} = req.body;
  
  let user;
  
  try {
    user = auth.getUser(email, password);  
  } catch(err) {
    return utils.handleError(res, err);  
  }

  const idToken = jwt.sign(user, process.env.JWT_SECRET);
  const accessToken = jwt.sign({}, process.env.JWT_SECRET);
      
  return utils.handleSuccess(res, {
    user,
    idToken,
    accessToken
  });
});

router.post('/signup/', (req, res) => {
  const {email, password, username, name, role = 'admin'} = req.body;

  if (email === undefined) 
    return utils.handleError(res, '"email" is undefined');

  if (password === undefined)
    return utils.handleError(res, '"password" is undefined');
  try {
    auth.createUser({email, password, username, name, role});
  } catch (err) {
    return utils.handleError(res, err);  
  }
  utils.handleSuccess(res, {}, {status: 201});
});















