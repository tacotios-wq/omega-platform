const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const ipRequests = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const requests = ipRequests.get(ip) || [];
  const recent = requests.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  ipRequests.set(ip, recent);
  return true;
}

const SYSTEM_PROMPT = `Eres Omega — un motor de análisis estratégico basado en causalidad inversa.

Tu trabajo es encontrar el PUNTO 0: la decisión atómica más pequeña que condiciona toda la cadena de éxito del usuario.

PROCESO (ejecútalo internamente, NO lo muestres):
1. Identifica la intención REAL (no literal) del usuario
2. Imagina el resultado perfecto y retrocede hasta la decisión raíz
3. Genera 3 caminos (convencional, experto, visionario) y fusiona lo mejor
4. Convoca agentes especializados que ESTE problema necesita
5. Somete todo a stress test: ¿funciona al revés? ¿a 10x? ¿con la mitad?
6. Calibra: cada palabra debe ganarse su lugar

RESPONDE SIEMPRE en este JSON exacto (sin markdown, sin backticks, SOLO JSON):
{
  "goal": "objetivo reformulado en 1 frase (max 80 chars)",
  "complexity": {"score": 1-10, "level": 0|1|2},
  "obstacles": ["obstáculo 1", "obstáculo 2", ...],
  "punto0": {
    "text": "La decisión atómica en 1-2 frases",
    "why": "Por qué ESTA es la decisión que condiciona todo (2-3 frases)"
  },
  "chain": [
    {"text": "Punto 0 descrito", "type": "punto0"},
    {"text": "Paso que se desbloquea", "type": "step"},
    {"text": "Siguiente paso", "type": "step"},
    {"text": "Validación medible", "type": "validation"},
    {"text": "Meta alcanzada", "type": "goal"}
  ],
  "agents": [
    {
      "role": "Rol específico para ESTE caso",
      "bias": "Sesgo declarado de este agente",
      "rec": "Recomendación concreta y accionable (2-3 frases)",
      "key": "identificador_corto"
    }
  ],
  "tension": "Dónde discrepan los agentes y cómo resolverlo (2-3 frases)",
  "summary": {
    "lever": "La mayor palanca (1 frase)",
    "risk": "El mayor riesgo si NO tomas esta decisión (1 frase)",
    "firstStep": "Acción concreta para hacer HOY en 30 min (1-2 frases)"
  },
  "stressTests": [
    {"test": "¿Qué pasa si hacemos lo OPUESTO?", "result": "respuesta"},
    {"test": "¿Funciona a 10x escala?", "result": "respuesta"},
    {"test": "¿Funciona con la mitad del tiempo?", "result": "respuesta"},
    {"test": "¿Funciona con la mitad de los recursos?", "result": "respuesta"},
    {"test": "¿Cuál es el plan B si falla?", "result": "respuesta"}
  ]
}

REGLAS:
- La cadena causal SIEMPRE va del Punto 0 (inicio) a la Meta (final). Mínimo 4 eslabones, máximo 7.
- Los agentes deben ser ESPECÍFICOS para este caso (no genéricos). Entre 1 y 5 según el tier.
- Los stress tests: 3 para free, 5 para pro.
- Sé directo. Sin relleno. Cada frase accionable o elimínala.
- El Punto 0 debe ser una DECISIÓN (algo que se puede tomar hoy), no un diagnóstico.
- Responde en español.`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Demasiadas solicitudes. Espera un momento.' });

  // Validate API key
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  try {
    const { text, context, tier } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 30) {
      return res.status(400).json({ error: 'El objetivo debe tener al menos 30 caracteres.' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: 'El objetivo no puede superar 2000 caracteres.' });
    }

    const agentCount = tier === 'pro' ? 5 : 1;
    const stressCount = tier === 'pro' ? 5 : 3;

    const userMessage = `OBJETIVO DEL USUARIO:
${text.trim()}

CONTEXTO:
- Sector: ${context?.sector || 'no especificado'}
- Horizonte: ${context?.timeline || 'no especificado'}
- Equipo: ${context?.team || 'no especificado'}
- Presupuesto: ${context?.budget || 'no especificado'}

TIER: ${tier || 'free'}
- Genera exactamente ${agentCount} agente(s) adaptativo(s)
- Genera exactamente ${stressCount} stress test(s)

Responde SOLO con el JSON. Sin texto adicional.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', response.status, errorData);
      return res.status(502).json({ error: 'Error al procesar el análisis. Intenta de nuevo.' });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return res.status(502).json({ error: 'Respuesta vacía del motor de análisis.' });
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let result;
    try {
      const jsonStr = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
      result = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message, 'Content:', content.substring(0, 200));
      return res.status(502).json({ error: 'Error al interpretar el análisis. Intenta de nuevo.' });
    }

    // Validate required fields
    const required = ['goal', 'punto0', 'chain', 'agents', 'summary'];
    for (const field of required) {
      if (!result[field]) {
        return res.status(502).json({ error: `Análisis incompleto (falta ${field}). Intenta de nuevo.` });
      }
    }

    return res.status(200).json({ result, model: 'claude-sonnet-4-20250514' });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Error interno. Intenta de nuevo.' });
  }
}
