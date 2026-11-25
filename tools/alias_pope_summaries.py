import json, os, re, time, urllib.parse, urllib.request, urllib.error

ROOT = os.path.expanduser('~/catholic-companion')
CACHE = f'{ROOT}/tools/_pope_summaries.json'
POPES = f'{ROOT}/frontend/src/data/popes.js'
UA = {'User-Agent': 'commune-popes/1.0 (personal devotional app)'}

ALIAS = {'Anacletus': ['Cletus'], 'Adeodatus': ['Deusdedit'], 'Callixtus': ['Callistus'],
         'Sylvester': ['Silvester'], 'Miltiades': ['Melchiades'], 'Dono': ['Donus'],
         'Zachary': ['Zacharias'], 'Hilarius': ['Hilarus'], 'Caius': ['Gaius'],
         'Anterus': ['Anteros'], 'Soter': ['Soterus'], 'Mark': ['Marcus'],
         'Eugene': ['Eugenius'], 'John Paul': ['John Paul'], 'Martin': ['Martinus'],
         'Adrian': ['Hadrian'], 'Valentine': ['Valentinus'], 'Romanus': ['Roman']}

src = open(POPES).read()
popes = []
for m in re.finditer(r"\{ num: (\d+),", src):
    tail = src[m.end():m.end() + 700]
    en = re.search(r"title: \{ en: '([^']*)'", tail)
    if en: popes.append((int(m.group(1)), en.group(1).replace("\\'", "'")))
cache = json.load(open(CACHE))
missing = [(n, nm) for n, nm in popes if not cache.get(str(n)) and n < 258]
print('trying aliases for:', len(missing))

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
got_now, still = 0, []
for i, (num, name) in enumerate(missing, 1):
    base = re.sub(r'\s+[IVXLC]+$', '', name).strip()
    numeral = ROMAN.search(name)
    names = [base] + ALIAS.get(base, [])
    found = ''
    for alt in names:
        full = (alt + ' ' + numeral.group(1)) if numeral else alt
        titles = [f'Catholic Encyclopedia (1913)/Pope {full}',
                  f'Catholic Encyclopedia (1913)/Pope St. {full}',
                  f'Catholic Encyclopedia (1913)/St. {full}',
                  f'Catholic Encyclopedia (1913)/{full}']
        d = api({'action': 'query', 'format': 'json', 'formatversion': 2,
                 'titles': '|'.join(titles), 'redirects': 1,
                 'prop': 'extracts', 'explaintext': 1, 'exchars': 1400, 'exlimit': 'max'})
        for pg in (d.get('query', {}).get('pages') or []):
            if pg.get('missing'): continue
            ex = re.sub(r'\s+', ' ', pg.get('extract', '') or '').strip()
            if len(ex) > 120:
                found = ex
                print('  got:', num, name, '<-', pg.get('title', '').split('/')[-1][:46])
                break
        if found: break
        time.sleep(0.5)
    if found:
        cache[str(num)] = found; got_now += 1
    else:
        still.append(f'{num} {name}')
    if i % 15 == 0: json.dump(cache, open(CACHE, 'w'))

json.dump(cache, open(CACHE, 'w'))
print('found now:', got_now)
print('still none:', len(still))
print('  ' + ', '.join(still[:40]))
