const express = require('express');

const model = require('../models/participants.js');
const crudController = require('./crudController.js');

/** Create the express router */
const router = express.Router();

/** Exports */
exports = module.exports = router;

/** CRUD Routes */
crudController(router, model, {
  type: 'participants',
  type: 10,
  maxLimit: 100,
  minLimit: 1,
  sortBy: 'id',
  offset: 0
});
