/**
 * controllers/crudController.js
 *
 * Función que incluye rutas típicas para un controlador CRUD.
 */
const isNumber = require('lodash/isNumber');

const db = require('../modules/db.js');
const utils = require('../modules/utils.js');

exports = module.exports = crudController;

function crudController(app, model, options = {}) {
  /** Constants */
  const TYPE = options.type || 'documents';
  const LIMIT = options.limit || 10;
  const MAX_LIMIT = options.maxLimit || 100;
  const MIN_LIMIT = options.minLimit || 1;
  const SORT_BY = options.sortBy || 'id';
  const OFFSET = options.offset || 0;
  /** Index */
  app.get('/', (req, res) => {
    let { limit = LIMIT, sortBy = SORT_BY, offset = OFFSET } = req.query || {};

    limit = +limit;
    offset = +offset;

    if (!isNumber(limit)) limit = LIMIT;

    if (!isNumber(offset)) offset = OFFSET;

    if (limit > MAX_LIMIT) limit = MAX_COUNT;
    if (limit < MIN_LIMIT) limit = MIN_COUNT;

    const items = model.index(sortBy, offset, limit);
    const count = model.count;

    let next = null;
    let prev = null;

    if (offset > 0) {
      let prevOffset = offset - limit;
      if (offset < 0) prevOffset = 0;
      prev = `offset=${prevOffset}&limit=${limit}`;
    }

    if (offset + limit < count) {
      let nextOffset = offset + limit;
      next = `offset=${nextOffset}&limit=${limit}`;
    }

    if (prev !== null && sortBy !== SORT_BY) prev += `&sortBy=${sortBy}`;
    if (next !== null && sortBy !== SORT_BY) next += `&sortBy=${sortBy}`;

    const result = utils.makeList(TYPE, items, { next, prev });

    utils.handleSuccess(res, result);
  });
  /** Create */
  app.post('/', (req, res) => {
    const body = req.body;

    if (body === undefined) {
      return utils.handleError(res, '"body" is undefined');
    }

    const item = model.create(body);

    return utils.handleSuccess(res, item);
  });
  /** Show */
  app.get('/:id/', (req, res) => {
    const id = req.params.id;

    let item;

    try {
      item = model.get(id);
    } catch (err) {
      console.error(err);
      return utils.handleError(res, err.message);
    }

    if (item === undefined) {
      return utils.notFound(res);
    }

    utils.handleSuccess(res, item);
  });
  /** Update */
  app.put('/:id/', (req, res) => {
    const id = req.params.id;
    const body = req.body;

    let item;

    try {
      item = model.update(id, body);
    } catch (err) {
      console.error(err);
      return utils.handleError(res, err.message);
    }

    utils.handleSuccess(res, item);
  });
  /** Delete */
  app.delete('/:id/', (req, res) => {
    const id = req.params.id;

    try {
      model.remove(id);
    } catch (err) {
      console.error(err);
      return utils.handleError(res, err.message);
    }

    utils.noContent(res);
  });
  /** Return app */
  return app;
}
