require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const url = `${supabaseUrl}/rest/v1/jobs?select=*&limit=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    const data = await response.json();
    if (data.error) {
      console.error('Error:', data.error);
    } else {
      console.log('Columns in jobs:', data.length > 0 ? Object.keys(data[0]) : 'No jobs found');
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

main();
