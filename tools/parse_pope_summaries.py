import html, json, os, re, time, urllib.parse, urllib.request, urllib.error

ROOT = os.path.expanduser('~/catholic-companion')
CACHE = f'{ROOT}/tools/_pope_summaries.json'
POPES = f'{ROOT}/frontend/src/data/popes.js'
UA = {'User-Agent': 'commune-popes/1.0 (personal devotional app)'}

def api(params):
    url = 'https://en.wikisource.org/w/api.php?' + urllib.parse.urlencode(params)
    delay = 4
    for a in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or a == 4: return {}
            time.sleep(delay); delay *= 2
    return {}

titles, cont = [], {}
while True:
    d = api({'action': 'query', 'format': 'json', 'formatversion': 2, 'list': 'allpages',
             'apprefix': 'Catholic Encyclopedia (1913)/Pope', 'aplimit': 500, **cont})
    titles += [p['title'] for p in d.get('query', {}).get('allpages', [])]
    if 'continue' in d: cont = d['continue']; time.sleep(0.3)
    else: break

def norm(t):
    t = t.split('/')[-1]
    t = re.sub(r'\s*\([^)]*\)', ' ', t)
    t = re.sub(r'^Popes?\s+', '', t)
    t = re.sub(r'^(St\.?|Saint|Bl\.?|Blessed|Ven\.?|Venerable)\s+', '', t)
    return re.sub(r'\s+', ' ', t).strip().lower()

index = {}
for t in titles: index.setdefault(norm(t), []).append(t)

LATIN = {'eutychian': 'eutychianus', 'sabinian': 'sabinianus',
         'adeodatus i': 'deusdedit', 'adeodatus ii': 'adeodatus',
         'sylvester iii': 'silvester iii'}

src = open(POPES).read()
popes = []
for m in re.finditer(r"\{ num: (\d+),", src):
    tail = src[m.end():m.end() + 700]
    en = re.search(r"title: \{ en: '([^']*)'", tail)
    if en: popes.append((int(m.group(1)), en.group(1).replace("\\'", "'")))
cache = json.load(open(CACHE))
missing = [(n, nm) for n, nm in popes if not cache.get(str(n)) and n < 258]
print('missing:', len(missing), '| index entries:', len(index))

def from_html(h):
    h = re.sub(r'(?is)<(table|style|script|sup|ol class="references").*?</\1>', ' ', h)
    h = re.sub(r'(?is)<div class="(ws-noexport|licence|header).*?</div>', ' ', h)
    h = re.sub(r'(?is)<h[1-6].*?</h[1-6]>', ' ', h)
    h = re.sub(r'(?s)<[^>]+>', ' ', h)
    h = html.unescape(h)
    return re.sub(r'\s+', ' ', h).strip()

got, still = 0, []
for num, name in missing:
    key = name.lower()
    cands = index.get(key) or index.get(LATIN.get(key, '')) or []
    if not cands:
        still.append(f'{num} {name}'); continue
    d = api({'action': 'parse', 'format': 'json', 'formatversion': 2,
             'page': cands[0], 'prop': 'text', 'redirects': 1, 'disableeditsection': 1})
    text = from_html((d.get('parse') or {}).get('text') or '')
    text = re.sub(r'^.*?(?:Catholic Encyclopedia \(1913\)|←.*?→)\s*', '', text, count=1)
    if len(text) > 200:
        cache[str(num)] = text[:2500]
        got += 1
        print('  got:', num, name, '<-', cands[0].split('/')[-1][:44], '|', text[:70])
    else:
        still.append(f'{num} {name}')
    time.sleep(0.5)
    json.dump(cache, open(CACHE, 'w'))

print('added:', got, '| still none:', len(still))
if still: print('  ' + ', '.join(still[:30]))
