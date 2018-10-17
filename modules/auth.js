/**
 * modules/auth.js
 *
 * Handles authentication actions.
 */
const bcrypt = require('bcrypt-nodejs');
const omit = require('lodash/omit.js');

const db = require('./db.js');

/** Constants */
const TYPE = 'users';
const CHARS = 10;

/** Module definition */
exports = module.exports = {
  createUser: function (user) {
    const {email, password} = user;
    const existingUser = db.get(TYPE).find({email}).value();

    if (existingUser !== undefined)
      throw new Error('user exists');

    if (password === undefined)
      throw new Error('"password" is undefined');

    user.password = bcrypt.hashSync(password);

    db.get(TYPE).push(user).write();

    return user;
  },
  getUser: function(email, password) {
    const user = db.get(TYPE).find({email}).value();

    if (bcrypt.compareSync(password, user.password) === false)
      throw new Error('invalid credentials');

    return omit(user, 'password');
  }
}
