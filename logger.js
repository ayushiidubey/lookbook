(async function () {
  const statusEl = document.getElementById('status');

  // Helper: parse UTM params
  const url = new URL(window.location.href);
  const utm = {
    source: url.searchParams.get('utm_source') || '',
    medium: url.searchParams.get('utm_medium') || '',
    campaign: url.searchParams.get('utm_campaign') || ''
  };

  try {
    // 1) Get public IP (ipify)
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();

    // 2) Optional: geo lookup (ipapi.co)
    let city = '', region = '', country = '';
    try {
      const geoRes = await fetch('https://ipapi.co/json/');
      if (geoRes.ok) {
        const g = await geoRes.json();
        city = g.city || '';
        region = g.region || '';
        country = g.country_name || g.country || '';
      }
    } catch {}

    // 3) Post to your Google Apps Script logger
    const payload = {
      ip,
      city,
      region,
      country,
      ua: navigator.userAgent,
      referrer: document.referrer || '',
      page: location.pathname + location.search + location.hash,
      utm
    };

    const resp = await fetch(
      'https://script.google.com/macros/s/AKfycbwQ0OYQ3ig_e62-U0Bh9hOV86WgqQzcCxM9rWmfgLYzrDiitTg5t-abb4_yZaGTepXFHQ/exec',
      {
        method: 'POST',
        mode: 'no-cors', // GAS returns opaque to browsers; that's fine for logging
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    // 4) Update UI (optional)
    if (statusEl) {
      statusEl.textContent = `Thanks for visiting!`;
    }
  } catch (e) {
    console.error(e);
    if (statusEl) {
      statusEl.textContent = 'Could not log visit.';
    }
  }
})();
