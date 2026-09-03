async function inspectWatchesAndSync() {
  const res = await fetch('https://bandongho-ths.onrender.com/api/data');
  const json = await res.json();
  
  console.log('Total watches:', json.watches?.length);
  const soldWatches = (json.watches || []).filter(w => w.status === 'Đã bán' || w.sold_price_vnd > 0);
  console.log('Sold watches count:', soldWatches.length);
  if (soldWatches.length > 0) {
    console.log('Sample sold watch:', soldWatches[0]);
  }
}

inspectWatchesAndSync().catch(console.error);
