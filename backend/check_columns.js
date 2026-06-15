require('dotenv').config({path: './.env'});
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const url = `${supabaseUrl}/rest/v1/jobs?select=type&limit=10`;
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    const data = await response.json();
    console.log('Types in DB:', data);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
main();
