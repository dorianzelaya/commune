import re, sys, os

SRC = os.path.expanduser('~/catholic-companion/frontend/src/_popes_wikitext.txt')
OUT = os.path.expanduser('~/catholic-companion/frontend/src/data/popes.js')
w = open(SRC).read()

blocks, i = [], 0
while True:
    j = w.find('{{pope list item', i)
    if j < 0: break
    k, depth = j + 2, 1
    while k < len(w) and depth:
        if w.startswith('{{', k): depth += 1; k += 2; continue
        if w.startswith('}}', k): depth -= 1; k += 2; continue
        k += 1
    blocks.append(w[j:k]); i = k

def params(block):
    s = block[2:-2]
    out, buf, d1, d2, i = [], [], 0, 0, 0
    while i < len(s):
        if s.startswith('{{', i): d1 += 1; buf.append('{{'); i += 2; continue
        if s.startswith('}}', i): d1 -= 1; buf.append('}}'); i += 2; continue
        if s.startswith('[[', i): d2 += 1; buf.append('[['); i += 2; continue
        if s.startswith(']]', i): d2 -= 1; buf.append(']]'); i += 2; continue
        if s[i] == '|' and d1 == 0 and d2 == 0:
            out.append(''.join(buf).strip()); buf = []; i += 1; continue
        buf.append(s[i]); i += 1
    out.append(''.join(buf).strip())
    return out

def clean(s):
    s = re.sub(r'<ref[^>]*>.*?</ref>', '', s, flags=re.S)
    s = re.sub(r'<ref[^>]*/>', '', s)
    s = s.replace('{{circa}}', 'c.')
    for _ in range(6):
        s2 = re.sub(r'\{\{[^{}]*\}\}', '', s)
        if s2 == s: break
        s = s2
    s = re.sub(r'\[\[File:[^\]]*\]\]', '', s, flags=re.I)
    s = re.sub(r'\[\[[^\]|]*\|([^\]]*)\]\]', r'\1', s)
    s = re.sub(r'\[\[([^\]]*)\]\]', r'\1', s)
    s = s.replace("'''", '').replace("''", '')
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s+', ' ', s).strip(' ,;')

ES = {'Peter':'Pedro','Linus':'Lino','Anacletus':'Anacleto','Clement':'Clemente',
 'Evaristus':'Evaristo','Alexander':'Alejandro','Sixtus':'Sixto','Telesphorus':'Telesforo',
 'Hyginus':'Higinio','Pius':'Pío','Anicetus':'Aniceto','Soter':'Sotero','Eleutherius':'Eleuterio',
 'Victor':'Víctor','Zephyrinus':'Ceferino','Callixtus':'Calixto','Urban':'Urbano','Pontian':'Ponciano',
 'Anterus':'Antero','Fabian':'Fabián','Cornelius':'Cornelio','Lucius':'Lucio','Stephen':'Esteban',
 'Dionysius':'Dionisio','Felix':'Félix','Eutychian':'Eutiquiano','Caius':'Cayo','Marcellinus':'Marcelino',
 'Marcellus':'Marcelo','Eusebius':'Eusebio','Miltiades':'Melquíades','Sylvester':'Silvestre','Mark':'Marcos',
 'Julius':'Julio','Liberius':'Liberio','Damasus':'Dámaso','Siricius':'Siricio','Anastasius':'Anastasio',
 'Innocent':'Inocencio','Zosimus':'Zósimo','Boniface':'Bonifacio','Celestine':'Celestino','Leo':'León',
 'Hilarius':'Hilario','Simplicius':'Simplicio','Gelasius':'Gelasio','Symmachus':'Símaco','John':'Juan',
 'Agapetus':'Agapito','Silverius':'Silverio','Vigilius':'Vigilio','Pelagius':'Pelagio','Benedict':'Benedicto',
 'Gregory':'Gregorio','Sabinian':'Sabiniano','Honorius':'Honorio','Severinus':'Severino','Theodore':'Teodoro',
 'Martin':'Martín','Eugene':'Eugenio','Vitalian':'Vitaliano','Adeodatus':'Adeodato','Donus':'Dono',
 'Agatho':'Agatón','Conon':'Conón','Sergius':'Sergio','Sisinnius':'Sisinio','Constantine':'Constantino',
 'Zachary':'Zacarías','Paul':'Pablo','Adrian':'Adriano','Valentine':'Valentín','Nicholas':'Nicolás',
 'Marinus':'Marino','Formosus':'Formoso','Romanus':'Romano','Christopher':'Cristóbal','Lawrence':'Lorenzo',
 'John Paul':'Juan Pablo','Francis':'Francisco','Hadrian':'Adriano','Callistus':'Calixto'}

def es_name(en):
    m = re.match(r'^(John Paul|[A-Za-zÀ-ÿ]+)\s*(.*)$', en)
    if not m: return en
    base, rest = m.group(1), m.group(2)
    return (ES.get(base, base) + (' ' + rest if rest else '')).strip()

def years(reign):
    c = clean(reign)
    halves = re.split(r'[–—]|(?<=\s)-(?=\s)', c, maxsplit=1)
    def last_year(t):
        # "166/7" means 166 or 167, and "20 July 514" has a day in front, so
        # take the last three or four digit number, and fall back to the
        # largest short one for the first century.
        n = re.findall(r'\b(\d{1,4})\b', t)
        if not n: return None
        long_ = [x for x in n if len(x) >= 3]
        if long_: return long_[-1]
        return max(n, key=int)
    return (last_year(halves[0]) if halves else None,
            last_year(halves[1]) if len(halves) > 1 else None)

g = lambda f, i: f[i] if i < len(f) else ''
popes, skipped = [], []
for b in blocks:
    p = params(b)
    f = p[1:]
    if 'portraitless' in p[0]:
        if len(f) < 4: skipped.append(clean(g(f, 0))[:30]); continue
        num, reign, name, born, place = g(f,0), g(f,1), g(f,2), '', g(f,3)
        notes = g(f, 5)
    else:
        if len(f) < 6: skipped.append(clean(g(f, 0))[:30]); continue
        num, reign, name, born, place = g(f,0), g(f,1), g(f,3), g(f,4), g(f,5)
        notes = g(f, 7)
    m = re.search(r'\d+', clean(num))
    if not m: skipped.append(clean(num)[:30]); continue
    pm = re.search(r'\[\[([^\]|#]+)', name)
    page = pm.group(1).strip() if pm else ''
    nm = clean(name)
    saint = bool(re.match(r'^(St|Bl)\.?\s', nm))
    nm = re.sub(r'^(St|Bl)\.?\s+', '', nm).strip()
    nm = re.sub(r'^(Servant of God|Venerable|Ven\.)\s+', '', nm).strip()
    nm = re.sub(r'\s*"[^"]*"', '', nm)
    nm = re.sub(r'\s*\([^)]*\)', '', nm).strip()
    fm = re.search(r'[Ff]east day[^.;]*', clean(notes))
    feast = ''
    if fm:
        feast = re.sub(r'^[Ff]east day\s*', '', fm.group(0))
        feast = re.sub(r'\([^)]*\)', '', feast).strip(' ,:')[:40]
    a, z = years(reign)
    popes.append({'num': int(m.group()), 'en': nm, 'es': es_name(nm), 'a': a, 'z': z,
                  'saint': saint, 'born': clean(born), 'place': clean(place), 'feast': feast, 'page': page})

seen, uniq = set(), []
for x in popes:
    key = (x['num'], x['en'])
    if key in seen: continue
    seen.add(key); uniq.append(x)
print('dropped duplicate rows:', len(popes) - len(uniq))
popes = uniq

print('parsed:', len(popes), '| skipped:', len(skipped), skipped[:4])
print('highest number:', max(p['num'] for p in popes))
print('first:', [(p['num'], p['en'], p['a']) for p in popes[:3]])
print('last: ', [(p['num'], p['en'], p['a'], p['z']) for p in popes[-3:]])
print('Benedict IX:', [(p['num'], p['a'], p['z']) for p in popes if p['en'].startswith('Benedict IX')])

ERAS = [(-9999,499,'The early Church','La Iglesia primitiva'),
        (500,1299,'The medieval papacy','El papado medieval'),
        (1300,1449,'Avignon and the schism','Aviñón y el cisma'),
        (1450,1649,'Renaissance and Trent','Renacimiento y Trento'),
        (1650,1899,'The modern papacy','El papado moderno'),
        (1900,9999,'The twentieth century on','Del siglo XX en adelante')]

q = lambda s: s.replace('\\', '').replace("'", "\\'")
groups = []
for lo, hi, en_k, es_k in ERAS:
    rows = []
    for p in popes:
        y = int(p['a']) if p['a'] and p['a'].isdigit() else 0
        if not (lo <= y <= hi): continue
        ref_en = f"{p['a']}-{p['z']}" if p['z'] else f"{p['a']}-present"
        ref_es = f"{p['a']}-{p['z']}" if p['z'] else f"{p['a']}-presente"
        rows.append("          { num: %d, saint: %s, key: '%s',\n            title: { en: '%s', es: '%s' },\n"
                    "            ref: { en: '%s', es: '%s' },\n"
                    "            born: '%s', place: '%s', feast: '%s', page: '%s' },"
                    % (p['num'], 'true' if p['saint'] else 'false', q(p['en']), q(p['en']), q(p['es']),
                       ref_en, ref_es, q(p['born'])[:60], q(p['place'])[:70], q(p['feast']), q(p['page'])))
    print(f"  {en_k}: {len(rows)}")
    if rows:
        groups.append("      {\n        kind: { en: '%s', es: '%s' },\n        items: [\n%s\n        ],\n      },"
                      % (en_k, es_k, '\n'.join(rows)))

open(OUT, 'w').write(
"// The line of popes in the Annuario Pontificio's order. Benedict IX's three\n"
"// reigns are counted separately, antipopes are excluded, and dates before\n"
"// the fourth century are approximate in every source there is.\n"
"export const POPES_TOPIC = {\n  id: 'popes',\n  searchable: true,\n  kind: 'parables',\n  group: 'history',\n"
"  title: { en: 'The popes', es: 'Los papas' },\n"
"  blurb: { en: 'The line from Peter, unbroken', es: 'La línea desde Pedro, sin interrupción' },\n"
"  parables: [\n" + '\n'.join(groups) + "\n  ],\n}\n\nexport default POPES_TOPIC\n")
print('wrote', OUT)
