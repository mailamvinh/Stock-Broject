export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { symbol } = req.query;
  const token = req.headers['authorization'];

  if (!symbol) {
    return res.status(400).json({ error: 'SYMBOL REQUIRED' });
  }
  if (!token) {
    return res.status(401).json({ error: 'TOKEN REQUIRED' });
  }

  try {
    // Try quote-ask-bid first (realtime bid/ask + last price)
    const response = await fetch(
      `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/quote-ask-bid`,
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

    console.log(`Quote ${symbol} status:`, response.status);
    return res.status(response.status).json(data);

  } catch (err) {
    console.log('Quote error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
