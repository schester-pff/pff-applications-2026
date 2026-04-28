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
    const url = SHEET_URL + '?data=' + encodeURIComponent(JSON.stringify(payload));
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
