import json, os, re, time, urllib.parse, urllib.request, urllib.error

ROOT = os.path.expanduser('~/catholic-companion')
CACHE = f'{ROOT}/tools/_pope_summaries.json'
POPES = f'{ROOT}/frontend/src/data/popes.js'
UA = {'User-Agent': 'commune-popes/1.0 (personal devotional app)'}

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

# every CE article whose title starts with Pope
titles, cont = [], {}
while True:
    d = api({'action': 'query', 'format': 'json', 'formatversion': 2,
             'list': 'allpages', 'apprefix': 'Catholic Encyclopedia (1913)/Pope',
             'aplimit': 500, **cont})
    titles += [p['title'] for p in d.get('query', {}).get('allpages', [])]
    if 'continue' in d: cont = d['continue']; time.sleep(0.4)
    else: break
print('CE articles titled Pope*:', len(titles))

src = open(POPES).read()
popes = []
for m in re.finditer(r"\{ num: (\d+),", src):
    tail = src[m.end():m.end() + 700]
    en = re.search(r"title: \{ en: '([^']*)'", tail)
    if en: popes.append((int(m.group(1)), en.group(1).replace("\\'", "'")))
cache = json.load(open(CACHE))
missing = [(n, nm) for n, nm in popes if not cache.get(str(n)) and n < 258]
print('missing:', len(missing))

ROMAN = re.compile(r'\b([IVXLC]+)\b')
def norm(t):
    t = t.split('/')[-1]
    t = re.sub(r'\s*\([^)]*\)', ' ', t)
    t = re.sub(r'^Popes?\s+', '', t)
    t = re.sub(r'^(St\.?|Saint|Bl\.?|Blessed)\s+', '', t)
    return re.sub(r'\s+', ' ', t).strip()

index = {}
for t in titles:
    index.setdefault(norm(t).lower(), []).append(t)

pairs = []
for num, name in missing:
    key = name.lower()
    hit = index.get(key)
    if not hit:
        for k, v in index.items():
            if k.startswith(key + ' ') or k == key:
                hit = v; break
    if hit: pairs.append((num, name, hit[0]))
print('matched in the index:', len(pairs))

for n_, (num, name, t) in enumerate(pairs, 1):
    d = api({'action': 'query', 'format': 'json', 'formatversion': 2,
             'titles': t, 'redirects': 1,
             'prop': 'extracts', 'explaintext': 1, 'exchars': 1400})
    pg = (d.get('query', {}).get('pages') or [{}])[0]
    ex = re.sub(r'\s+', ' ', pg.get('extract', '') or '').strip()
    if len(ex) > 120:
        cache[str(num)] = ex
        print('  got:', num, name, '<-', t.split('/')[-1][:46])
    if n_ % 10 == 0: json.dump(cache, open(CACHE, 'w'))
    time.sleep(0.6)
json.dump(cache, open(CACHE, 'w'))

left = [f'{n} {nm}' for n, nm in popes if not cache.get(str(n)) and n < 258]
print('still none:', len(left))
print('  ' + ', '.join(left[:40]))
