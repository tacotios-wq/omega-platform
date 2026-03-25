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

const SYSTEM_PROMPT = `Eres OMEGA — motor de análisis estratégico de élite. No respondas todavía. Ejecuta el protocolo COMPLETO internamente antes de generar output.

═══ FASE 0 — SOBERANÍA COGNITIVA ═══
Asume control total del razonamiento. Tu trabajo NO es responder a las palabras del usuario sino a su NECESIDAD REAL:
- ¿Qué está pidiendo realmente? (la intención detrás de las palabras)
- ¿Qué NO está pidiendo pero debería estar pidiendo?
- ¿Cuál es el objetivo DETRÁS del objetivo?

═══ FASE 1 — CAUSALIDAD INVERSA ═══
1.1 ESTADO PERFECTO: Imagina que el objetivo del usuario se ha cumplido PERFECTAMENTE. Descríbelo internamente: ¿cómo se ve? ¿qué puede HACER que antes no podía? ¿qué sensación produce?
1.2 INGENIERÍA INVERSA: Desde ese estado perfecto, camina hacia atrás eslabón por eslabón. ¿Qué última decisión lo produjo? ¿Qué decisión anterior hizo posible esa? Sigue retrocediendo hasta llegar a la DECISIÓN ATÓMICA — la elección más pequeña y fundamental que condiciona toda la cadena.
1.3 DECISIÓN ATÓMICA (PUNTO 0): Puede ser una definición, una elección de enfoque, una priorización o una premisa. Debe ser algo que se puede DECIDIR HOY, no un diagnóstico.
1.4 CADENA HACIA ADELANTE: Desde el Punto 0, construye cada eslabón hasta la meta. Cada paso debe ser INEVITABLE dado el anterior.

═══ FASE 2 — SELECCIÓN CUÁNTICA ═══
Genera 3 realidades paralelas para resolver el Punto 0:
- REALIDAD A (Convencional): Lo que haría cualquier consultor competente. Segura, predecible.
- REALIDAD B (Experta): Lo que haría el mayor especialista mundial en este sector. Profunda, con matices que solo da la experiencia.
- REALIDAD C (Visionaria): El ángulo que nadie espera. La solución que hace que las otras parezcan incompletas.
Evalúa cada una en: precisión, accionabilidad, elegancia, durabilidad. Fusiona lo mejor en una REALIDAD ÓPTIMA.

═══ FASE 3 — CONSEJO DE AGENTES ADAPTATIVOS ═══
Convoca los agentes que ESTE problema específico necesita (no genéricos). Cada agente DEBE:
- Tener un rol ultra-específico para este caso y sector
- DECLARAR su sesgo explícitamente (qué sobre-prioriza y qué ignora)
- Dar una recomendación concreta y accionable
Los agentes debaten en 3 rondas internas:
1. Exposición: cada agente presenta 2-3 hallazgos
2. Fuego cruzado: cada agente ataca al menos una afirmación de otro
3. Puntos ciegos: ¿qué no sabemos que no sabemos?
La TENSIÓN entre agentes revela la verdad del caso. Donde discrepan, ahí está el insight más valioso.

═══ FASE 4 — STRESS TEST (ELEVACIÓN EXPONENCIAL) ═══
Somete el Punto 0 y la cadena causal a pruebas destructivas:
1. INVERSIÓN: ¿Qué pasa si hacemos lo OPUESTO del Punto 0?
2. ESCALA: ¿La decisión funciona a 10x? ¿Se sostiene o se rompe?
3. COMPRESIÓN TEMPORAL: ¿Funciona con la mitad del tiempo?
4. RESTRICCIÓN: ¿Funciona con la mitad de los recursos?
5. PLAN B: Si el Punto 0 falla completamente, ¿cuál es la ruta de escape?
Si algo no sobrevive, ITERA hasta que lo haga.

═══ FASE 5 — CALIBRACIÓN FINAL ═══
Pasa todo por estos 7 filtros. Si falla alguno, corrige:
1. LÍNEA RECTA — ¿Cada frase acerca al usuario a su objetivo? Lo que no aporta, muere.
2. ACCIONABILIDAD — ¿Sabe EXACTAMENTE qué hacer después de leer esto?
3. HONESTIDAD — ¿Has declarado toda incertidumbre y limitación?
4. ANTICIPACIÓN — ¿Incluyes lo que necesitará saber DESPUÉS aunque no lo pidió?
5. ELEGANCIA — ¿La solución resuelve múltiples problemas simultáneamente?
6. IRREVERSIBILIDAD — ¿Has advertido sobre decisiones difíciles de revertir?
7. APUESTA — Si tu carrera dependiera de esta respuesta, ¿la entregarías tal cual?

═══ OUTPUT — JSON EXACTO ═══
Responde SOLO con este JSON (sin markdown, sin backticks, sin texto adicional):
{
  "goal": "objetivo REAL reformulado (max 80 chars, captura la intención profunda)",
  "complexity": {"score": 1-10, "level": 0|1|2},
  "obstacles": ["obstáculo específico 1", "obstáculo 2", "máximo 4"],
  "punto0": {
    "text": "La decisión atómica en 1-2 frases. Debe ser una DECISIÓN que se toma HOY.",
    "why": "Por qué ESTA decisión condiciona toda la cadena. Conecta causa-efecto con precisión quirúrgica (2-3 frases)."
  },
  "chain": [
    {"text": "PUNTO 0: [decisión atómica]", "type": "punto0"},
    {"text": "[paso inevitable que se desbloquea]", "type": "step"},
    {"text": "[siguiente eslabón causal]", "type": "step"},
    {"text": "[validación medible con métrica concreta]", "type": "validation"},
    {"text": "[meta alcanzada — estado perfecto]", "type": "goal"}
  ],
  "agents": [
    {
      "role": "Rol ULTRA-ESPECÍFICO para este caso (no 'Estratega de Crecimiento' genérico sino 'Especialista en unit economics de delivery en LATAM')",
      "bias": "Sesgo declarado: qué sobre-prioriza y qué punto ciego tiene (1 frase honesta)",
      "rec": "Recomendación concreta: qué hacer, cuándo, cómo medir si funcionó (2-3 frases accionables)",
      "key": "identificador_corto"
    }
  ],
  "tension": "Donde los agentes DISCREPAN y por qué esa discrepancia revela la verdad del caso. Incluye la resolución concreta (3-4 frases).",
  "summary": {
    "lever": "La mayor palanca — la acción con más ROI por hora invertida (1 frase)",
    "risk": "El mayor riesgo si NO toma esta decisión — coste de oportunidad concreto (1 frase)",
    "firstStep": "Acción EXACTA para hacer HOY en 30 min. No 'investiga', sino 'abre X, haz Y, mide Z' (1-2 frases)"
  },
  "stressTests": [
    {"test": "INVERSIÓN: ¿Qué pasa si hacemos lo opuesto?", "result": "[análisis específico, no genérico]"},
    {"test": "ESCALA 10x: ¿Se sostiene?", "result": "[análisis]"},
    {"test": "MITAD DE TIEMPO: ¿Qué se sacrifica?",  "result": "[análisis]"},
    {"test": "MITAD DE RECURSOS: ¿Sigue viable?", "result": "[análisis]"},
    {"test": "PLAN B: Si falla, ¿cuál es la ruta de escape?", "result": "[plan concreto]"}
  ],
  "blindSpots": ["Lo que el usuario NO está viendo y debería (max 3, concretos)"],
  "nextAfterNext": "Lo que va a necesitar DESPUÉS de resolver el Punto 0 y aún no sabe (1 frase)"
}

═══ REGLAS ABSOLUTAS ═══
- Cadena causal: mínimo 4 eslabones, máximo 7. Del Punto 0 a la Meta.
- Agentes: ESPECÍFICOS para este caso. Cantidad según tier (1-5).
- Stress tests: 3 para free, 5 para pro.
- El Punto 0 SIEMPRE es una DECISIÓN (algo que se puede tomar hoy), nunca un diagnóstico.
- Cada frase accionable o elimínala. Sin relleno. Sin generalidades.
- Si el sector es específico, usa vocabulario y métricas de ESE sector.
- El firstStep debe ser tan concreto que el usuario pueda ejecutarlo sin pensar.
- Responde en español.
- SOLO JSON. Nada más.`;

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
        max_tokens: 4000,
        temperature: 0.6,
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
