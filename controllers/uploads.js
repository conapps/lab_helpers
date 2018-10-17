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
/** Creación del router de express */
const router = express.Router();
const type = 'file';
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
  fs.writeFile(filePath, body, () => 
    res.status(200).json({
      id: cuid(),
      type,
      url: makeURL('files', filename, {resource: ''}),
      created: new Date().toISOString(),
      filename
    })
  );
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
  fs.appendFile(filePath, JSON.stringify(json), () => 
    res
      .status(200)
      .json({
        id,
        type: 'document',
        url: makeURL('documents', id),
        created: new Date().toISOString(),
        filename
      })
  );
}));
/** Function */
function makePath (filename) {
  const directory = path.resolve(__dirname, '../');
  return `${directory}/${prefix}/${filename}`;  
}
