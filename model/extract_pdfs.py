#!/usr/bin/env python3
"""Extract text from the coverage-programme PDFs into data/*/*.txt.

The ministry publishes these lists only as PDF. Node has no PDF reader here and pypdf does,
so this is the one Python step in the pipeline: run it once after downloading the PDFs, then
`model/coverage.js` works on the .txt files and the rest of the pipeline stays in Node.

    python3 model/extract_pdfs.py

Sources:
  data/pnras/elig_*.pdf   Lista unitatilor de invatamant eligibile PNRAS (carries COD SIIIR)
  data/pnras/benef_*.pdf  Lista finala a unitatilor beneficiare de granturi (name + county only)
  data/masa/masa_2026.pdf MO Partea I nr. 3 bis/5.I.2026, anexa Masa sanatoasa (name + UAT)
"""
import glob
import os
import re
import sys

try:
    import pypdf
except ImportError:
    sys.exit("pypdf missing: pip3 install pypdf")

# These documents embed fonts whose glyphs pypdf cannot map to Unicode, so Romanian diacritics
# arrive as literal "/gNNN" tokens. THREE different fonts are in play (table header, and two body
# fonts that encode the same letters at different code points), which is why Ș and ț each have
# several codes. Getting this table wrong is silent data loss: an unmapped Ș turns
# "Școala Gimnazială Zemeș" into "coala Gimnazială Zeme", which then matches nothing.
GLYPHS = {
    '/g258': 'Ă', '/g259': 'ă', '/g260': 'ă',
    '/g658': 'Ș', '/g659': 'ș', '/g660': 'Ț', '/g661': 'ț', '/g662': 'ț',   # body font A
    '/g249': 'Ș', '/g250': 'ș', '/g287': 'Ț', '/g288': 'ț',                 # body font B
    '/g280': 'ő', '/g398': '”',                                             # Hungarian names, quotes
}
# Codes below this are punctuation/digits from the fully glyph-encoded heading on the annex's
# first page — never part of a school name, safe to drop.
HEADING_GLYPH_MAX = 200


def clean(text: str) -> str:
    for code, ch in GLYPHS.items():
        text = text.replace(code, ch)
    leftover = re.findall(r'/g(\d+)', text)
    if leftover:
        high = sorted({int(g) for g in leftover if int(g) >= HEADING_GLYPH_MAX})
        if high:
            # A high unmapped code is almost certainly a letter. Refuse to guess: report it with
            # context so the table above can be extended, rather than deleting characters.
            for g in high[:6]:
                m = re.search(r'.{0,40}/g%d.{0,25}' % g, text)
                print(f'    !! UNMAPPED LETTER GLYPH /g{g} -- extend GLYPHS. context: '
                      f'{m.group(0).strip() if m else "?"}')
            raise SystemExit(f'refusing to write text with {len(high)} unmapped letter glyphs')
        text = re.sub(r'/g\d+', '', text)
    return text


def main() -> None:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    targets = sorted(glob.glob(os.path.join(root, 'data', 'pnras', '*.pdf'))
                     + glob.glob(os.path.join(root, 'data', 'masa', '*.pdf')))
    if not targets:
        sys.exit('no PDFs found under data/pnras or data/masa')

    for path in targets:
        reader = pypdf.PdfReader(path)
        text = clean('\n'.join((page.extract_text() or '') for page in reader.pages))
        out = os.path.splitext(path)[0] + '.txt'
        with open(out, 'w', encoding='utf-8') as fh:
            fh.write(text)
        name = os.path.relpath(out, root)
        if len(text.strip()) < 500:
            print(f'  {name}: {len(reader.pages)} pages, {len(text)} chars '
                  f'-- SCANNED IMAGE, no usable text')
        else:
            codes = len(set(re.findall(r'\b\d{10}\b', text)))
            print(f'  {name}: {len(reader.pages)} pages, {len(text)} chars, '
                  f'{codes} distinct SIIIR codes')


if __name__ == '__main__':
    main()
