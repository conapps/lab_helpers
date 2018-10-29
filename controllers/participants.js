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

/** Routes **/
router.post('/', (req, res) => {
  const body = req.body;

  if (body === undefined) return utils.handleError(res, '"body" is undefined');

  const labId = body.labId;

  if (labId === undefined)
    return utils.handleError(res, '"labId" is undefined');

  const participant = participants.create(body);

  const lab = labs.get(labId);

  labs.update(lab.id, {
    participants: union(lab.participants, [participant.id])
  });

  return utils.handleSuccess(res, participant);
});

/** CRUD Routes */
crudController(router, participants, {
  type: 'participants',
  type: 10,
  maxLimit: 100,
  minLimit: 1,
  sortBy: 'id',
  offset: 0
});
