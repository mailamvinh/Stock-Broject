export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Get token from query param OR header (so we can test from browser)
  const tokenFromQuery = req.query.token || '';
  const authHeader = req.headers['authorization'] || '';
  const token = tokenFromQuery || authHeader.replace('Bearer ', '').trim();
  const symbol = req.query.symbol || 'VCB';

  const results = {};
  const headers = token
    ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    : { 'Accept': 'application/json' };

  // Try every known DNSE/entrade domain and path
  const tests = [
    ['entrade_quote',    `https://services.entrade.com.vn/dnse-price-service/securities/${symbol}`],
    ['entrade_chart',    `https://services.entrade.com.vn/dnse-price-service/securities/${symbol}/bars?resolution=D&from=1700000000&to=${Math.floor(Date.now()/1000)}`],
    ['entrade_auth_me',  `https://services.entrade.com.vn/dnse-auth-service/me`],
    ['api_dnse_me',      `https://api.dnse.com.vn/user-service/api/me`],
    ['api_dnse_investor',`https://api.dnse.com.vn/user-service/api/investor`],
    ['api_dnse_accounts',`https://api.dnse.com.vn/order-service/v2/account`],
    ['entrade_order',    `https://services.entrade.com.vn/dnse-order-service/accounts`],
  ];

  for (const [name, url] of tests) {
    try {
      const r = await fetch(url, { headers });
      const body = (await r.text()).slice(0, 400);
      results[name] = { status: r.status, body };
    } catch(e) {
      results[name] = { error: e.message };
    }
  }

  res.status(200).json({
    token_present: !!token,
    token_preview: token ? token.slice(0, 30) + '...' : 'NONE — add ?token=YOUR_JWT_TOKEN to URL',
    symbol,
    results
  });
}
