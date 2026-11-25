import json, os, re, time, urllib.parse, urllib.request, urllib.error

ROOT = os.path.expanduser('~/catholic-companion')
CACHE = f'{ROOT}/tools/_pope_summaries.json'
POPES = f'{ROOT}/frontend/src/data/popes.js'
OUT = f'{ROOT}/frontend/src/data/popeSummaries.js'
UA = {'User-Agent': 'commune-popes/1.0 (personal devotional app)'}

src = open(POPES).read()
popes = []
for m in re.finditer(r"\{ num: (\d+),", src):
    tail = src[m.end():m.end() + 700]
    en = re.search(r"title: \{ en: '([^']*)'", tail)
    if en: popes.append((int(m.group(1)), en.group(1).replace("\\'", "'")))
cache = json.load(open(CACHE))

def api(params):
    url = 'https://en.wikisource.org/w/api.php?' + urllib.parse.urlencode(params)
    delay = 4
    for a in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or a == 4: return {}
            time.sleep(delay); delay *= 2
    return {}

ROMAN = re.compile(r'\b([IVXLC]+)$')
def ok_title(title, name):
    t = re.sub(r'\s*\(.*?\)\s*', ' ', title.split('/')[-1]).strip()
    base = re.sub(r'\s+[IVXLC]+$', '', name).strip()
    if base.lower() not in t.lower(): return False
    want, have = ROMAN.search(name), ROMAN.search(t)
    if want and (not have or have.group(1) != want.group(1)): return False
    if have and not want: return False
    return True

missing = [(n, nm) for n, nm in popes if not cache.get(str(n))]
print('retrying:', len(missing))
for i, (num, name) in enumerate(missing, 1):
    base = re.sub(r'\s+[IVXLC]+$', '', name).strip()
    d = api({'action': 'query', 'format': 'json', 'formatversion': 2,
             'generator': 'search',
             'gsrsearch': f'intitle:"Catholic Encyclopedia (1913)" intitle:"{base}"',
             'gsrlimit': 25, 'prop': 'extracts', 'explaintext': 1, 'exchars': 1400, 'exlimit': 'max'})
    for pg in (d.get('query', {}).get('pages') or []):
        t = pg.get('title', '')
        if 'Catholic Encyclopedia (1913)' not in t or not ok_title(t, name): continue
        ex = re.sub(r'\s+', ' ', pg.get('extract', '') or '').strip()
        if len(ex) > 120:
            cache[str(num)] = ex
            print('  got:', num, name, '<-', t.split('/')[-1][:50])
            break
    if i % 15 == 0: json.dump(cache, open(CACHE, 'w'))
    time.sleep(0.7)
json.dump(cache, open(CACHE, 'w'))

OUTLINE = re.compile(r'following heads|\b[IVXL]{1,4}\.(\s|$)|^\s*[IVXL]{1,4}\b')
HEADINGish = re.compile(r'^[A-Z][A-Za-z\s\-]{0,60}$')
def summarize(t, limit=340):
    t = re.sub(r'\s+', ' ', t or '').strip()
    t = re.sub(r'^\([^)]*\)\s*', '', t)
    keep = []
    for p in re.split(r'(?<=[.!?])\s+', t):
        p = p.strip()
        if len(p) < 45 or OUTLINE.search(p) or HEADINGish.match(p): continue
        keep.append(p)
        if sum(len(x) + 1 for x in keep) > limit: break
    out = ' '.join(keep)
    if len(out) > limit + 140:
        cut = out[:limit + 140]; dot = cut.rfind('. ')
        out = cut[:dot + 1] if dot > 150 else cut.rstrip() + '...'
    return out

got = {k: summarize(v) for k, v in cache.items() if v}
got = {k: v for k, v in got.items() if len(v) > 70}
q = lambda s: s.replace('\\', '\\\\').replace("'", "\\'")
open(OUT, 'w').write(
"// Summaries from the Catholic Encyclopedia of 1913, which is public domain.\n"
"// Fetched by tools/gen_pope_summaries.py, cleaned by fix_pope_summaries.py.\n"
"export const POPE_SUMMARIES = {\n"
+ ''.join("  %s: '%s',\n" % (k, q(v)) for k, v in sorted(got.items(), key=lambda kv: int(kv[0])))
+ "}\n\nexport default POPE_SUMMARIES\n")
print('summaries written:', len(got), 'of', len(popes))
