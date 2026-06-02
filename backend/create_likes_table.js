const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString: connectionString,
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL successfully!');

  // SQL to create likes table
  const sql = `
    -- Create the likes table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Enable RLS on likes table
    ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read likes" ON public.likes;
    DROP POLICY IF EXISTS "Allow authenticated insert likes" ON public.likes;
    DROP POLICY IF EXISTS "Allow authenticated delete likes" ON public.likes;

    -- Create security policies to allow all operations
    CREATE POLICY "Allow public read likes" ON public.likes
      FOR SELECT USING (true);

    CREATE POLICY "Allow authenticated insert likes" ON public.likes
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "Allow authenticated delete likes" ON public.likes
      FOR DELETE USING (true);

    -- Grant access to anon and authenticated roles
    GRANT ALL ON public.likes TO anon;
    GRANT ALL ON public.likes TO authenticated;
    GRANT ALL ON public.likes TO service_role;
  `;

  try {
    console.log('Creating public.likes table and RLS policies...');
    await client.query(sql);
    console.log('✅ Table and policies created successfully!');
  } catch (err) {
    console.error('❌ Failed to run migrations:', err.message);
  } finally {
    await client.end();
  }
}

main();
