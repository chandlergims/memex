require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

(async () => {
  try {
    // Use the URL provided in environment variables or fallback to a default
    const url = process.env.PRICE_UPDATE_URL || 'http://localhost:3000/api/cron/update-prices';
    console.log(`[CRON] Triggering price update at: ${url}`);
    
    const res = await fetch(url, {
      method: 'GET'
    });

    const data = await res.json();
    console.log('[CRON] Response:', data);

    process.exit(0);
  } catch (err) {
    console.error('[CRON ERROR]', err);
    process.exit(1);
  }
})();
