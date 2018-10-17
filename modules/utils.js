/**
 * modules/utils.js
 * 
 * Helper functions for the rest of the app
 */
const cuid = require('cuid');

const PREFIX = '/helpers';
const RESOURCE = '/api' 

exports = module.exports = {
  makeURL: function (prefix, path, {resource} = {}) {
    resource = resource === undefined
      ? RESOURCE
      : resource;
    return `${PREFIX}${resource}/${prefix}/${path}/`
  },
  handleSuccess: function (res, result) {
    return res.status(200).json(result);  
  },
  handleError: function (res, error) {
    if (error instanceof Error === true) {
      console.error(error);
      message = error.message;
    } else {
      console.log(error);
      message = error
    }
    res.status(400).json({error: message})
  },
  makeList: function (type, items, {next, prev} = {}) {
    if (Array.isArray(items) === false) {
      throw new Error('"items" must be a list');  
    }

    return {
      count: items.length,
      next: next !== null
        ? this.makeURL(type, next)
        : null,
      previous: prev !== null
        ? this.makeURL(type, prev)
        : null,
      items
    }  
  },
  makeItem: function (type, data) {
    const id = cuid();
    return {
      id,
      created: new Date().toISOString(),
      type,
      url: this.makeURL(type, id),
      data
    }
  },
};
