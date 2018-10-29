const express = require('express');
const union = require('lodash/union.js');

const utils = require('../modules/utils.js');
const participants = require('../models/participants.js');
const labs = require('../models/labs.js');
const crudController = require('./crudController.js');

/** Create the express router */
const router = express.Router();

/** Exports */
exports = module.exports = router;

/** CRUD Routes */
crudController(router, participants, {
  type: 'participants',
  type: 10,
  maxLimit: 100,
  minLimit: 1,
  sortBy: 'id',
  offset: 0
});
