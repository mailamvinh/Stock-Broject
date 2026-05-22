export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();

  // Test with a hardcoded symbol to see raw DNSE response
  const symbol = req.query.symbol || 'VCB';

  const results = {};

  // Test endpoint 1
  try {
    const r1 = await fetch(
      `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/quote-ask-bid`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
    );
    results.endpoint1 = { status: r1.status, body: await r1.text() };
  } catch(e) { results.endpoint1 = { error: e.message }; }

  // Test endpoint 2 — without auth
  try {
    const r2 = await fetch(
      `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/quote-ask-bid`,
      { headers: { 'Accept': 'application/json' } }
    );
    results.endpoint2_noauth = { status: r2.status, body: await r2.text() };
  } catch(e) { results.endpoint2_noauth = { error: e.message }; }

  // Test endpoint 3 — trading price
  try {
    const r3 = await fetch(
      `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/trading-info`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
    );
    results.endpoint3 = { status: r3.status, body: await r3.text() };
  } catch(e) { results.endpoint3 = { error: e.message }; }

  // Test endpoint 4 — list all securities
  try {
    const r4 = await fetch(
      `https://api.dnse.com.vn/market-data-service/v2/securities?symbol=${symbol}`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
    );
    results.endpoint4 = { status: r4.status, body: (await r4.text()).slice(0, 500) };
  } catch(e) { results.endpoint4 = { error: e.message }; }

  res.status(200).json({ token_present: !!token, token_preview: token.slice(0,30)+'...', symbol, results });
}
