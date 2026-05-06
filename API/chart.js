export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol, resolution = 'D' } = req.query;
  const token = req.headers['authorization'];

  if (!symbol) {
    return res.status(400).json({ error: 'SYMBOL REQUIRED' });
  }
  if (!token) {
    return res.status(401).json({ error: 'TOKEN REQUIRED' });
  }

  // Calculate from/to timestamps based on resolution
  const to = Math.floor(Date.now() / 1000);
  const ranges = { '1': 7, 'D': 365, 'W': 730, 'M': 1825 };
  const days = ranges[resolution] || 365;
  const from = to - (days * 24 * 60 * 60);

  try {
    const response = await fetch(
      `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/bars?resolution=${resolution}&from=${from}&to=${to}`,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    console.log(`Chart ${symbol} (${resolution}) status:`, response.status);
    return res.status(response.status).json(data);

  } catch (err) {
    console.log('Chart error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
