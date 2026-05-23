export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol } = req.query;
  const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (!symbol) return res.status(400).json({ error: 'SYMBOL REQUIRED' });
  if (!token)  return res.status(401).json({ error: 'TOKEN REQUIRED' });

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  // Try correct DNSE/entrade endpoints in order
  const endpoints = [
    `https://services.entrade.com.vn/dnse-price-service/securities/${symbol}`,
    `https://services.entrade.com.vn/dnse-market-data-service/v2/securities/${symbol}/quote`,
    `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/quote`,
    `https://api.dnse.com.vn/quote-service/v2/securities/${symbol}`,
  ];

  for (const url of endpoints) {
    try {
      const r = await fetch(url, { headers });
      const text = await r.text();
      console.log(`${symbol} ${url} → ${r.status}: ${text.slice(0,200)}`);
      if (r.ok) {
        let data;
        try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }
        return res.status(200).json(data);
      }
    } catch(e) {
      console.log(`Failed ${url}:`, e.message);
    }
  }

  return res.status(503).json({ error: 'ALL_ENDPOINTS_FAILED', symbol });
}
