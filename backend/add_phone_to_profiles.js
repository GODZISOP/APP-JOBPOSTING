const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString: connectionString,
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL successfully!');

  // SQL to add phone column to profiles table
  const sql = `
    -- Add the phone column to profiles if it doesn't exist
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

    -- Grant access to anon and authenticated roles
    GRANT ALL ON public.profiles TO anon;
    GRANT ALL ON public.profiles TO authenticated;
    GRANT ALL ON public.profiles TO service_role;
  `;

  try {
    console.log('Altering public.profiles table to add phone column...');
    await client.query(sql);
    console.log('✅ phone column added successfully!');
  } catch (err) {
    console.error('❌ Failed to add phone column:', err.message);
  } finally {
    await client.end();
  }
}

main();
