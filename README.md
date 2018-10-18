# Lab Helpers

Esta aplicación permite almacenar archivos de texto y documentos JSON con facilidad. La idea es utilizarlo junto con `playbooks` de Ansible, ejecutandose a través de `Ansible Tower`. Una de las dificultades que existen al correr los `playbook` de esta manera, es que es dificil extraer información durante la ejecución del `playbook`. Con esta aplicación podemos remediar esta situación.

La idea es agregar, en cualquier parte de nuestros `playbooks` tareas similares a la siguiente:

```yaml
- name: Guardamos una serie de variables en un repositorio remoto.
  uri:
    url: '{{lab_helpers_url}}/helpers/api/v1/documents/'
    method: POST
    body:
      hostname: '{{inventory_hostname}}'
      something: awesome
    body_format: json
    headers:
      'Content-Type': 'application/json'
      'Authorization': 'Bearer {{lab_helpers_access_token}}'
    return_content: yes
  register: output
```

En este caso la salida almacenada en `output` sería algo como:

```json
{
  "created": "2018-10-17T20:40:37.275Z",
  "data": {
    "hostname": "1.2.3.4",
    "something": "awesome"
  },
  "id": "cjndmfau300006j1bvhylyjfx",
  "type": "documents",
  "url": "/helpers/api/v1/documents/cjndmfau300006j1bvhylyjfx/"
}
```

Luego podemos recuperar la información almacenada ahí a través de la siguiente URL:

```bash
{{lab_helpers_url}}/helpers/api/v1/documents/cjndmfau300006j1bvhylyjfx/
```

También podemos subir archivos enteros. Por ejemplo, llaves privadas creadas con el módulo `ec2_key`:

```yaml
- name: create a new ec2 key pair
  ec2_key:
    name: '{{aws_key_pair_name}}'
  register: pair
- name: 'save the key {{aws_key_pai_name}} on a remote repository'
  uri:
    url: '{{lab_helpers_url}}/helpers/api/v1/uploads/text/'
    method: POST
    body:
      text: '{{pair.key.private_key}}'
      filename: '{{aws_key_pair_name}}.pem'
    body_format: json
    headers:
      'Content-Type': 'application/json'
      'Authorization': 'Bearer {{lab_helpers_access_token}}'
    return_content: yes
  register: output
```

En este caso la salida sería algo así:

```json
{
  "created": "2018-10-17T20:56:22.945Z",
  "filename": "awx.pem",
  "id": "cjndmzkip0002p51b73s08lr2",
  "type": "files",
  "url": "/helpers/api/v1/files/awx.pem"
}
```

## Getting Started

Para poder correr la aplicación es necesario cargar una serie de variables de entorno. Las podemos configurar en el servidor, o localmente a través del archivo `.env`. Por ejemplo, algo así:

```ini
HOST=0.0.0.0
PORT=8081
JWT_SECRET=somethin_something_the_dark_side
SESSION_SECRET=conatel
LAB_HELPERS_SECRET=C0n4t3lC0n4t3l
```

Luego instalamos las dependencias y corremos el archivo principal:

```bash
# NPM
npm install
# Yarn
yarn install

# Development Mode
## NPM
npm run serve
## Yarn
yarn serve

# Production
## NodeJS
node index.js
## PM2
pm2 start index.js --name lab_helpers
```

_OBS: `pm2` puede instalarse globalmente por npm: `npm install -g pm2`._

## API

TODO

## Licencia

[MIT](./LICENCE)

## Autores

- Ismael Almandos
- Guzmán Monné

## Copyright

CONATEL S.A. 2018
