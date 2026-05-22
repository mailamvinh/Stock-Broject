export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol, resolution = 'D' } = req.query;
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!symbol) return res.status(400).json({ error: 'SYMBOL REQUIRED' });
  if (!token)  return res.status(401).json({ error: 'TOKEN REQUIRED' });

  const to   = Math.floor(Date.now() / 1000);
  const days = { '1':7, 'D':365, 'W':730, 'M':1825 }[resolution] || 365;
  const from = to - days * 86400;

  const endpoints = [
    `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/bars?resolution=${resolution}&from=${from}&to=${to}`,
    `https://api.dnse.com.vn/market-data-service/v1/bars?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`,
  ];

  for (const url of endpoints) {
    try {
      console.log(`Chart trying: ${url}`);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const text = await response.text();
      console.log(`Chart ${symbol} → ${response.status}: ${text.slice(0, 200)}`);

      if (response.ok) {
        let data;
        try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }
        return res.status(200).json(data);
      }
    } catch(e) {
      console.log(`Chart failed ${url}:`, e.message);
    }
  }

  return res.status(503).json({ error: 'ALL_ENDPOINTS_FAILED', symbol });
}
