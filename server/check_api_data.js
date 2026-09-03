async function checkData() {
  const res = await fetch('https://bandongho-ths.onrender.com/api/data');
  const json = await res.json();
  console.log('Top level keys:', Object.keys(json));
  
  if (json.shareholders || json.co_dong || json.shareholder_distribution || json.profit_distribution) {
    console.log('Found shareholder data!');
  }

  // Check all keys and nested structures
  for (const k of Object.keys(json)) {
    const val = json[k];
    console.log(`Key "${k}":`, typeof val, Array.isArray(val) ? `Array[${val.length}]` : typeof val === 'object' ? Object.keys(val || {}) : val);
  }

  // Look for "Thịnh" in JSON
  const jsonStr = JSON.stringify(json);
  console.log('Mentions of "Thịnh" in JSON:', (jsonStr.match(/Thịnh/gi) || []).length);
  
  // Let's inspect app.js logic for "Thịnh" or shareholder monthly reports
  const appJsRes = await fetch('https://bandongho-ths.onrender.com/app.js');
  const appJs = await appJsRes.text();
  const thinhLines = appJs.split('\n').filter(line => line.toLowerCase().includes('thịnh') || line.includes('Thinh') || line.includes('cổ đông') || line.includes('co_dong'));
  console.log('Lines in app.js matching Thinh / Cổ đông:');
  thinhLines.slice(0, 20).forEach((l, i) => console.log(`${i}: ${l.trim()}`));
}

checkData().catch(console.error);
