const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '9907',
  database: 'sems',
  port: 3306 // Ensure this is the correct port
});

module.exports = db;




// import { createPool } from 'mysql2/promise';

// const pool = createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '9907',
//   database: 'sems',
//   port: 3306
// });


// pool.connect()

// pool.query('SELECT * from users', (err, rows, fields) => {
//   if (err) throw err

//   console.log('The database is ', rows);
// })


