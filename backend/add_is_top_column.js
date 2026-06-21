require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  try {
    const res = await client.query(`
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_top BOOLEAN DEFAULT false;
    `);
    console.log('Successfully added is_top column');
  } catch(e) {
    console.error('Error adding is_top column:', e);
  } finally {
    await client.end();
  }
}
run();
