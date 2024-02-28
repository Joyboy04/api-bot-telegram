// connection.js
import mysql from 'mysql';

const connection = createConnection(); 

function createConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbnumber',
    connectTimeout: 0,
    acquireTimeout: 0,
  });
} 

async function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}