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

    // Send as POST with JSON body — eliminates URL length limits entirely
    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(SHEET_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          redirect: 'follow'
        });
        const text = await response.text();
        let result;
        try { result = JSON.parse(text); } catch(e) { result = { status: 'error', message: text }; }

        if (result.status === 'success') {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(result)
          };
        }
        lastError = result.message || 'Unknown error';
      } catch(fetchErr) {
        lastError = fetchErr.message;
      }
      // Wait before retry
      await new Promise(r => setTimeout(r, 3000));
    }

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ status: 'error', message: lastError })
    };

  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ status: 'error', message: err.message })
    };
  }
};
