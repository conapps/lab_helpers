/**
 * modules/utils.js
 * 
 * Helper functions for the rest of the app
 */
const PREFIX = '/helpers';
const RESOURCE = '/api' 

exports = module.exports = {
  makeURL: (prefix, path, {resource} = {}) => 
    `${PREFIX}${resource === undefined ? RESOURCE : resource }/${prefix}/${path}`
};
