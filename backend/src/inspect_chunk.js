async function inspect() {
  const urls = [
    'https://sbtetconnect.app/_next/static/chunks/app/attendance/page-41b54a3ab40068b3.js',
    'https://sbtetconnect.app/_next/static/chunks/7267-8062ed4baf7bb6ff.js',
  ];

  for (const u of urls) {
    const res = await fetch(u);
    const text = await res.text();
    console.log(`\n--- Inspecting ${u} ---`);
    // Find all strings with /api/ or attendance or pin
    const quotes = text.match(/["'`][^"'`]{2,80}["'`]/g) || [];
    const relevant = quotes
      .map(s => s.slice(1, -1))
      .filter(s => s.includes('attendance') || s.includes('student') || s.includes('asia-south2') || s.includes('/api/'));
    console.log('Relevant strings:', [...new Set(relevant)]);
  }
}

inspect().catch(console.error);
