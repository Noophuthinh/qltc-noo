async function inspectMonthlyReports() {
  const res = await fetch('https://bandongho-ths.onrender.com/api/data');
  const json = await res.json();
  
  console.log('=== MONTHLY REPORTS SUMMARY ===');
  for (const [monthKey, report] of Object.entries(json.monthlyReports || {})) {
    console.log(`\n--- Month: ${monthKey} ---`);
    console.log('Summary:', JSON.stringify(report.summary, null, 2));
    if (report.shareholders) {
      console.log('Shareholders:', JSON.stringify(report.shareholders, null, 2));
    }
  }

  // Check app.js calculation of Thịnh's profit in monthly reports
  const appJsRes = await fetch('https://bandongho-ths.onrender.com/app.js');
  const appJs = await appJsRes.text();
  
  // Find the function or block that renders the monthly report table or shareholder profit
  const idx = appJs.indexOf('Thịnh (Cổ đông)');
  if (idx !== -1) {
    console.log('\n=== Context around "Thịnh (Cổ đông)" in app.js ===');
    console.log(appJs.slice(Math.max(0, idx - 500), Math.min(appJs.length, idx + 1000)));
  }
}

inspectMonthlyReports().catch(console.error);
