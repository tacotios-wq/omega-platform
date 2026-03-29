export default function handler(req, res) {
  // Dynamic OG image as SVG served as image
  const punto0 = req.query.p ? decodeURIComponent(req.query.p).substring(0, 120) : '';
  const goal = req.query.g ? decodeURIComponent(req.query.g).substring(0, 80) : '';

  const isShared = punto0 && goal;

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#030307"/>
      <stop offset="100%" stop-color="#0d0d14"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#E99B2A"/>
      <stop offset="100%" stop-color="#F97316"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="620" width="1200" height="10" fill="url(#accent)"/>
  ${isShared ? `
    <text x="80" y="80" font-family="system-ui,sans-serif" font-size="20" fill="#9a9ab8" letter-spacing="4">OMEGA PLATFORM</text>
    <text x="80" y="140" font-family="system-ui,sans-serif" font-size="24" fill="#9a9ab8">Objetivo:</text>
    <text x="80" y="180" font-family="system-ui,sans-serif" font-size="32" fill="#F3EDE8" font-weight="600">${escSvg(goal)}</text>
    <rect x="80" y="220" width="100" height="4" fill="url(#accent)" rx="2"/>
    <text x="80" y="280" font-family="system-ui,sans-serif" font-size="22" fill="#E99B2A" letter-spacing="2">⚛️ PUNTO 0</text>
    <text x="80" y="330" font-family="system-ui,sans-serif" font-size="36" fill="#F3EDE8" font-weight="700">${escSvg(punto0.substring(0, 60))}</text>
    ${punto0.length > 60 ? `<text x="80" y="375" font-family="system-ui,sans-serif" font-size="36" fill="#F3EDE8" font-weight="700">${escSvg(punto0.substring(60, 120))}</text>` : ''}
    <text x="80" y="560" font-family="system-ui,sans-serif" font-size="22" fill="#9a9ab8">Encuentra tu Punto 0 →  omega-platform-gold.vercel.app</text>
    <text x="1120" y="80" font-family="system-ui,sans-serif" font-size="18" fill="#E99B2A" text-anchor="end">by @tacotios</text>
  ` : `
    <text x="600" y="120" font-family="system-ui,sans-serif" font-size="22" fill="#9a9ab8" text-anchor="middle" letter-spacing="6">OMEGA PLATFORM</text>
    <text x="600" y="240" font-family="system-ui,sans-serif" font-size="56" fill="#F3EDE8" text-anchor="middle" font-weight="800">No necesitas hacer más.</text>
    <text x="600" y="310" font-family="system-ui,sans-serif" font-size="56" fill="#E99B2A" text-anchor="middle" font-weight="800">Necesitas saber qué</text>
    <text x="600" y="380" font-family="system-ui,sans-serif" font-size="56" fill="#E99B2A" text-anchor="middle" font-weight="800">hacer primero.</text>
    <rect x="500" y="420" width="200" height="4" fill="url(#accent)" rx="2"/>
    <text x="600" y="480" font-family="system-ui,sans-serif" font-size="26" fill="#9a9ab8" text-anchor="middle">Encuentra tu Punto 0 — la decisión que desbloquea todo</text>
    <text x="600" y="560" font-family="system-ui,sans-serif" font-size="20" fill="#E99B2A" text-anchor="middle">Gratis · 60 segundos · by @tacotios</text>
  `}
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  return res.status(200).send(svg);
}

function escSvg(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
