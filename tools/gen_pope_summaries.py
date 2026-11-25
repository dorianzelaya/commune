import json, os, re, time, urllib.parse, urllib.request, urllib.error

ROOT = os.path.expanduser('~/catholic-companion')
POPES = f'{ROOT}/frontend/src/data/popes.js'
OUT = f'{ROOT}/frontend/src/data/popeSummaries.js'
CACHE = f'{ROOT}/tools/_pope_summaries.json'
UA = {'User-Agent': 'commune-popes/1.0 (personal devotional app)'}

src = open(POPES).read()
popes = []
for m in re.finditer(r"\{ num: (\d+),", src):
    tail = src[m.end():m.end() + 700]
    en = re.search(r"title: \{ en: '([^']*)'", tail)
    if en: popes.append((int(m.group(1)), en.group(1).replace("\\'", "'")))

cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
print('popes:', len(popes), '| cached:', len(cache))

def api(host, params):
    url = f'https://{host}/w/api.php?' + urllib.parse.urlencode(params)
    delay = 4
    for attempt in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or attempt == 4: return {}
            time.sleep(delay); delay *= 2
    return {}

def trim(text, limit=420):
    text = re.sub(r'\s+', ' ', text or '').strip()
    text = re.sub(r'^\([^)]*\)\s*', '', text)
    if len(text) <= limit: return text
    cut = text[:limit]
    dot = cut.rfind('. ')
    return (cut[:dot + 1] if dot > 120 else cut.rstrip() + '...')

ROMAN = re.compile(r'\b([IVXLC]+)$')

def ok_title(title, name):
    """The article must be about this pope, numeral and all."""
    t = title.split('/')[-1]
    base = re.sub(r'\s+[IVXLC]+$', '', name).strip()
    if base.lower() not in t.lower():
        return False
    want = ROMAN.search(name)
    have = ROMAN.search(re.sub(r'\s*\(.*?\)\s*', '', t).strip())
    if want and (not have or have.group(1) != want.group(1)):
        return False
    if have and not want:
        return False
    return True

for i, (num, name) in enumerate(popes, 1):
    key = str(num)
    if key in cache: continue
    base = re.sub(r'\s+[IVXLC]+$', '', name).strip()
    titles = [f'Catholic Encyclopedia (1913)/Pope {name}',
              f'Catholic Encyclopedia (1913)/Pope St. {name}',
              f'Catholic Encyclopedia (1913)/Pope Saint {name}',
              f'Catholic Encyclopedia (1913)/St. {name}',
              f'Catholic Encyclopedia (1913)/{name}']
    found = ''
    d = api('en.wikisource.org', {
        'action': 'query', 'format': 'json', 'formatversion': 2,
        'titles': '|'.join(titles), 'redirects': 1,
        'prop': 'extracts', 'explaintext': 1, 'exchars': 1400, 'exlimit': 'max'})
    for pg in (d.get('query', {}).get('pages') or []):
        if pg.get('missing'): continue
        if not ok_title(pg.get('title', ''), name): continue
        ex = re.sub(r'\s+', ' ', pg.get('extract', '') or '').strip()
        if len(ex) > 120:
            found = ex; break
    if not found:
        d = api('en.wikisource.org', {
            'action': 'query', 'format': 'json', 'formatversion': 2,
            'generator': 'search',
            'gsrsearch': f'intitle:"Catholic Encyclopedia (1913)" intitle:"{base}"',
            'gsrlimit': 8, 'prop': 'extracts', 'explaintext': 1, 'exchars': 1400, 'exlimit': 'max'})
        for pg in (d.get('query', {}).get('pages') or []):
            t = pg.get('title', '')
            if 'Catholic Encyclopedia (1913)' not in t or not ok_title(t, name): continue
            ex = re.sub(r'\s+', ' ', pg.get('extract', '') or '').strip()
            if len(ex) > 120:
                found = ex; break
    cache[key] = found
    if i % 20 == 0:
        print(' ', i, 'of', len(popes), '| with a summary:', sum(1 for v in cache.values() if v))
        json.dump(cache, open(CACHE, 'w'))
    time.sleep(0.6)

json.dump(cache, open(CACHE, 'w'))
OUTLINE = re.compile(r'following heads|\b[IVX]{1,4}\.\s')

def summarize(text, limit=340):
    text = re.sub(r'\s+', ' ', text or '').strip()
    text = re.sub(r'^\([^)]*\)\s*', '', text)
    parts = re.split(r'(?<=[.!?])\s+', text)
    keep = []
    for p_ in parts:
        if len(p_) < 40 or OUTLINE.search(p_):
            continue
        keep.append(p_.strip())
        if sum(len(x) + 1 for x in keep) > limit:
            break
    out = ' '.join(keep).strip()
    if len(out) > limit + 120:
        cut = out[:limit + 120]
        dot = cut.rfind('. ')
        out = cut[:dot + 1] if dot > 150 else cut.rstrip() + '...'
    return out

got = {k: summarize(v) for k, v in cache.items() if v}
got = {k: v for k, v in got.items() if len(v) > 60}
q = lambda s: s.replace('\\', '\\\\').replace("'", "\\'")
open(OUT, 'w').write(
"// Summaries from the Catholic Encyclopedia of 1913, which is public domain.\n"
"// Fetched by tools/gen_pope_summaries.py. Where a pope has no entry the card\n"
"// shows no summary rather than filler.\n"
"export const POPE_SUMMARIES = {\n"
+ ''.join("  %s: '%s',\n" % (k, q(v)) for k, v in sorted(got.items(), key=lambda kv: int(kv[0])))
+ "}\n\nexport default POPE_SUMMARIES\n")
print('summaries:', len(got), 'of', len(popes))
