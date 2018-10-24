/**
 * controllers/auth.js
 *
 * Authentication controller.
 */
const express = require('express');
const jwt = require('jsonwebtoken');

const utils = require('../modules/utils.js');
const db = require('../modules/db.js');
const auth = require('../modules/auth.js');
const labSecretMiddleware = require('../middlewares/labSecret.js');
/** Create the express Router */
const router = express.Router();

/** Exports */
exports = module.exports = router;

/** Constants */
const ROLES = ['admin', 'user'];
const JWT_SECRET = process.env.JWT_SECRET;

/** Routes */
/**
 * @swagger
 * /api/auth/:
 *  get:
 *    summary: Devuelve información básica de la API
 *    description: >
 *      Se puede utilizar este endpoint para recorrer la API de autenticación.
 *      En la respuesta se detallan todos los endpoints disponibles bajo este
 *      namespace.
 *    tags:
 *      - auth
 *    responses:
 *      200:
 *        description: OK
 *        examples:
 *          'application/json':
 *            login: '/helpers/api/auth/login/'
 *            signup: '/helpers/api/auth/signup/'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.get('/', (req, res) => {
  utils.handleSuccess(res, {
    login: '/helpers/api/auth/login/',
    signup: '/helpers/api/auth/signup/'
  });
});
/**
 * @swagger
 * /api/auth/login/:
 *  post:
 *    summary: Inicia la sesión de un usuario.
 *    description: >
 *      Autenticación al sistema. Si las credenciales son validas, se devuelve
 *      el `id` y `access` token con el cual podrán acceder al resto de los
 *      recurso, dependiendo del perfil del usuario. El token de `id` contiene
 *      la información del usuario. Pueden usarse cualquiera de los dos tokens
 *      para interactuar con la API pero se sugiere que se utilice el de
 *      `access` dado que es más pequeño. Ambos tokens son validos por 1 hora.
 *    parameters:
 *      - in: body
 *        name: credentials
 *        required: true
 *        description: Credenciales de usuario. Ambos campos son obligatorios.
 *        schema:
 *          $ref: '#/definitions/Credentials'
 *    tags:
 *      - auth
 *    responses:
 *      200:
 *        description: Ok
 *        schema:
 *          $ref: '#/definitions/Tokens'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.post('/login/', (req, res) => {
  const { email, password } = req.body;

  let user;

  try {
    user = auth.getUser(email, password);
  } catch (err) {
    return utils.handleError(res, err);
  }

  const idToken = jwt.sign(Object.assign({}, user, { sub: 'id' }), JWT_SECRET, {
    expiresIn: '1h'
  });
  const accessToken = jwt.sign(
    { email: user.email, sub: 'access' },
    JWT_SECRET,
    {
      expiresIn: '1h'
    }
  );
  const refreshToken = jwt.sign({ user, sub: 'refresh' }, JWT_SECRET, {
    expiresIn: '30d'
  });

  db.get('refreshTokens')
    .push(refreshToken)
    .write();

  return utils.handleSuccess(res, {
    user,
    idToken,
    accessToken,
    refreshToken
  });
});

/**
 * @swagger
 * /api/auth/refresh/:
 *  post:
 *    summary: Refresca los tokens de acceso e identidad.
 *    description: >
 *      El `refreshToken` es valido por 30 días. Durante este tiempo, el usuario puede intercambiarlo por nuevos tokens.
 *    parameters:
 *      - in: body
 *        name: refreshToken
 *        required: true
 *        description: Token para refrescar los tokens de autenticación.
 *        schema:
 *          $ref: '#/definitions/RefreshToken'
 *    tags:
 *      - auth
 *    responses:
 *      200:
 *        description: Ok
 *        schema:
 *          $ref: '#/definitions/Tokens'
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.post('/refresh/', (req, res) => {
  const { token } = req.body;

  const refreshTokens = db.get('refreshTokens');

  if (refreshTokens.indexOf(token) === -1)
    return utils.handleError(res, 'invalid "refreshToken"');

  refreshTokens.remove(token).write();

  const decoded = jwt.verify(token, JWT_SECRET);

  const idToken = jwt.sign(
    Object.assign({}, decoded.user, { sub: 'id' }),
    process.env.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  );
  const accessToken = jwt.sign(
    { email: decoded.user.email, sub: 'access' },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  );
  const refreshToken = jwt.sign(
    { user: decoded.user, sub: 'refresh' },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );

  return utils.handleSuccess(res, {
    idToken,
    accessToken,
    refreshToken
  });
});
/**
 * @swagger
 * /api/auth/signup/:
 *  post:
 *    summary: Crea un nuevo usuario.
 *    description: >
 *      Crea un nuevo usuario. Solamente pueden crear nuevos usuarios aquellos
 *      que cuenten con el secreto de la aplicación. El mismo se define al
 *      momento de ejecutar la aplicación por el administrador del sistema.
 *    parameters:
 *      - in: body
 *        required: true
 *        name: user
 *        description: Datos de usuario a crear.
 *        schema:
 *          $ref: '#/definitions/UserBody'
 *    security:
 *      - SecretAuthentication: []
 *    tags:
 *      - auth
 *    responses:
 *      201:
 *        description: Created
 *      400:
 *        $ref: '#/responses/Error'
 *      401:
 *        $ref: '#/responses/Unauthorized'
 *      404:
 *        $ref: '#/responses/NotFound'
 *      500:
 *        $ref: '#/responses/ServerError'
 */
router.post('/signup/', labSecretMiddleware, (req, res) => {
  const { email, password, username, name, role } = req.body;

  if (email === undefined)
    return utils.handleError(res, '"email" is undefined');

  if (password === undefined)
    return utils.handleError(res, '"password" is undefined');

  if (role === undefined) return utils.handleError(res, '"role" is undefined');

  if (ROLES.indexOf(role) === -1)
    return utils.handleError(
      res,
      `el "role" del usuario debe ser uno de: ${ROLES}`
    );

  try {
    auth.createUser({ email, password, username, name, role });
  } catch (err) {
    return utils.handleError(res, err);
  }
  utils.handleSuccess(res, {}, { status: 201 });
});
