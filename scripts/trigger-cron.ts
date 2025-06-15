import 'dotenv/config';

(async () => {
  try {
    // Use Railway's public domain environment variable
    const url = `${process.env.RAILWAY_PUBLIC_DOMAIN}/api/cron/update-prices`;
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
