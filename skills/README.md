# Omega Skills Ecosystem

Three modular skills that chain together to form a self-driving strategic engine.

## The Chain

```
omega-protocol  →  "Tu Punto 0 es X, aquí están las misiones"
       ↓
omega-planner   →  "Para ejecutar Misión 1, sigue estas 4 fases"
       ↓
    [Execute]   →  Solo el Punto 0. Nada más.
       ↓
omega-auditor   →  "Ahora el nuevo Punto 0 es Y (ratio 2.5x)"
       ↓
    [Repeat until ratio < 2x]
```

## Skills

### 1. omega-protocol — El cerebro
Deep strategic analysis using inverse causality, adaptive agents with declared biases, and stress testing. Takes a goal → outputs Punto 0 + missions + executable prompts.

### 2. omega-planner — Las manos
Transforms any action into a phased execution plan. Each phase: ≤2 hours, specific deliverable, validation step, dependency chain.

### 3. omega-auditor — Los ojos
Diagnostic engine that analyzes any project (code, docs, business) to find the single highest-impact action by impact/effort ratio. Self-driving: outputs its own re-audit prompt.

### 4. omega-max — El núcleo
Maximum-depth protocol for high-complexity, high-impact decisions. Includes 6 phases, anti-patterns, Six Thinking Hats, Meta-Council, 7 Final Filters and delivery format. The NUCLEAR option — maximum rigor, maximum depth.

## Usage

Each skill is a standalone SKILL.md — drop it into any Claude environment that supports custom instructions.

**Start here:** Tell Claude "aplica protocolo omega" + your goal.
