import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

function verifySignature(rawBody, signature) {
  if (!WEBHOOK_SECRET || !signature) return false;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  const signature = req.headers['x-signature'];
  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name;
    const email = event.data?.attributes?.user_email;
    const licenseKey = event.data?.attributes?.license_key;

    console.log(`[webhook-ls] Event: ${eventName}, Email: ${email}`);

    // Events we care about:
    // subscription_created, subscription_updated, subscription_payment_success
    // license_key_created
    if (['subscription_created', 'license_key_created'].includes(eventName)) {
      // In a full implementation, store this in a database
      // For now, the license key validation happens client-side via /api/validate-pro
      console.log(`[webhook-ls] PRO activated for ${email}, key: ${licenseKey}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook-ls] Error:', err);
    return res.status(400).json({ error: 'Invalid payload' });
  }
}
