async function inspectHeaders() {
  const url = 'https://sbtetconnect.app/_next/static/chunks/7267-8062ed4baf7bb6ff.js';
  const res = await fetch(url);
  const text = await res.text();

  // Find all headers or keys
  const headers = text.match(/headers:\s*\{[^}]+\}/g) || [];
  console.log('Headers found:', headers);

  // Search for strings around 'asia-south2.run.app'
  const idx = text.indexOf('asia-south2.run.app');
  if (idx !== -1) {
    console.log('Context around API URL:', text.slice(Math.max(0, idx - 200), idx + 300));
  }
}

inspectHeaders().catch(console.error);
