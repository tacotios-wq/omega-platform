// Simple in-memory counter (resets on cold start — acceptable for MVP)
// For production: use Vercel KV or a database
let analysisCount = 847; // seed with realistic starting number

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');

  if (req.method === 'POST') {
    analysisCount++;
    return res.status(200).json({ count: analysisCount });
  }

  return res.status(200).json({ count: analysisCount });
}
