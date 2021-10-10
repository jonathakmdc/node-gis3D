const { refreshDatabaseConnections } = require('../database/builder');
const { execute, query, queryOne } = require('../database/sqlite');
module.exports = {
  async save({ type, host, port, database, username, password, dialect, active }) {
    const configuration = await this.get(type, client);
    if (configuration) {
      await execute('DELETE FROM database WHERE type = ? AND dialect = ? AND host = ? AND port = ?;', [type, client]);
    }
    const result = await execute(
      'INSERT INTO database(type, host, port, database, username, password, dialect, active) VALUES (?,?,?,?,?,?,?,?);',
      [type, host, port, database, username, password, dialect, active]
    );
    refreshDatabaseConnections();
    return result;
  },
  getAll() {
    return query('SELECT * FROM database');
  },
  get(type, dialect, host, port) {
    return queryOne('SELECT * FROM database WHERE type = ? AND dialect = ? AND host = ? AND port = ?', [
      type,
      dialect,
      host,
      port,
    ]);
  },
  async delete(type, dialect, host, port) {
    const result = await execute('DELETE FROM database WHERE type = ? AND dialect = ? AND host = ? AND port = ?', [
      type,
      dialect,
      host,
      port,
    ]);
    refreshDatabaseConnections();
    return result;
  },
};
