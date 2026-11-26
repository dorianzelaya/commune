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

titles, cont = [], {}
while True:
    d = api({'action': 'query', 'format': 'json', 'formatversion': 2, 'list': 'allpages',
             'apprefix': 'Catholic Encyclopedia (1913)/Pope', 'aplimit': 500, **cont})
    titles += [p['title'] for p in d.get('query', {}).get('allpages', [])]
    if 'continue' in d: cont = d['continue']; time.sleep(0.4)
    else: break

src = open(POPES).read()
popes = []
for m in re.finditer(r"\{ num: (\d+),", src):
    tail = src[m.end():m.end() + 700]
    en = re.search(r"title: \{ en: '([^']*)'", tail)
    if en: popes.append((int(m.group(1)), en.group(1).replace("\\'", "'")))
cache = json.load(open(CACHE))
missing = [(n, nm) for n, nm in popes if not cache.get(str(n)) and n < 258]
print('missing:', len(missing), '| CE pope articles:', len(titles))

def norm(t):
    t = t.split('/')[-1]
    t = re.sub(r'\s*\([^)]*\)', ' ', t)
    t = re.sub(r'^Popes?\s+', '', t)
    t = re.sub(r'^(St\.?|Saint|Bl\.?|Blessed|Ven\.?|Venerable)\s+', '', t)
    return re.sub(r'\s+', ' ', t).strip().lower()

index = {}
for t in titles:
    index.setdefault(norm(t), []).append(t)

def strip_wiki(w):
    w = re.sub(r'<ref[^>]*>.*?</ref>', '', w, flags=re.S)
    w = re.sub(r'<[^>]+>', ' ', w)
    for _ in range(8):
        w2 = re.sub(r'\{\{[^{}]*\}\}', ' ', w)
        if w2 == w: break
        w = w2
    w = re.sub(r'^\s*[=;:*#].*$', ' ', w, flags=re.M)
    w = re.sub(r'\[\[[^\]|]*\|([^\]]*)\]\]', r'\1', w)
    w = re.sub(r'\[\[([^\]]*)\]\]', r'\1', w)
    w = w.replace("'''", '').replace("''", '')
    return re.sub(r'\s+', ' ', w).strip()

got, still = 0, []
for num, name in missing:
    cands = index.get(name.lower()) or []
    if not cands:
        for k, v in index.items():
            if k == name.lower() or k.startswith(name.lower() + ' '):
                cands = v; break
    if not cands:
        still.append(f'{num} {name}'); continue
    d = api({'action': 'query', 'format': 'json', 'formatversion': 2,
             'titles': cands[0], 'redirects': 1,
             'prop': 'revisions', 'rvprop': 'content', 'rvslots': 'main'})
    pg = (d.get('query', {}).get('pages') or [{}])[0]
    try:
        w = pg['revisions'][0]['slots']['main']['content']
    except Exception:
        still.append(f'{num} {name}'); time.sleep(0.5); continue
    text = strip_wiki(w)
    if len(text) > 150:
        cache[str(num)] = text[:2000]
        got += 1
        print('  got:', num, name, '<-', cands[0].split('/')[-1][:44])
    else:
        still.append(f'{num} {name}')
    time.sleep(0.5)
    if got % 10 == 0: json.dump(cache, open(CACHE, 'w'))

json.dump(cache, open(CACHE, 'w'))
print('added:', got, '| still none:', len(still))
print('  ' + ', '.join(still[:30]))
