/**
 * config.js
 *
 * Este archivo almacena la configuración básica de la aplicación. La misma se
 * puede modificar a través de variables de entorno configuradas en el archivo
 * `.env` ubicado en la raiz del repositorio.
 */
exports = module.exports = {
  host:
    process.env.NODE_ENV === 'development'
      ? `http://${process.env.HOST}:${process.env.PORT}`
      : process.env.APP_HOST,
  basePath:
    process.env.NODE_ENV === 'development' ? '' : process.env.APP_BASE_PATH
};
