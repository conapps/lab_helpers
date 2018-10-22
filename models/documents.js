/**
 * models/documents.js
 *
 * Documents resource model. [Singleton]
 */
const db = require('../modules/db.js');
const utils = require('../modules/utils.js');

exports = module.exports = (function({ type, db } = {}) {
  /**
   * Creates a new resource.
   * @param {object} body Body of the resource being created.
   * @param {string} [id] Custom document id value.
   */
  function create(body, id) {
    const item = utils.makeItem(type, body, id);

    db.get(type)
      .push(item)
      .write();

    return item;
  }
  /**
   * Gets a resource from the db.
   * @param {string} id Resource unique identifier.
   */
  function get(id) {
    if (id === undefined) throw new Error('"id" is undefined');

    return db
      .get(type)
      .find({ id })
      .value();
  }
  /**
   * Updates a resource on the db.
   * @param {string} id Resource unique identifier.
   * @param {object} data Body data to update on the resource body.
   */
  function update(id, data) {
    if (id === undefined) throw new Error('"id" is undefined');

    console.log(data);

    let item = get(id);

    if (item === undefined) return create(data, id);

    return db
      .get(type)
      .find({ id })
      .assign(
        Object.assign({}, item, {
          data: Object.assign({}, item.data, data),
          updated: new Date().toISOString()
        })
      )
      .write();
  }
  /**
   * Removes a resource from the db.
   * @param {string} id Resource unique identifier.
   */
  function remove(id) {
    if (id === undefined) throw new Error('"id" is undefined');

    return db
      .get(type)
      .remove({ id })
      .write();
  }
  /** Singleton */
  return {
    create,
    update,
    get,
    remove
  };
})({
  type: 'documents',
  db
});
