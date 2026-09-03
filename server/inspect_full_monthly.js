async function inspectFullMonthlyReports() {
  const res = await fetch('https://bandongho-ths.onrender.com/api/data');
  const json = await res.json();
  
  const mReports = json.monthlyReports || {};
  for (const [mName, mData] of Object.entries(mReports)) {
    console.log(`\n=================== ${mName} ===================`);
    console.log('Keys:', Object.keys(mData));
    console.log('Summary:', mData.summary);
    if (mData.sales) {
      console.log(`Sales count: ${mData.sales.length}`);
      if (mData.sales.length > 0) {
        console.log('First sale:', mData.sales[0]);
      }
    }
  }
}

inspectFullMonthlyReports().catch(console.error);
