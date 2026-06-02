async function main() {
  const url = 'https://dns.google/resolve?name=db.mbmgulgrgxruptfaodus.supabase.co';
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('DNS Answer:', data.Answer);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

main();
