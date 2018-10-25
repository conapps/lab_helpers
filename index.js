#!/usr/bin/node
/**
 * Main
 * ---
 * Helper app that exposes resources to help out during lab POD creations.
 */
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const passport = require('passport');

const package = require('./package.json');
/** Load environment variables from .env file. */
dotenv.load({ path: process.env.APP_ENV_PATH || '.env' });

/** Load custom modules */
const swaggerDocument = require('./swagger.json');
const config = require('./config.js');

/** Configure passport */
require('./modules/passport.js');

/** Create the express server */
const app = express();

/** Configure Swagger UI options */
const swaggerUiOptions = {
  swaggerOptions: {
    host: config.host,
    basePath: config.basePath
  }
};

app.set('host', process.env.HOST);
app.set('port', process.env.PORT);
app.use(cors('*'));
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.disable('x-powered-by');
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerUiOptions)
);
/** Unauthenticated Routes  */
/**
 * @swagger
 * /api:
 *  get:
 *    summary: Devuelve información básica de la API
 *    description: >
 *      Se puede utilizar este endpoint para comenzar a recorrer la API. Las
 *      URL para todas las versiones de la misma, y la URL para la autenticación
 *      con la misma pueden encontrarse en esta respuesta.
 *    responses:
 *      200:
 *        examples:
 *          'application/json':
 *            "description": "AWX Helper API"
 *            "current_version": "/api/v1/"
 *            "available_versions":
 *              "v1": "/api/v1/"
 *            "auth": "/api/auth/"
 *        description: OK
 *      500:
 *        $ref: '#/responses/ServerError'
 */
app.get('/api', (req, res, next) => {
  res.status(200).json({
    description: 'AWX Helper API',
    version: package.version,
    current_version: '/api/v1/',
    available_versions: {
      v1: '/api/v1/'
    },
    auth: '/api/auth/'
  });
});
/**
 * @swagger
 * /api/v1/:
 *  get:
 *    summary: Devuelve información básica de la API
 *    description: >
 *      Se puede utilizar este endpoint para recorrer la versión 1 de la API.
 *      En la respuesta se detallan todos los recursos disponibles bajo este
 *      namespace.
 *    tags:
 *      - default
 *    responses:
 *      200:
 *        description: OK
 *        examples:
 *          'application/json':
 *            files: '/api/v1/files/'
 *            uploads: '/api/v1/uploads/'
 *            documents: '/api/v1/documents/'
 *            jobs: '/api/v1/jobs/'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
app.get('/api/v1/', (req, res) => {
  res.status(200).json({
    files: '/api/v1/files/',
    uploads: '/api/v1/uploads/',
    documents: '/api/v1/documents/',
    jobs: '/api/v1/jobs/'
  });
});
/**
 * @swagger
 * /api/v1/files/{filename}:
 *  get:
 *    summary: Devuelve el archivo almacenado en el servidor según su `filename`
 *    parameters:
 *      - in: path
 *        name: filename
 *        required: true
 *        type: string
 *        minimum: 1
 *        maximum: 1
 *        description: Nombre del archivo almacenado.
 *    security:
 *      - JWTTokenAuthentication: []
 *    tags:
 *      - files
 *    responses:
 *      200:
 *        description: El archivo buscado.
 *        schema:
 *          type: file
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
app.use(
  '/api/v1/files/',
  express.static(path.join(__dirname, 'uploads'), { maxAge: 31557600000 })
);
/** Authentication Routes */
app.use('/api/auth/', require('./controllers/auth.js'));
/** Upload Routes */
app.use(
  '/api/v1/uploads/',
  passport.authenticate('jwt', { session: false }),
  require('./controllers/uploads.js')
);
/** Documents Routes */
app.use(
  '/api/v1/documents/',
  passport.authenticate('jwt', { session: false }),
  require('./controllers/documents.js')
);
/** Jobs Routes */
app.use(
  '/api/v1/jobs/',
  passport.authenticate('jwt', { session: false }),
  require('./controllers/jobs.js')
);
/** Labs Routes */
app.use(
  '/api/v1/labs/',
  passport.authenticate('jwt', { session: false }),
  require('./controllers/labs.js')
);
/** Error Handler */
app.use((err, req, res, next) => {
  console.log(err.name);
  var error = {
    name: err.name
  };
  if (err.message);
  {
    console.log(err.message);
    error.message = err.message;
  }
  if (err.response && err.response.data) {
    console.log(err.response.data);
    error.data = err.response.data;
  }
  if (err.stack) {
    console.log(err.stack);
  }
  res.status(500).json(error);
});
/** Start the Express Server **/
app.listen(app.get('port'), () => {
  console.log(
    '%s App is running at http://%s:%d in %s mode',
    '✓',
    app.get('host'),
    app.get('port'),
    app.get('env')
  );
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
