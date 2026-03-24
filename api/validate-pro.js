const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, email, licenseKey } = req.body;

    if (action === 'validate' && licenseKey) {
      // Validate license key with LemonSqueezy
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseKey })
      });

      const data = await response.json();

      if (data.valid) {
        return res.status(200).json({
          valid: true,
          customer_email: data.meta?.customer_email,
          variant_name: data.meta?.variant_name,
          expires_at: data.license_key?.expires_at
        });
      }

      return res.status(200).json({ valid: false, reason: data.error || 'License invalid' });
    }

    if (action === 'checkout' && email) {
      // Create checkout URL via LemonSqueezy API
      if (!LEMONSQUEEZY_API_KEY) {
        return res.status(200).json({
          checkoutUrl: null,
          message: 'Pagos en proceso de integración. Contacta @tacotios para acceso PRO.'
        });
      }

      const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`
        },
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: {
              checkout_data: {
                email: email,
                custom: { source: 'omega-platform' }
              }
            },
            relationships: {
              store: { data: { type: 'stores', id: LEMONSQUEEZY_STORE_ID } },
              variant: { data: { type: 'variants', id: process.env.LEMONSQUEEZY_VARIANT_ID } }
            }
          }
        })
      });

      if (!response.ok) {
        return res.status(200).json({
          checkoutUrl: null,
          message: 'Error creando checkout. Contacta @tacotios.'
        });
      }

      const data = await response.json();
      const checkoutUrl = data.data?.attributes?.url;

      return res.status(200).json({ checkoutUrl });
    }

    return res.status(400).json({ error: 'Action required: validate or checkout' });
  } catch (err) {
    console.error('Validate-pro error:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}
