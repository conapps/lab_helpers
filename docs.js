/**
 * docs.js
 *
 * Configuración de Swagger JSDoc.
 */
const fs = require('fs');
const swaggerJSDoc = require('swagger-jsdoc');

const package = require('./package.json');

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
    produces: ['application/json'],
    host: 'ansibletower.conatest.click',
    basePath: '/helpers/',
    schemes: ['https'],
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
