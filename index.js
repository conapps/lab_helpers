/**
 * Main
 * ---
 * Helper app that exposes resources to help out during lab POD creations.
 */

const express = require('express');
const cuid = require('cuid');
const fs = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const compression = require('compression');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

const asyncMiddleware = require('./middlewares/async.js');

/** Instantiate the upload middleware */
const upload = multer({ dest: path.join(__dirname, 'uploads') });

/** Load environment variables from .env file. */
dotenv.load({ path: '.env' });

/** Create the express server */
const app = express();

app.set('host', process.env.HOST);
app.set('port', process.env.PORT);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in ms
}));
app.disable('x-powered-by');
app.use('/files', express.static(path.join(__dirname, 'uploads'), {maxAge: 31557600000}));
/** Custom Routes  */
app.get('/api', asyncMiddleware(async (req, res, next) => {
  res.status(200).json({
    "description": "AWX Helper API",
    "current_version": "/api/v1/",
    "available_versions": {
      "v1": "/api/v1/"
    }
  });    
}));
app.use('/api/uploads', require('./controllers/uploads.js'));
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











