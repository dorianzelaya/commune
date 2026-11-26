import json, os, re, sys, time, urllib.request, urllib.error

ROOT = os.path.expanduser('~/catholic-companion')
EN = f'{ROOT}/frontend/src/data/popeSummaries.js'
EXTRA = f'{ROOT}/frontend/src/data/popeSummariesExtra.js'
OUT = f'{ROOT}/frontend/src/data/popeSummariesEs.js'
CACHE = f'{ROOT}/tools/_pope_summaries_es.json'
MODEL = os.environ.get('CLAUDE_MODEL', 'claude-haiku-4-5-20251001')

key = os.environ.get('ANTHROPIC_API_KEY', '')
if not key:
    for line in open(f'{ROOT}/backend/.env'):
        if line.startswith('ANTHROPIC_API_KEY'):
            key = line.split('=', 1)[1].strip().strip('"\'')
if not key:
    sys.exit('no ANTHROPIC_API_KEY found')

def load(path):
    s = open(path).read()
    out = {}
    for k, v in re.findall(r"\s(\d+): '((?:[^'\\]|\\.)*)',", s):
        out[k] = v.replace("\\'", "'").replace('\\\\', '\\')
    return out

src = {**load(EN), **load(EXTRA)}
cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
todo = [k for k in src if k not in cache]
print('to translate:', len(todo), 'of', len(src))

PROMPT = ("Translate each entry into natural Spanish for a Catholic devotional app. "
          "Use Spanish forms of papal and saints' names (Pedro, León, Juan Pablo, Gregorio). "
          "Keep every date and fact exactly as given. Do not add, explain or omit anything. "
          "Reply with a JSON object only, same keys, Spanish text as the values.\n\n")

def call(batch):
    body = json.dumps({
        'model': MODEL,
        'max_tokens': 4000,
        'messages': [{'role': 'user', 'content': PROMPT + json.dumps(batch, ensure_ascii=False)}],
    }).encode()
    req = urllib.request.Request('https://api.anthropic.com/v1/messages', data=body, headers={
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
    })
    for attempt in range(4):
        try:
            d = json.load(urllib.request.urlopen(req, timeout=180))
            text = ''.join(b.get('text', '') for b in d.get('content', []))
            m = re.search(r'\{.*\}', text, re.S)
            return json.loads(m.group(0)) if m else {}
        except urllib.error.HTTPError as e:
            print('  http', e.code, e.read()[:200].decode('utf8', 'ignore'))
            if e.code in (429, 529) and attempt < 3:
                time.sleep(10 * (attempt + 1)); continue
            return {}
        except Exception as e:
            print('  error:', e)
            return {}
    return {}

for i in range(0, len(todo), 8):
    chunk = {k: src[k] for k in todo[i:i + 8]}
    got = call(chunk)
    for k, v in got.items():
        if k in chunk and isinstance(v, str) and len(v) > 40:
            cache[k] = v
    json.dump(cache, open(CACHE, 'w'), ensure_ascii=False)
    print(' ', min(i + 8, len(todo)), 'of', len(todo), '| translated:', len(cache))
    time.sleep(0.5)

q = lambda s: s.replace('\\', '\\\\').replace("'", "\\'")
open(OUT, 'w').write(
"// Spanish summaries, translated from the English ones by\n"
"// tools/translate_pope_summaries.py. Same keys as popeSummaries.js.\n"
"export const POPE_SUMMARIES_ES = {\n"
+ ''.join("  %s: '%s',\n" % (k, q(v)) for k, v in sorted(cache.items(), key=lambda kv: int(kv[0])))
+ "}\n\nexport default POPE_SUMMARIES_ES\n")
print('wrote', OUT, len(cache))
