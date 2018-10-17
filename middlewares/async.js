/**
 * Async middleware.
 * ---
 * Wraps our routes so that silent errors get caught by Express
 */
const asyncMiddleware = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next).catch())

exports = module.exports = asyncMiddleware;
