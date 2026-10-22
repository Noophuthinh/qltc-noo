const SHEET_ID = '16fJEGPnYfesl472G9QP9G0spdguhXf9cUyIr8AP8F2E';

function parseAmount(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0;
}

async function fetchTabTable(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  const text = await res.text();
  const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return JSON.parse(jsonStr).table;
}

async function main() {
  const table = await fetchTabTable('tháng 10');
  console.log('Total rows in sheet:', table.rows.length);
  
  let inc = 0, exp = 0;
  const rows = [];
  let lastDate = '10/01/2026';
  
  table.rows.forEach((r, idx) => {
    const cells = r.c || [];
    const dateCell = cells[7];
    const typeCell = cells[8];
    const typeStr = String(typeCell?.v || '').toLowerCase();
    
    if (typeStr.includes('thu') || typeStr.includes('chi')) {
      const amt = parseAmount(cells[10]?.v || cells[10]?.f);
      if (amt > 0) {
        const dateDisplay = dateCell ? (dateCell.f || dateCell.v || lastDate) : lastDate;
        if (dateCell && (dateCell.f || dateCell.v)) lastDate = dateDisplay;
        
        const cat = String(cells[9]?.v || '').trim();
        const note = String(cells[12]?.v || '').trim();
        const isInc = typeStr.includes('thu');
        
        rows.push({ row: idx + 1, date: dateDisplay, type: isInc ? 'THU' : 'CHI', amt, cat, note });
        if (isInc) inc += amt;
        else exp += amt;
      }
    }
  });
  
  console.log('\n=== ALL ROWS ===');
  rows.forEach(r => {
    console.log(`Row ${r.row}: ${r.date} | ${r.type} | ${r.amt.toLocaleString()} | ${r.cat} | ${r.note}`);
  });
  
  console.log('\n=== TOTALS ===');
  console.log('Income:', inc.toLocaleString());
  console.log('Expense:', exp.toLocaleString());
  console.log('Net:', (inc - exp).toLocaleString());
}

main().catch(console.error);
