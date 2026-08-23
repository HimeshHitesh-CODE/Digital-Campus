import * as cheerio from 'cheerio';

async function check() {
  const res = await fetch('https://sbtetconnect.app/attendance');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const scripts = [];
  $('script[src]').each((i, el) => {
    scripts.push($(el).attr('src'));
  });
  console.log('Found scripts:', scripts);

  for (const src of scripts) {
    const fullUrl = src.startsWith('http') ? src : `https://sbtetconnect.app${src}`;
    const scriptRes = await fetch(fullUrl);
    const text = await scriptRes.text();
    
    // Look for API endpoints or Supabase / Firebase / Backend calls
    const apis = text.match(/https?:\/\/[a-zA-Z0-9_\-\.\/]+/g) || [];
    const filtered = [...new Set(apis)].filter(u => 
      !u.includes('w3.org') && !u.includes('github') && !u.includes('vercel')
    );
    if (filtered.length > 0) {
      console.log(`\nEndpoints in ${src}:`, filtered);
    }
  }
}

check().catch(console.error);
