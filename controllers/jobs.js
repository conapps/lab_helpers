/**
 * controllers/awx.js
 *
 * AWX resource controller
 */
const express = require('express');
const cuid = require('cuid');
const omit = require('lodash/omit');

const awx = require('../modules/awx.js');
const utils = require('../modules/utils.js');
const asyncMiddleware = require('../middlewares/async.js');
const jobs = require('../models/jobs.js');
/** Create the express router */
const router = express.Router();

/** Exports */
exports = module.exports = router;

/** Constants */
const AWX_API_URL = process.env.AWX_API_URL;

/** Routes */
/**
 * @swagger
 * /api/v1/jobs/{id}/:
 *  get:
 *    summary: Devuelve el `job` buscado.
 *    description: 'Devuelve la información de un `job` identificado por su `id`.'
 *    parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        minimum: 1
 *        maximum: 1
 *        description: ID del `job`.
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - jobs
 *    responses:
 *      200:
 *        description: El `job` buscado.
 *        schema:
 *          $ref: '#/definitions/Job'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.get(
  '/:id/',
  asyncMiddleware(async (req, res) => {
    const id = req.params.id;

    if (id === undefined) return utils.handleError(res, '"id" is undefined');

    let job = jobs.get(id);

    if (job === undefined) return utils.handleError(res, '"job" not found');

    const { status } = await awx.getJob(id);

    job.data.status = status;

    job = mutateJob(job);

    utils.handleSuccess(res, job);
  })
);
/**
 * @swagger
 * /api/v1/jobs/launch/{name}/:
 *  post:
 *    summary: Corre un `job_template` en el servidor de AWX o Ansible Tower.
 *    description: 'Endpoint para lanzar un `template` en el servidor. En la respuesta se incluye toda la información para interactuar con este trabajo. Por ejemplo: cancelar, relanzar, y ver en tiempo real su ejecución.'
 *    parameters:
 *      - in: path
 *        name: name
 *        type: string
 *        minimum: 1
 *        maximum: 1
 *        description: Nombre del `template` en AWX.
 *      - in: body
 *        required: true
 *        name: extra_vars
 *        description: Objeto JSON con las variables necesarias para correr el `template`.
 *        schema:
 *          $ref: '#/definitions/AnyObject'
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - jobs
 *    responses:
 *      200:
 *        description: Detalles sobre la ejecución del `playbook`.
 *        schema:
 *          $ref: '#/definitions/Job'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.post(
  '/launch/:name/',
  asyncMiddleware(async (req, res) => {
    const name = req.params.name;
    const body = req.body || {};

    if (name === undefined)
      utils.handleError(res, 'job template "name" is undefined');

    const result = await awx.launchJobTemplate(name, body);

    let job = jobs.create({
      description: result.description,
      extra_vars: JSON.parse(result.extra_vars),
      job_id: result.id,
      job_template_id: result.job_template,
      name: result.name,
      playbook: result.playbook,
      status: result.status,
      stdout_url: `${AWX_API_URL}${result.related.stdout}`,
      activity_stream_url: `${AWX_API_URL}${result.related.activity_stream}`,
      cancel_url: `${AWX_API_URL}${result.related.cancel}`,
      job_events_url: `${AWX_API_URL}${result.related.job_events}`,
      relaunch_url: `${AWX_API_URL}${result.related.relaunch}`,
      job_url: `${AWX_API_URL}${result.url}`
    });

    job = mutateJob(job);

    res.status(200).json(job);
  })
);
/**
 * @swagger
 * /api/v1/jobs/stdout/{id}/:
 *  get:
 *    summary: Devuelve la salida del `job`.
 *    description: 'Devuelve la salida en distintos formatos de la ejecución del `job`. Los formator permitidos son: `html`, `txt`, `ansi`, `json`, `txt_download`, `ansi_download`. También se puede indicar si se quiere la versión con fondo oscuro o no a través de la opción `dark` que puede tomar valores de `1` para si y `0` para no. Su valor por defecto es `1`.'
 *    parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        minimum: 1
 *        maximum: 1
 *        description: ID del `job`.
 *      - in: query
 *        name: format
 *        type: string
 *        enum:
 *          - html
 *          - txt
 *          - txt_download
 *          - ansi
 *          - ansi_download
 *          - json
 *        description: Formato en el que se descargara la salida del `playbook`.
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - jobs
 *    responses:
 *      200:
 *        description: 'Stream de ejecución del `job` en el formato especificado.'
 *        produces:
 *          - 'text/html; charset=utf-8'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.get(
  '/stdout/:id/',
  asyncMiddleware(async (req, res) => {
    const id = req.params.id;
    const format = req.query.format || 'html';
    const dark = req.query.dark || 1;

    if (id === undefined) return utils.handleError(res, '"id" is undefined');

    var stream = await awx.getJobStdout(id, { format, dark });

    return utils.handleSuccess(res, stream);
  })
);
/**
 * @swagger
 * /api/v1/jobs/cancel/{id}/:
 *  get:
 *    summary: Cancela la ejecución del `job`
 *    parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        minimum: 1
 *        maximum: 1
 *        description: ID del `job`.
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - jobs
 *    responses:
 *      200:
 *        description: OK.
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.get(
  '/cancel/:id/',
  asyncMiddleware(async (req, res) => {
    const id = req.params.id;

    if (id === undefined) return utils.handleError(res, '"id" is undefined');

    var result = await awx.cancelJob(id);

    if (result.can_cancel === false)
      return handleError(res, "can't cancel this job");

    result = mutateCancelResult(result);

    return utils.handleSuccess(res, result);
  })
);
/**
 * @swagger
 * /api/v1/jobs/relaunch/{id}/:
 *  get:
 *    summary: Reinicia la ejecución del `job`
 *    parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        minimum: 1
 *        maximum: 1
 *        description: ID del `job`.
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - jobs
 *    responses:
 *      200:
 *        description: Estado del `job`.
 *        schema:
 *          $ref: '#/definitions/Job'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.get(
  '/relaunch/:id/',
  asyncMiddleware(async (req, res) => {
    const id = req.params.id;

    if (id === undefined) return utils.handleError(res, '"id" is undefined');

    var result = await awx.relaunchJob(id);

    if (result.status !== 'pending')
      return utils.handleError(res, `job has status ${result.status}`);

    let job = jobs.get(id);

    job = mutateJob(job);

    return utils.handleSuccess(res, job);
  })
);

/** Functions */
function mutateJob(job) {
  const {
    id,
    data: { extra_vars, name, playbook, description, status } = {}
  } = job;
  job = omit(job, 'data');
  job.data = { extra_vars, name, playbook, description, status };
  job.related = {
    stdout: utils.makeURL('jobs', `stdout/${id}`),
    activity_stream: utils.makeURL('jobs', `activity_stream/${id}`),
    cancel: utils.makeURL('jobs', `cancel/${id}`),
    relaunch: utils.makeURL('jobs', `relaunch/${id}`)
  };
  return job;
}

function mutateCancelResult(result) {
  return result;
}
