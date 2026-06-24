require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log("Creating job_reports table if not exists...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Successfully created job_reports table!");
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await pool.end();
  }
}

run();
