require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables.");
  process.exit(1);
}

const headers = {
  'apikey': supabaseServiceKey,
  'Authorization': `Bearer ${supabaseServiceKey}`,
  'Content-Type': 'application/json'
};

async function clean() {
  try {
    console.log("🧹 Identifying reports with deleted/null reporters...");

    // Fetch all reports
    const rReports = await fetch(`${supabaseUrl}/rest/v1/job_reports?select=id,reporter_id,reason`, {
      method: 'GET',
      headers
    });
    if (!rReports.ok) throw new Error("Failed to fetch reports");
    const reports = await rReports.json();
    console.log(`Fetched ${reports.length} total reports.`);

    // Find reports where reporter_id is null (because user deleted their account and it set to NULL)
    const orphanedReports = reports.filter(r => !r.reporter_id);
    console.log(`Found ${orphanedReports.length} reports with null reporters.`);

    let deletedCount = 0;
    for (const report of orphanedReports) {
      console.log(`Deleting report ${report.id} (Reason: ${report.reason}) because the reporter account was deleted.`);
      const rDel = await fetch(`${supabaseUrl}/rest/v1/job_reports?id=eq.${report.id}`, {
        method: 'DELETE',
        headers
      });
      if (rDel.ok) {
        deletedCount++;
      } else {
        console.error(`Failed to delete report ${report.id}: ${rDel.statusText}`);
      }
    }

    console.log(`\n✅ Cleanup complete. Deleted ${deletedCount} reports from deleted reporter accounts.`);

  } catch (err) {
    console.error("❌ Error cleaning database:", err);
  }
}

clean();
