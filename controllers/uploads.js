/**
 * controllers:/uploads.js
 * 
 * Maneja la subida de archivos
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const cuid = require('cuid');

const asyncMiddleware = require('../middlewares/async.js');
const { makeURL } = require('../modules/utils.js');
const db = require('../modules/db.js');
/** Creación del router de express */
const router = express.Router();
const type = 'files';
const prefix = 'uploads';
/** Exports */
exports = module.exports = router
/** --- */
router.post('/text', asyncMiddleware(async (req, res, next) => {
  const body = req.body.text;
  const filename = req.body.filename || cuid();
  if (body === undefined || typeof body !== 'string') {
    res
      .status(400)
      .json({
        error: 'The variable "text" is undefined or not a string'
      });
    return;
  }
  const filePath = makePath(filename);
  console.log(filePath);
  fs.writeFile(filePath, body, () => {
    const result = {
      id: cuid(),
      type,
      url: makeURL('files', filename, {resource: ''}),
      created: new Date().toISOString(),
      filename
    };
    db.get(types).push(result);
    res.status(200).json(result);
  });
}));
router.post('/json', asyncMiddleware(async (req, res, next) => {
  let json = req.body.json;
  console.log(json, typeof json)
  const id = cuid();
  try {
    if (typeof json === 'string') {
      json = JSON.parse(json);
    }
  } catch(err) {
    console.error(err);
    res
      .status(400)
      .json({
        error: 'The variable "json" can\'t be parsed'  
      });
    return;
  }
  if (typeof json !== 'object') {
    res
      .status(400)
      .json({
        error: 'The variable "json" is not a valid JSON object'  
      });
    return;
  }
  const filename = `${id}.json`;
  const filePath = makePath(filename);
  fs.appendFile(filePath, JSON.stringify(json), () => {
    const result = {
      id,
      type: 'document',
      url: makeURL('documents', id),
      created: new Date().toISOString(),
      filename
    };
    db.get(type).push(Object.assign({}, result, {data}));
    res
      .status(200)
      .json(result);
  });
}));
/** Function */
function makePath (filename) {
  const directory = path.resolve(__dirname, '../');
  return `${directory}/${prefix}/${filename}`;  
}
