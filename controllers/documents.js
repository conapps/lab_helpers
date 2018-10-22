/**
 * controllers/documents.js
 *
 * Documents resource controller
 */
const express = require('express');
const isNumber = require('lodash/isNumber');

const db = require('../modules/db.js');
const utils = require('../modules/utils.js');
const model = require('../models/documents.js');
/** Create the express router */
const router = express.Router();

/** Exports */
exports = module.exports = router;

/** Constants */
const TYPE = 'documents';
const LIMIT = 10;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;
const SORT_BY = 'id';
const OFFSET = 0;

/** Routes **/
/**
 * @swagger
 * /api/v1/documents/:
 *  get:
 *    summary: Devuelve una lista de documentos paginada.
 *    parameters:
 *      - in: query
 *        name: limit
 *        type: number
 *        minimum: 1
 *        maximum: 100
 *        description: Limite de documentos a devolver.
 *      - in: query
 *        name: offset
 *        type: number
 *        minimum: 0
 *        description: Valor de offset según el cual se paginan los resultados.
 *      - in: query
 *        name: sortBy
 *        type: string
 *        default: id
 *        description: >
 *          Valor de la variable por la cual se ordenan los resultados.
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - documents
 *    responses:
 *      200:
 *        description: La lista de documentos paginada.
 *        schema:
 *          $ref: '#/definitions/Documents'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.get('/', (req, res) => {
  let { limit = LIMIT, sortBy = SORT_BY, offset = OFFSET } = req.query || {};

  limit = +limit;
  offset = +offset;

  if (!isNumber(limit)) limit = LIMIT;

  if (!isNumber(offset)) offset = OFFSET;

  if (limit > MAX_LIMIT) limit = MAX_COUNT;
  if (limit < MIN_LIMIT) limit = MIN_COUNT;

  const pointer = db.get(TYPE).sortBy(sortBy);
  const length = pointer.value().length;
  const items = pointer.slice(offset, offset + limit).value();

  let next = null;
  let prev = null;

  if (offset > 0) {
    let prevOffset = offset - limit;
    if (offset < 0) prevOffset = 0;
    prev = `offset=${prevOffset}&limit=${limit}`;
  }

  if (offset + limit < length) {
    let nextOffset = offset + limit;
    next = `offset=${nextOffset}&limit=${limit}`;
  }

  if (prev !== null && sortBy !== SORT_BY) prev += `&sortBy=${sortBy}`;
  if (next !== null && sortBy !== SORT_BY) next += `&sortBy=${sortBy}`;

  const result = utils.makeList(TYPE, items, { next, prev });
  utils.handleSuccess(res, result);
});
/**
 * @swagger
 * /api/v1/documents/:
 *  post:
 *    summary: Almacena un documento.
 *    description: >
 *      El documento a almacenar puede ser cualquier objeto JSON. La aplicación
 *      almacenara el documento en la base, y devolverá el ID donde puede
 *      recuperarse.
 *    parameters:
 *      - in: body
 *        required: true
 *        name: document
 *        description: Objeto JSON.
 *        schema:
 *          $ref: '#/definitions/AnyObject'
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - documents
 *    responses:
 *      200:
 *        description: OK
 *        schema:
 *          $ref: '#/definitions/Document'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.post('/', (req, res) => {
  let doc = req.body.document !== undefined ? req.body.document : req.body;

  if (doc === undefined) {
    return utils.handleError(res, '"document" is undefined');
  }

  if (typeof doc === 'string') {
    try {
      doc = JSON.parse(doc);
    } catch (err) {
      return utils.handleError(res, err);
    }
  }

  const item = model.create(doc);

  return utils.handleSuccess(res, item);
});
/**
 * @swagger
 * /api/v1/documents/{id}:
 *  get:
 *    summary: Devuelve un documento según su 'id'.
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        minimum: 1
 *        maximum: 1
 *        description: ID del documento.
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - documents
 *    responses:
 *      200:
 *        description: El documento buscado.
 *        schema:
 *          $ref: '#/definitions/Document'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.get('/:id/', (req, res) => {
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
/**
 * @swagger
 * /api/v1/documents/{id}:
 *  put:
 *    summary: Actualiza un documento identificado por su 'id'.
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        minimum: 1
 *        maximum: 1
 *        description: ID del documento.
 *      - in: body
 *        required: true
 *        name: document
 *        description: Objeto JSON.
 *        schema:
 *          $ref: '#/definitions/AnyObject'
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - documents
 *    responses:
 *      200:
 *        description: El documento buscado.
 *        schema:
 *          $ref: '#/definitions/Document'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.put('/:id/', (req, res) => {
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
/**
 * @swagger
 * /api/v1/documents/{id}:
 *  delete:
 *    summary: Elimina un documento según su 'id'.
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        minimum: 1
 *        maximum: 1
 *        description: ID del documento.
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - documents
 *    responses:
 *      204:
 *        $ref: '#/responses/NoContent'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.delete('/:id/', (req, res) => {
  const id = req.params.id;

  try {
    model.remove(id);
  } catch (err) {
    console.error(err);
    return utils.handleError(res, err.message);
  }

  utils.noContent(res);
});
/** Functions */
