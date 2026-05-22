export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol } = req.query;
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!symbol) return res.status(400).json({ error: 'SYMBOL REQUIRED' });
  if (!token)  return res.status(401).json({ error: 'TOKEN REQUIRED' });

  // Try multiple DNSE endpoints in order
  const endpoints = [
    `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/quote-ask-bid`,
    `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/quote`,
    `https://api.dnse.com.vn/market-data-service/v1/securities/${symbol}/quote`,
  ];

  for (const url of endpoints) {
    try {
      console.log(`Trying: ${url}`);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const text = await response.text();
      console.log(`${symbol} → ${response.status}: ${text.slice(0, 300)}`);

      if (response.ok) {
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
