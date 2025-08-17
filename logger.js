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

    // Default values
    let city = '', region = '', country = '', lat = '', lon = '';

    // 2) Try Browser Geolocation (more accurate)
    if ("geolocation" in navigator) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
            resolve();
          },
          (err) => {
            console.warn("Geolocation denied or failed:", err);
            resolve();
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
    }

    // 3) If no geolocation, fallback to IP-based lookup
    if (!lat || !lon) {
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        if (geoRes.ok) {
          const g = await geoRes.json();
          city = g.city || '';
          region = g.region || '';
          country = g.country_name || g.country || '';
          lat = g.latitude || '';
          lon = g.longitude || '';
        }
      } catch {}
    }

    // 4) Post to your Google Apps Script logger
    const payload = {
      ip,
      city,
      region,
      country,
      lat,
      lon,
      ua: navigator.userAgent,
      referrer: document.referrer || '',
      page: location.pathname + location.search + location.hash,
      utm
    };

    await fetch('https://script.google.com/macros/s/AKfycbwQ0OYQ3ig_e62-U0Bh9hOV86WgqQzcCxM9rWmfgLYzrDiitTg5t-abb4_yZaGTepXFHQ/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    statusEl.textContent = `Thanks for visiting!`;
  } catch (e) {
    console.error(e);
    statusEl.textContent = 'Could not log visit.';
  }
})();
