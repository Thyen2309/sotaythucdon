// config/db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
    encrypt: false,
    instanceName: process.env.DB_INSTANCE,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('✅ SQL Connected');
    return pool;
  })
  .catch((err) => {
    console.error('❌ Database Connection Failed: ', err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise,
};
