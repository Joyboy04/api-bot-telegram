// connection.js
import mysql from 'mysql';

export function createConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbnumber',
    connectTimeout: 0,
    acquireTimeout: 0,
  });
}

export function executeQuery(query, connection) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}