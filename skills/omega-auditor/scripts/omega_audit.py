#!/usr/bin/env python3
"""
Omega Auditor â Generic diagnostic engine.
Analyzes any text-based project file and applies the Omega Protocol
to find the single highest-impact action.

Usage:
    python omega_audit.py <path-to-file> [--type html|python|markdown|text]
"""
import re, json, sys, os

def load_file(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def detect_type(path, content):
    """Auto-detect project type from extension and content."""
    ext = os.path.splitext(path)[1].lower()
    type_map = {
        '.html': 'html', '.htm': 'html',
        '.py': 'python',
        '.js': 'javascript', '.jsx': 'javascript', '.ts': 'javascript', '.tsx': 'javascript',
        '.md': 'markdown', '.mdx': 'markdown',
        '.css': 'css',
        '.json': 'json',
        '.yaml': 'yaml', '.yml': 'yaml',
    }
    if ext in type_map:
        return type_map[ext]
    if '<html' in content[:500].lower() or '<!doctype' in content[:500].lower():
        return 'html'
    if 'import ' in content[:1000] and 'def ' in content:
        return 'python'
    return 'text'

# âââ STRUCTURAL AUDIT âââââââââââââââââââââââââââââââââââââââ

def audit_structure(content, ftype):
    """Check structural integrity. Returns list of issue strings."""
    issues = []

    # Universal: bracket/paren/brace matching
    for name, o, c in [('braces','{','}'), ('parens','(',')'), ('brackets','[',']')]:
        if content.count(o) != content.count(c):
            issues.append(f"CRITICAL: {name} mismatch: {content.count(o)} open / {content.count(c)} close")

    if ftype == 'html':
        # Check div matching
        div_o = len(re.findall(r'<div[\s>]', content))
        div_c = content.count('</div>')
        if div_o != div_c:
            issues.append(f"CRITICAL: div mismatch: {div_o} open / {div_c} close")
        # Check other common tags
        for tag in ['section', 'main', 'header', 'footer', 'nav', 'article', 'aside']:
            t_o = len(re.findall(f'<{tag}[\\s>]', content))
            t_c = content.count(f'</{tag}>')
            if t_o != t_c:
                issues.append(f"WARNING: <{tag}> mismatch: {t_o}/{t_c}")

    elif ftype == 'python':
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            stripped = line.rstrip()
            if stripped and not stripped.startswith('#'):
                # Check for common syntax issues
                if stripped.count('(') != stripped.count(')') and not stripped.endswith('\\'):
                    # Multi-line expressions are ok, just flag single-line mismatches
                    pass
        # Check for undefined references (basic)
        imports = set(re.findall(r'^(?:from\s+(\S+)|import\s+(\S+))', content, re.MULTILINE))

    elif ftype == 'javascript':
        # Check for unclosed template literals
        if content.count('`') % 2 != 0:
            issues.append("WARNING: Odd number of backticks â possible unclosed template literal")

    elif ftype == 'json':
        try:
            json.loads(content)
        except json.JSONDecodeError as e:
            issues.append(f"CRITICAL: Invalid JSON â {e}")

    return issues

# âââ UX / EXPERIENCE AUDIT ââââââââââââââââââââââââââââââââââ

def audit_ux(content, ftype):
    """Audit user/stakeholder experience. Returns dict of key -> (impact, effort, description)."""
    scores = {}
    lines = content.split('\n')
    line_count = len(lines)

    if ftype == 'html':
        # No loading/feedback states
        if 'loading' not in content.lower() and 'spinner' not in content.lower():
            scores['no_loading_state'] = (6, 2, "No loading or processing feedback. Users don't know if actions are working.")
        # No error handling visible
        if 'error' not in content.lower() and 'catch' not in content.lower():
            scores['no_error_handling'] = (7, 3, "No visible error handling. When things fail, users see nothing.")
        # No empty states
        if 'empty' not in content.lower() and 'no hay' not in content.lower() and 'nothing' not in content.lower():
            scores['no_empty_state'] = (4, 2, "No empty state messages. Empty lists/sections show blank space.")
        # No responsive design
        media_count = len(re.findall(r'@media', content))
        if media_count < 3:
            scores['weak_responsive'] = (7, 5, f"Only {media_count} @media queries. Likely broken on mobile.")
        # No accessibility
        aria_count = len(re.findall(r'aria-', content))
        if aria_count < 5:
            scores['poor_accessibility'] = (5, 4, f"Only {aria_count} ARIA attributes. Not accessible to screen readers.")
        # No meta tags
        if '<meta name="description"' not in content:
            scores['no_meta_description'] = (3, 1, "Missing meta description tag for SEO.")

    elif ftype == 'python':
        # No docstrings
        func_count = len(re.findall(r'^\s*def\s+', content, re.MULTILINE))
        doc_count = len(re.findall(r'""".*?"""', content, re.DOTALL))
        if func_count > 3 and doc_count < func_count * 0.5:
            scores['low_docstring_coverage'] = (5, 3, f"{doc_count}/{func_count} functions have docstrings. Hard to understand/maintain.")
        # No type hints
        typed_funcs = len(re.findall(r'def\s+\w+\(.*?:\s*\w+', content))
        if func_count > 3 and typed_funcs < func_count * 0.3:
            scores['no_type_hints'] = (4, 4, "Most functions lack type hints. Harder to use and debug.")
        # No logging
        if 'logging' not in content and 'logger' not in content:
            scores['no_logging'] = (5, 2, "No logging framework. When things break in production, no trail to follow.")
        # No error handling
        try_count = content.count('try:')
        if func_count > 5 and try_count < 2:
            scores['minimal_error_handling'] = (7, 3, "Very few try/except blocks. Errors will crash ungracefully.")

    elif ftype in ('markdown', 'text'):
        # No structure
        heading_count = len(re.findall(r'^#+\s', content, re.MULTILINE))
        if line_count > 50 and heading_count < 3:
            scores['poor_structure'] = (6, 2, "Long document with few headings. Hard to navigate and scan.")
        # No executive summary
        if line_count > 100 and 'summary' not in content[:500].lower() and 'resumen' not in content[:500].lower():
            scores['no_summary'] = (7, 3, "Long document with no summary at the top. Reader doesn't know what they're getting into.")

    # Universal checks
    if line_count > 500:
        # Very long file â might need splitting
        scores['file_too_long'] = (3, 6, f"File is {line_count} lines. Consider splitting into modules for maintainability.")

    # TODO/FIXME/HACK count
    todo_count = len(re.findall(r'(?:TODO|FIXME|HACK|XXX)', content))
    if todo_count > 5:
        scores['many_todos'] = (4, 3, f"{todo_count} TODO/FIXME markers. Technical debt accumulating.")

    return scores

# âââ GOAL READINESS AUDIT âââââââââââââââââââââââââââââââââââ

def audit_goal(content, ftype):
    """Audit readiness to achieve the project's goal. Returns dict of key -> (impact, effort, description)."""
    scores = {}

    if ftype == 'html':
        # No analytics
        if 'analytics' not in content.lower() and 'gtag' not in content.lower() and 'plausible' not in content.lower():
            scores['no_analytics'] = (4, 2, "No analytics tracking. Can't measure what you can't track.")
        # No social proof
        if 'testimoni' not in content.lower() and 'review' not in content.lower():
            scores['no_social_proof'] = (5, 6, "No testimonials or social proof. Trust is harder to build without it.")
        # No call to action in first screenful
        first_screen = content[:3000]
        cta_words = ['sign up', 'get started', 'try', 'start', 'comenzar', 'empezar', 'registr']
        if not any(w in first_screen.lower() for w in cta_words):
            scores['no_early_cta'] = (6, 2, "No clear CTA in the first screenful. Visitors don't know what to do.")

    elif ftype == 'python':
        # No tests
        if 'test_' not in content and 'unittest' not in content and 'pytest' not in content:
            scores['no_tests'] = (6, 5, "No test functions or test framework. Can't verify correctness.")
        # No README reference
        # (Can't check README from here, but flag if this is a main module without docs)
        if '__main__' in content and 'argparse' not in content and 'click' not in content:
            scores['no_cli_interface'] = (4, 3, "Has __main__ but no argument parser. Hard for others to use.")

    return scores

# âââ OMEGA PROTOCOL âââââââââââââââââââââââââââââââââââââââââ

def apply_omega(structural, ux, goal):
    """Apply the Omega Protocol: find the single highest-impact action."""
    # Structural issues are always #1
    if structural:
        return {
            'punto_0': 'STRUCTURAL_ERROR',
            'action': 'Fix structural issues: ' + '; '.join(structural),
            'impact': 10,
            'effort': 1,
            'ratio': 10.0,
            'category': 'structural',
            'chain': [
                'Punto 0: Structural integrity is broken.',
                'â If NOT fixed: Nothing else works reliably.',
                'â If fixed: Foundation is solid, can build on top.'
            ],
            'total_issues': len(structural) + len(ux) + len(goal)
        }

    # Merge and rank
    all_scores = {}
    all_scores.update(ux)
    all_scores.update(goal)

    if not all_scores:
        return {
            'punto_0': 'NONE',
            'action': 'No high-impact issues found. Project is in good shape.',
            'impact': 0, 'effort': 0, 'ratio': 0,
            'category': 'done',
            'total_issues': 0
        }

    ranked = []
    for key, (impact, effort, desc) in all_scores.items():
        ratio = round(impact / max(effort, 1), 2)
        ranked.append({
            'key': key, 'impact': impact, 'effort': effort,
            'ratio': ratio, 'description': desc,
            'category': 'ux' if key in ux else 'goal'
        })

    ranked.sort(key=lambda x: x['ratio'], reverse=True)
    best = ranked[0]

    not_fixed_msg = 'user can\'t get value' if best['category']=='ux' else 'project can\'t reach its goal'
    if_fixed_msg = 'core value delivery' if best['category']=='ux' else 'goal achievement'

    return {
        'punto_0': best['key'],
        'action': best['description'],
        'impact': best['impact'],
        'effort': best['effort'],
        'ratio': best['ratio'],
        'category': best['category'],
        'chain': [
            f"Punto 0: {best['description'][:80]}...",
            f"â Impact: {best['impact']}/10 | Effort: {best['effort']}/10 | Ratio: {best['ratio']}x",
            f"â If NOT fixed: {not_fixed_msg}",
            f"â If fixed: unlocks {if_fixed_msg}"
        ],
        'runner_up': ranked[1] if len(ranked) > 1 else None,
        'total_issues': len(ranked),
        'all_ranked': ranked[:5]
    }

# âââ MAIN ââââââââââââââââââââââââââââââââââââââââââââââââââââ

def main():
    if len(sys.argv) < 2:
        print("Usage: python omega_audit.py <file> [--type html|python|markdown|text]")
        sys.exit(1)

    path = sys.argv[1]
    forced_type = None
    if '--type' in sys.argv:
        idx = sys.argv.index('--type')
        if idx + 1 < len(sys.argv):
            forced_type = sys.argv[idx + 1]

    content = load_file(path)
    ftype = forced_type or detect_type(path, content)

    print(f"{'='*55}")
    print(f"OMEGA AUDITOR â Automatic Diagnosis")
    print(f"{'='*55}")
    print(f"File: {path}")
    print(f"Type: {ftype}")
    print(f"Lines: {len(content.splitlines())}")

    structural = audit_structure(content, ftype)
    ux = audit_ux(content, ftype)
    goal = audit_goal(content, ftype)
    result = apply_omega(structural, ux, goal)

    print(f"\nSTATUS: {len(structural)} structural | {len(ux)} UX | {len(goal)} goal issues")
    print(f"   Total issues: {result.get('total_issues', 0)}")

    print(f"\n{'='*55}")
    print(f"PUNTO 0: {result['punto_0']}")
    print(f"{'='*55}")
    print(f"\nACTION: {result['action']}")
    print(f"\nMETRICS:")
    print(f"   Impact: {result['impact']}/10")
    print(f"   Effort: {result['effort']}/10")
    print(f"   Ratio: {result['ratio']}x")
    print(f"   Category: {result['category']}")

    if 'chain' in result:
        print(f"\nCAUSAL CHAIN:")
        for step in result['chain']:
            print(f"   {step}")

    if result.get('all_ranked'):
        print(f"\nTOP 5 BY RATIO:")
        for i, item in enumerate(result['all_ranked']):
            marker = " <-- EXECUTE" if i == 0 else ""
            print(f"   {i+1}. [{item['ratio']}x] {item['key']}: {item['description'][:60]}...{marker}")

    if result.get('runner_up'):
        ru = result['runner_up']
        print(f"\nNEXT: {ru['key']} ({ru['ratio']}x)")

    print(f"\n{'='*55}")
    if result['category'] == 'done':
        print("PROJECT IS HEALTHY. No high-impact issues remain.")
    else:
        print(f"INSTRUCTION: Execute ONLY Punto 0. Validate. Re-run auditor.")
    print(f"{'='*55}")

    # Also output JSON for programmatic use
    json_path = os.path.splitext(path)[0] + '_audit.json'
    with open(json_path, 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\nJSON saved to: {json_path}")

    return result

if __name__ == '__main__':
    main()
