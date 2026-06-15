const { Client } = require('pg');
require('dotenv').config({path: './.env'});
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect();
client.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'jobs_type_check';")
  .then(res => { console.log(res.rows); client.end(); })
  .catch(err => { console.error(err); client.end(); });
