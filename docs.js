/**
 * docs.js
 *
 * Configuración de Swagger JSDoc.
 */
const fs = require('fs');
const swaggerJSDoc = require('swagger-jsdoc');
const dotenv = require('dotenv');

const package = require('./package.json');

/** Read ENV files */
dotenv.load({ path: process.env.APP_ENV_PATH || '.env' });

/** Configuration Object */
const options = {
  definition: {
    info: {
      title: 'Lab Helpers',
      version: package.version,
      description:
        'API que acompaña a Ansible Tower para levantar ambientes de desarrollo durante los workshops de DevOps 101 de Conatel, y otras instancias.'
    },
    consumes: ['application/json'],
    produces: ['application/json', 'text/html'],
    host:
      process.env.NODE_ENV === 'development'
        ? `127.0.0.1:${process.env.PORT}`
        : 'ansibletower.conatest.click',
    basePath: process.env.NODE_ENV === 'development' ? `` : '/helpers/',
    schemes: [process.env.NODE_ENV === 'development' ? 'http' : 'https'],
    securityDefinitions: {
      SecretAuthentication: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Lab-Helpers-Secret'
      },
      JWTTokenAuthentication: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization'
      }
    }
  },
  // Path to the API docs
  apis: [
    './docs/components.yml',
    './docs/responses.yml',
    './docs/definitions.yml',
    './index.js',
    './controllers/auth.js',
    './docs/documents.yml',
    './controllers/*.js'
  ]
};
/** SwaggerJSDoc execution */
console.log('Generating the configuration');
const swaggerSpec = swaggerJSDoc(options);
/** Save configuration to file */
console.log('Saving the configuration to a file');
fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));
/** DONE */
console.log('---\nDONE');
