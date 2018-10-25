/**
 * controllers/documents.js
 *
 * Documents resource controller
 */
const express = require('express');

const utils = require('../modules/utils.js');
const model = require('../models/documents.js');
const crudController = require('./crudController.js');
/** Create the express router */
const router = express.Router();

/** Exports */
exports = module.exports = router;

/** Routes **/
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
/** CRUD Routes */
crudController(router, model, {
  type: 'documents',
  type: 10,
  maxLimit: 100,
  minLimit: 1,
  sortBy: 'id',
  offset: 0
});
