# Omega Skills Ecosystem

Three modular skills that chain together to form a self-driving strategic engine.

## The Chain

```
omega-protocol  â  "Tu Punto 0 es X, aquÃ­ estÃ¡n las misiones"
       â
omega-planner   â  "Para ejecutar MisiÃ³n 1, sigue estas 4 fases"
       â
    [Execute]   â  Solo el Punto 0. Nada mÃ¡s.
       â
omega-auditor   â  "Ahora el nuevo Punto 0 es Y (ratio 2.5x)"
       â
    [Repeat until ratio < 2x]
```

## Skills

### 1. `omega-protocol` â El cerebro
Deep strategic analysis using inverse causality, adaptive agents with declared biases, and stress testing. Takes a goal â outputs Punto 0 + missions + executable prompts.

### 2. `omega-planner` â Las manos
Transforms any action into a phased execution plan. Each phase: â¤2 hours, specific deliverable, validation step, dependency chain.

### 3. `omega-auditor` â Los ojos
Diagnostic engine that analyzes any project (code, docs, business) to find the single highest-impact action by impact/effort ratio. Includes a Python script for automated code analysis.

## Installation

Copy each skill folder into your `.skills/skills/` directory:
```
.skills/skills/omega-auditor/SKILL.md
.skills/skills/omega-auditor/scripts/omega_audit.py
.skills/skills/omega-planner/SKILL.md
.skills/skills/omega-protocol/SKILL.md
```

## Eval Results

| Skill | With Skill | Without Skill | Delta |
|-------|-----------|--------------|-------|
| omega-auditor | 100% (5/5) | 40% (2/5) | +60% |
| omega-planner | 100% (5/5) | 0% (0/5) | +100% |
| omega-protocol | 100% (5/5) | 0% (0/5) | +100% |

The skills' main value: forcing single-priority focus, numerical scoring, structured formats, and the Omega methodology (inverse causality, agent tensions, stress testing) that generic AI advice lacks.
