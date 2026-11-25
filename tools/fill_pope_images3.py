import json, os, re, time, urllib.parse, urllib.request, urllib.error
from PIL import Image

ROOT = os.path.expanduser('~/catholic-companion')
POPES = f'{ROOT}/frontend/src/data/popes.js'
MAP = f'{ROOT}/frontend/src/data/popeImages.js'
IMGDIR = f'{ROOT}/frontend/public/popes'
UA = {'User-Agent': 'commune-popes/1.0 (personal devotional app)'}

src = open(POPES).read()
popes = []
for m in re.finditer(r"\{ num: (\d+),", src):
    tail = src[m.end():m.end() + 700]
    en = re.search(r"title: \{ en: '([^']*)'", tail)
    pg = re.search(r"page: '([^']*)'", tail)
    if en:
        popes.append((int(m.group(1)), en.group(1), pg.group(1) if pg else ''))

have = {int(k): v for k, v in re.findall(r"  (\d+): '([^']*)',", open(MAP).read())}
SKIP = {267}  # no public domain likeness exists yet
missing = [(n, en, pg) for n, en, pg in popes if n not in have and n not in SKIP]
print('missing:', len(missing))
for n, en, _ in missing: print('  ', n, en)

def api(host, params):
    url = f'https://{host}/w/api.php?' + urllib.parse.urlencode(params)
    delay = 5
    for attempt in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or attempt == 4: return {}
            time.sleep(delay); delay *= 2
    return {}

PD = re.compile(r'public domain|^pd|cc0', re.I)
BAD = re.compile(r'coat of arms|stemma|wappen|tomb|grave|map|signature|flag|seal|'
                 r'medal|coin|logo|\.svg$|\.tif|memorial|plaque|church|chapel|'
                 r'altar|palace|bull |document|letter', re.I)

def pd_files(pages):
    out = []
    for pg in pages or []:
        title = pg.get('title', '')
        if not title.lower().startswith('file:') or BAD.search(title): continue
        ii = (pg.get('imageinfo') or [{}])[0]
        lic = (ii.get('extmetadata', {}).get('LicenseShortName', {}) or {}).get('value', '')
        if PD.search(lic or ''): out.append(title[5:])
    return out

def candidates(num, name, page):
    stem = re.split(r'\s+', name)[0][:3].lower()
    # 1. the pope's own Commons category
    for cat in (f'Category:Pope {name}', f'Category:{page}'):
        d = api('commons.wikimedia.org', {
            'action': 'query', 'format': 'json', 'formatversion': 2,
            'generator': 'categorymembers', 'gcmtitle': cat, 'gcmtype': 'file',
            'gcmlimit': 40, 'prop': 'imageinfo', 'iiprop': 'extmetadata'})
        hits = [f for f in pd_files(d.get('query', {}).get('pages')) if stem in f.lower()]
        if hits: return hits
        time.sleep(1)
    # 2. other language wikipedias
    for host in ('it.wikipedia.org', 'la.wikipedia.org', 'de.wikipedia.org', 'es.wikipedia.org'):
        d = api(host, {'action': 'query', 'format': 'json', 'formatversion': 2,
                       'titles': page or ('Pope ' + name), 'prop': 'pageimages',
                       'piprop': 'name', 'redirects': 1, 'converttitles': 1})
        for pg in d.get('query', {}).get('pages', []):
            f = pg.get('pageimage')
            if not f or BAD.search(f): continue
            d2 = api('commons.wikimedia.org', {
                'action': 'query', 'format': 'json', 'formatversion': 2,
                'titles': 'File:' + f, 'prop': 'imageinfo', 'iiprop': 'extmetadata'})
            if pd_files(d2.get('query', {}).get('pages')): return [f]
        time.sleep(1)
    # 3. a looser search
    for term in (f'Papa {name}', f'{name} pope portrait', f'{name} papa ritratto'):
        d = api('commons.wikimedia.org', {
            'action': 'query', 'format': 'json', 'formatversion': 2,
            'generator': 'search', 'gsrsearch': term, 'gsrnamespace': 6, 'gsrlimit': 15,
            'prop': 'imageinfo', 'iiprop': 'extmetadata'})
        hits = [f for f in pd_files(d.get('query', {}).get('pages')) if stem in f.lower()]
        if hits: return hits
        time.sleep(1)
    return []

added, still = 0, []
for num, name, page in missing:
    files = candidates(num, name, page)
    if not files:
        still.append(name); print('  none:', num, name); continue
    got = False
    for f in files[:3]:
        url = ('https://commons.wikimedia.org/wiki/Special:FilePath/'
               + urllib.parse.quote(f.replace(' ', '_')) + '?width=320')
        delay = 8
        for attempt in range(4):
            try:
                data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()
                dest = f'{IMGDIR}/{num}.jpg'
                open(dest + '.tmp', 'wb').write(data)
                im = Image.open(dest + '.tmp').convert('RGB')
                if im.width > 240:
                    im = im.resize((240, round(im.height * 240 / im.width)), Image.LANCZOS)
                im.save(dest, 'JPEG', quality=82, optimize=True)
                os.remove(dest + '.tmp')
                have[num] = f'/popes/{num}.jpg'
                added += 1; got = True
                print('  got:', num, name, '<-', f[:50])
                break
            except urllib.error.HTTPError as e:
                if e.code in (429, 503) and attempt < 3:
                    time.sleep(delay); delay *= 2; continue
                break
            except Exception:
                break
        if got: break
    time.sleep(1.5)

open(MAP, 'w').write(
"// Portraits for the pope cards. Only files Commons marks public domain are\n"
"// included, so nothing here needs an attribution line.\n"
"export const POPE_IMAGES = {\n"
+ ''.join("  %d: '%s',\n" % (k, have[k]) for k in sorted(have))
+ "}\n\nexport default POPE_IMAGES\n")
print('added:', added, '| portraits now:', len(have), '| none found for:', still)
