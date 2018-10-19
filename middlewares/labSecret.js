/**
 * middlewares/labSecret.js
 *
 * Middleware para revisar si el request cuenta con el secreto configurado en
 * la aplicación por la variable de entorno: `LAB_HELPERS_SECRET`.
 */
const utils = require('../modules/utils.js');

exports = module.exports = function(req, res, next) {
  const secret = req.get('X-Lab-Helpers-Secret');

  if (secret !== process.env.LAB_HELPERS_SECRET)
    return utils.notAuthorized(res);

  next();
};
