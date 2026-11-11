#!/usr/bin/env python3
"""Deterministic scan for source files without tests (zero LLM tokens).

Usage: python3 .claude/scripts/find_test_gaps.py [--orphans] [api|web|admin ...]
Default: lists source files without tests.
--orphans: lists existing specs whose target is outside the tested scope
(candidates for removal; a human decides). Read-only.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / 'packages'
FRONT = ('components', 'contexts', 'hooks', 'pages')
API = ('core/entities', 'core/usecases', 'routes')
EXCLUDE_PARTS = {'ui', 'types', 'config', 'mocks', 'tests', 'in-memory',
                 'implementation'}
SKIP_NAMES = {'index.ts', 'main.tsx', 'server.ts'}
IMPORT_RE = re.compile(r"""(?:from|import\()\s*['"]([^'"]+)['"]""")
REEXPORT_RE = re.compile(r'^\s*(export\s+(\*|\{[^}]*\})\s+from\s+[^;\n]+;?\s*)+$')


def is_spec(p): return '.spec.' in p.name
def stem(p): return p.name.split('.')[0]


KINDS = {'entities': 'entity', 'usecases': 'usecase', 'services': 'service',
         'utils': 'util', 'routes': 'route', 'schemas': 'schema',
         'components': 'component', 'contexts': 'context', 'hooks': 'hook',
         'pages': 'page'}


def kind(rel):
    # first path segment wins (schemas/routes/... is a schema, not a route)
    for part in rel.parts:
        if part in KINDS:
            return KINDS[part]
    return 'file'


def scan(pkg):
    src = ROOT / pkg / 'src'
    roots = API if pkg == 'api' else FRONT
    files = [p for r in roots for p in (src / r).rglob('*.ts*')
             if p.is_file()]
    specs = [p for p in src.rglob('*.spec.ts*')]
    spec_imports = {s: [Path(i).name.split('.')[0]
                        for i in IMPORT_RE.findall(s.read_text())]
                    for s in specs}
    spec_text = {s: s.read_text() for s in specs}
    gaps, total = [], 0
    for f in sorted(files):
        if is_spec(f) or f.name.endswith('.d.ts') or f.name in SKIP_NAMES:
            continue
        if EXCLUDE_PARTS & set(f.relative_to(src).parts[:-1]):
            continue
        if REEXPORT_RE.match(f.read_text().strip()):
            continue
        total += 1
        s = stem(f)
        norm = {s, s.replace('-', '_')}
        covered = False
        for sp in specs:
            near = (f.parent == sp.parent or f.parent in sp.parents
                    or sp.parent in f.parents)
            if not near:
                continue
            if stem(sp) in norm or norm & set(spec_imports[sp]):
                covered = True
                break
            # index.tsx / novo.tsx / editar.tsx: covered by a page spec in
            # the same folder that mentions the page component's route file
            if f.name in ('index.tsx', 'novo.tsx', 'editar.tsx', 'nova.tsx') \
                    and (sp.parent == f.parent) and s in spec_text[sp]:
                covered = True
                break
        if not covered:
            gaps.append(f.relative_to(src))
    return gaps, total


def orphans(pkg):
    """Specs located outside the scope that requires tests."""
    src = ROOT / pkg / 'src'
    roots = API if pkg == 'api' else FRONT
    in_scope = [src / r for r in roots]
    out = []
    for sp in sorted(src.rglob('*.spec.ts*')):
        ui = pkg != 'api' and 'ui' in sp.relative_to(src).parts[:-1] \
            and 'components' in sp.relative_to(src).parts
        if ui or not any(r in sp.parents for r in in_scope):
            out.append(sp.relative_to(src))
    return out


def main():
    args = sys.argv[1:]
    show_orphans = '--orphans' in args
    pkgs = [a for a in args if a != '--orphans'] or ['api', 'web', 'admin']
    for pkg in pkgs:
        if show_orphans:
            items = orphans(pkg)
            print(f'## {pkg}: {len(items)} specs outside tested scope')
            for o in items:
                print(f'spec\t{o}')
            continue
        gaps, total = scan(pkg)
        print(f'## {pkg}: {len(gaps)}/{total} without tests')
        for g in gaps:
            print(f'{kind(g)}\t{g}')


if __name__ == '__main__':
    main()
