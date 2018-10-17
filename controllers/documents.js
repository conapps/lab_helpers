/**
 * controllers/documents.js
 *
 * Documents resource controller
 */
const express = require('express');
const cuid = require('cuid');
const isNumber = require('lodash/isNumber');
const omit = require('lodash/omit');

const db = require('../modules/db.js');
const utils = require('../modules/utils.js');
/** Create the express router */
const router = express.Router();

/** Exports */
exports = module.exports = router;

/** Constants */
const TYPE = 'documents'
const LIMIT = 10;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;
const SORT_BY = 'id';
const OFFSET = 0;

/** Routes **/
router.get('/', (req, res) => {
  let { limit = LIMIT, sortBy = SORT_BY, offset = OFFSET } = req.query || {};

  limit = +limit;
  offset = +offset;

  if (!isNumber(limit)) limit = LIMIT;

  if (!isNumber(offset)) offset = OFFSET;

  if (limit > MAX_LIMIT) limit = MAX_COUNT
  if (limit < MIN_LIMIT) limit = MIN_COUNT

  const pointer = db.get(TYPE).sortBy(sortBy)
  const length = pointer.value().length;
  const items = pointer.slice(offset, offset + limit).value();
  
  let next = null;
  let prev = null;

  if (offset > 0) {
    let prevOffset = offset - limit
    if (offset < 0) prevOffset = 0;
    prev = `offset=${prevOffset}&limit=${limit}`;
  }

  if (offset + limit < length) {
    let nextOffset = offset + limit;
    next = `offset=${nextOffset}&limit=${limit}`
  }

  if (prev !== null && sortBy !== SORT_BY) prev += `&sortBy=${sortBy}`;
  if (next !== null && sortBy !== SORT_BY) next += `&sortBy=${sortBy}`;

  const result = utils.makeList(TYPE, items, {next, prev});
  utils.handleSuccess(res, result);
});
router.post('/', (req, res) => {
  let doc = req.body.document !== undefined
    ? req.body.document
    : req.body;

  if (doc === undefined) {
    return utils.handleError(res, '"document" is undefined')
  }

  if (typeof doc === 'string') {
    try {
      doc = JSON.parse(doc);
    } catch (err) {
      return utils.handleError(res, err);
    }
  }
  
  const item = utils.makeItem(TYPE, doc);
  db.get(TYPE).push(item).write();
  return utils.handleSuccess(res, item);
});
router.get('/:id/', (req, res) => {
  const id = req.params.id;

  if (id === undefined) {
    return utils.handleError(res, '"id" is undefined');  
  }

  const item = db.get(TYPE).find({id}).value();
  
  if (item === undefined) {
    return utils.handleError(res, `item with 'id: ${id}' not found`);
  }

  utils.handleSuccess(res, item);
});
router.put('/:id/', (req, res) => {
  const id = req.params.id;

  if (id === undefined) 
    return utils.handleError(res, '"id" is undefined');

  const data  = omit(req.body, 'id');
  
  if (data === undefined)
    return utils.handleError(res, '"data" is undefined');
  
  let item = db.get(TYPE).find({id}).value();
  item = db
    .get(TYPE)
    .find({id})
    .assign(Object.assign(
      {},
      item,
      {
        data: Object.assign({}, item.data, data),
        updated: new Date().toISOString()
      })
    )
    .write();

  utils.handleSuccess(res, item);
});
router.delete('/:id/', (req, res) => {
  const id = req.params.id;

  if (id === undefined)
    return utils.handleError(res, '"id" is undefined');

  db.get(TYPE).remove({id}).write();

  utils.handleSuccess(res, {}, {status: 204});
});




















