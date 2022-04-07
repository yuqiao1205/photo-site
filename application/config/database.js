const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'csc317',
    password:'sfuser'
  });

  module.exports = db;