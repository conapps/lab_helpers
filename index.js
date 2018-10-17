#!/usr/bin/node
/**
 * Main
 * ---
 * Helper app that exposes resources to help out during lab POD creations.
 */
const express = require('express');
const cuid = require('cuid');
const fs = require('fs');
const bodyParser = require('body-parser');
const logger = require('morgan');
const compression = require('compression');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const passport = require('passport');

/** Load environment variables from .env file. */
dotenv.load({ path: '.env' });

/** Configure passport */
require('./modules/passport.js'); 

/** Instantiate the upload middleware */
const upload = multer({ dest: path.join(__dirname, 'uploads') });

/** Create the express server */
const app = express();

app.set('host', process.env.HOST);
app.set('port', process.env.PORT);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.disable('x-powered-by');
/** Unauthenticated Routes  */
app.get('/api', (req, res, next) => {
  res.status(200).json({
    description: "AWX Helper API",
    current_version: "/api/v1/",
    available_versions: {
      v1: "/api/v1/"
    },
    auth: "/api/auth/"
  });    
});
app.get('/api/v1/', (req, res) => {
  res.status(200).json({
    files: "/api/v1/files/",
    uploads: "/api/v1/uploads/",
    documents: "/api/v1/documents/" 
  });  
});
app.use('/api/auth/', require('./controllers/auth.js'));
/** Authenticated routes */
app.use(
  '/api/v1/files/', 
  passport.authenticate('jwt', {session: false}),
  express.static(
    path.join(__dirname, 'uploads'), {maxAge: 31557600000}
  )
);
app.use(
  '/api/v1/uploads/',
  passport.authenticate('jwt', {session: false}),
  require('./controllers/uploads.js')
);
app.use(
  '/api/v1/documents/',
  passport.authenticate('jwt', {session: false}), 
  require('./controllers/documents.js')
);
/** Error Handler */
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());  
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}
/** Start the Express Server **/
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://%s:%d in %s mode', '✓', app.get('host'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;











