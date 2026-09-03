const https = require('https');

async function getUrl(url) {
  const res = await fetch(url);
  return res.text();
}

async function main() {
  const html = await getUrl('https://bandongho-ths.onrender.com/');
  console.log('HTML Length:', html.length);
  const scripts = [...html.matchAll(/src=["'](.*?)["']/g)].map(m => m[1]);
  console.log('Scripts:', scripts);

  // Let's check common API endpoints or script contents
  for (const src of scripts) {
    if (src.endsWith('.js') || src.includes('assets/')) {
      const fullUrl = src.startsWith('http') ? src : `https://bandongho-ths.onrender.com${src.startsWith('/') ? '' : '/'}${src}`;
      console.log('Fetching script:', fullUrl);
      const scriptContent = await getUrl(fullUrl);
      console.log('Script size:', scriptContent.length);
      
      // Look for fetch/api/shareholder/thinh/co dong/profit
      const matches = scriptContent.match(/(\/api\/[a-zA-Z0-9_\-\/]+|https?:\/\/[a-zA-Z0-9_\-\.\/:]+api[a-zA-Z0-9_\-\.\/:]*)/g) || [];
      console.log('API URLs found in script:', [...new Set(matches)]);
      
      // Look for "Thịnh" or "Cổ đông" or profit split
      const thinhMatches = scriptContent.match(/.{0,50}(?:Thịnh|Thinh|cổ đông|co dong|cổ phần|profit|dividend).{0,50}/gi) || [];
      console.log('Mentions of Thinh / Co dong (first 5):', thinhMatches.slice(0, 5));
    }
  }
}

main().catch(console.error);
