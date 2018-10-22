# Lab Helpers

Esta aplicación permite almacenar archivos de texto y documentos JSON con facilidad. La idea es utilizarlo junto con `playbooks` de Ansible, ejecutandose a través de `Ansible Tower`. Una de las dificultades que existen al correr los `playbook` de esta manera, es que es dificil extraer información durante la ejecución del `playbook`. Con esta aplicación podemos remediar esta situación.

La idea es agregar, en cualquier parte de nuestros `playbooks` tareas similares a la siguiente:

```yaml
# ---
# lab_helpers_store_document_example.yml
#
# Ejemplos de como utilizar la API `lab_helpers` desde Ansible
# para guardar un documento en la base de datos.
# ---
- hosts: 127.0.0.1
  connection: local
  gather_facts: no
  vars_files:
    - ./vars/lab_helpers.yml
    - ./vars/credentials.yml
  tasks:
    - name: Obtenemos las credenciales de acceso
      uri:
        url: '{{lab_helpers_url}}/api/auth/login/'
        method: POST
        body:
          email: '{{lab_helpers_email}}'
          password: '{{lab_helpers_password}}'
        body_format: json
        headers:
          'Content-Type': 'application/json'
        return_content: yes
      register: output
    - name: Registramos el token de acceso en una variable
      set_fact:
        access_token: '{{output["json"]["accessToken"]}}'
    - name: Guardamos un documento en la base
      uri:
        url: '{{lab_helpers_url}}/api/v1/documents/'
        method: POST
        body: '{{hostvars}}'
        body_format: json
        headers:
          'Content-Type': 'application/json'
          'Authorization': 'Bearer {{access_token}}'
        return_content: yes
      register: output
    - debug:
        var: output
```

En este caso la salida almacenada en `output` sería algo como:

```json
{
  "created": "2018-10-17T20:40:37.275Z",
  "data": {
    # ...
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
# ---
# lab_helpers_store_file_example.yml
#
# Ejemplos de como utilizar la API `lab_helpers` desde Ansible
# para almacenar un archivo en el servidor.
# ---
- hosts: 127.0.0.1
  connection: local
  gather_facts: no
  vars_files:
    - ./vars/lab_helpers.yml
    - ./vars/credentials.yml
  tasks:
    - name: Obtenemos las credenciales de acceso
      uri:
        url: '{{lab_helpers_url}}/api/auth/login/'
        method: POST
        body:
          email: '{{lab_helpers_email}}'
          password: '{{lab_helpers_password}}'
        body_format: json
        headers:
          'Content-Type': 'application/json'
        return_content: yes
      register: output
    - name: Registramos el token de acceso en una variable
      set_fact:
        access_token: '{{output["json"]["accessToken"]}}'
    - name: Guardamos este playbook en el servidor
      uri:
        url: '{{lab_helpers_url}}/api/v1/uploads/text/'
        method: POST
        body:
          text: '{{lookup("file", "./lab_helpers_store_file_example.yml")}}'
          filename: 'lab_helpers_store_file_example.yml'
        body_format: json
        headers:
          'Content-Type': 'application/json'
          'Authorization': 'Bearer {{access_token}}'
        return_content: yes
      register: output
    - debug:
        var: output
```

En este caso la salida sería algo así:

```json
{
   "created": "2018-10-20T01:08:54.366Z",
    "filename": "lab_helpers_store_file_example.yml",
    "id": "cjngqw0ri00027i1bukowweu9",
    "type": "files",
    "url": "/helpers/api/v1/files/lab_helpers_store_file_example.yml"
}
```

Y para recuperarlo lo haríamos en la siguiente dirección:

```bash
{{lab_helpers_url}}/helpers/api/v1/files/lab_helpers_store_file_example.yml
```

_OBS: importante notar que las credenciales las estoy almacenando en un archivo protegido con `ansible-vault`._

## API

La documentación de la versión `1.0.0` se puede encontrar en el siguiente link:

[https://ansibletower.conatest.click/helpers/api-docs/#/](https://ansibletower.conatest.click/helpers/api-docs/#/)

También se puede reconstruir levantando la aplicación localmente o a partir del archivo `swagger.json` en la raiz del repositorio.

## Ejecutar la aplicación

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

## Licencia

[MIT](./LICENCE)

## Autores

- Ismael Almandos
- Guzmán Monné

## Copyright

CONATEL S.A. 2018
