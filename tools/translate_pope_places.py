import json, os, re, sys, time, urllib.request, urllib.error

ROOT = os.path.expanduser('~/catholic-companion')
POPES = f'{ROOT}/frontend/src/data/popes.js'
OUT = f'{ROOT}/frontend/src/data/popePlacesEs.js'
CACHE = f'{ROOT}/tools/_pope_places_es.json'
MODEL = os.environ.get('CLAUDE_MODEL', 'claude-haiku-4-5-20251001')

key = os.environ.get('ANTHROPIC_API_KEY', '')
if not key:
    for line in open(f'{ROOT}/backend/.env'):
        if line.startswith('ANTHROPIC_API_KEY'):
            key = line.split('=', 1)[1].strip().strip('"\'')
if not key: sys.exit('no ANTHROPIC_API_KEY found')

src = open(POPES).read()
places = {}
for m in re.finditer(r"\{ num: (\d+),", src):
    tail = src[m.end():m.end() + 700]
    pl = re.search(r"place: '((?:[^'\\]|\\.)*)'", tail)
    if pl and pl.group(1).strip():
        places[m.group(1)] = pl.group(1).replace("\\'", "'")
cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
todo = [k for k in places if k not in cache]
print('places to translate:', len(todo), 'of', len(places))

PROMPT = ("Translate these birthplaces into Spanish for a Catholic app. They are historical "
          "places: use the Spanish name where one exists (Roma, Atenas, Cerdena, Siria, Imperio romano), "
          "keep any year exactly as given, keep it terse, no commentary. "
          "Reply with a JSON object only, same keys.\n\n")

def call(batch):
    body = json.dumps({'model': MODEL, 'max_tokens': 3000,
                       'messages': [{'role': 'user', 'content': PROMPT + json.dumps(batch, ensure_ascii=False)}]}).encode()
    req = urllib.request.Request('https://api.anthropic.com/v1/messages', data=body, headers={
        'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01'})
    for attempt in range(4):
        try:
            d = json.load(urllib.request.urlopen(req, timeout=180))
            text = ''.join(b.get('text', '') for b in d.get('content', []))
            m = re.search(r'\{.*\}', text, re.S)
            return json.loads(m.group(0)) if m else {}
        except urllib.error.HTTPError as e:
            if e.code in (429, 529) and attempt < 3: time.sleep(8 * (attempt + 1)); continue
            print('  http', e.code); return {}
        except Exception as e:
            print('  error:', e); return {}
    return {}

for i in range(0, len(todo), 25):
    chunk = {k: places[k] for k in todo[i:i + 25]}
    for k, v in (call(chunk) or {}).items():
        if k in chunk and isinstance(v, str) and v.strip(): cache[k] = v.strip()
    json.dump(cache, open(CACHE, 'w'), ensure_ascii=False)
    print(' ', min(i + 25, len(todo)), 'of', len(todo), '| done:', len(cache))

q = lambda s: s.replace('\\', '\\\\').replace("'", "\\'")
open(OUT, 'w').write(
"// Spanish birthplaces, translated by tools/translate_pope_places.py.\n"
"export const POPE_PLACES_ES = {\n"
+ ''.join("  %s: '%s',\n" % (k, q(v)) for k, v in sorted(cache.items(), key=lambda kv: int(kv[0])))
+ "}\n\nexport default POPE_PLACES_ES\n")
print('wrote', OUT, len(cache))
