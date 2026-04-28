const SHEET_URL = "https://script.google.com/macros/s/AKfycbweg-AtcSesL6fwqg7HOFDNqSGIEpkUbEUqv-DRy-0YCjE0zc5THGzkwqnaJ1sMrxtw/exec";
 
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }
 
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  try {
    const payload = JSON.parse(event.body);
 
    // Check URL length — if too long, truncate long text fields
    const safePayload = Object.assign({}, payload);
    const MAX_FIELD = 800;
    ['what_pff_does','pff_metrics','offensive_scheme','repetitive_task','error_scenario','motivation'].forEach(k => {
      if (safePayload[k] && safePayload[k].length > MAX_FIELD) {
        safePayload[k] = safePayload[k].substring(0, MAX_FIELD);
      }
    });
 
    const url = SHEET_URL + '?data=' + encodeURIComponent(JSON.stringify(safePayload));
 
    // Log URL length for debugging
    console.log('URL length:', url.length);
 
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch(e) { result = { status: 'error', message: text }; }
 
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ status: 'error', message: err.message })
    };
  }
};
 
