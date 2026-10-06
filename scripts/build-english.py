"""Build reviewed English pages from Vietnamese source; Python standard library only."""
import json,re,html
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'translations/en.json').read_text())
PAGES=json.loads((ROOT/'translations/pages.json').read_text())
ASSETS={'hero-premilac-desktop.png':'/en/assets/hero-desktop.webp','hero-premilac-mobile.png':'/en/assets/hero-mobile.webp','4as.png':'/en/assets/about.webp','colosferrin-premilac-phap.png':'/en/assets/about.webp'}
for vi,en in [('ca-gia-dinh','family'),('cho-be','children'),('nguoi-lon','adults')]:
 for size in ['desktop','mobile']:
  for ext in ['png','webp']:ASSETS[f'hero-san-pham-{vi}-{size}.{ext}']=f'/en/assets/{en}-{size}.webp'
SCRIPTS={'premilac-mobile-menu.js','premilac-policy-footer.js'}
NORM=lambda x:re.sub(r'\s+',' ',x.strip())
DN={NORM(k):v for k,v in D.items()}
def trans(v):
 if v in D:return D[v]
 n=NORM(v)
 if n in DN:return re.sub(r'\S[\s\S]*\S|\S',lambda _:DN[n],v,count=1)
 if re.fullmatch(r'\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+,\d+',n):return v.replace('.','').replace(',','.')
 return v
def url(v,kind='href'):
 if not v or v.startswith(('#','mailto:','tel:','data:','javascript:')):return v
 s=urlsplit(v)
 if s.netloc and s.netloc not in ['www.premilac.com','premilac.com']:return v
 path=s.path.removeprefix('./').lstrip('/')
 if path.startswith('en/'):return v
 if path in ASSETS:return ASSETS[path]
 if path in PAGES or not path:target='/en/' if path in ('','index.html') else '/en/'+path
 elif path in SCRIPTS or path in ['noi-dung.json','tin-tuc.json']:target='/en/'+path
 else:target='/'+path
 return target+('?' + s.query if s.query else '')+('#'+s.fragment if s.fragment else '')
def js(s):
 pattern=r'''(?P<q>["'])(?P<t>(?:\\.|(?! (?P=q) )[^\\])*)(?P=q)'''
 def replace(m):
  v=m.group('t');nv=trans(v)
  if nv==v and re.fullmatch(r'(?:\./)?[^\s\'"<>]+\.(?:html|png|jpg|webp|json|js)(?:#[^\s]*)?',v):nv=url(v)
  if nv==v:return m.group(0)
  return json.dumps(nv,ensure_ascii=False)
 return re.sub(pattern,replace,s,flags=re.X)
class Localize(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.out=[];self.inside=None
 def handle_starttag(self,tag,attrs):
  raw=self.get_starttag_text()
  for key,value in attrs:
   if value is None:continue
   nv=value
   if key in ['alt','title','aria-label','placeholder','content']:nv=trans(value)
   if key in ['href','src','srcset','poster','data-href']:nv=url(value,key)
   if tag=='html' and key=='lang':nv='en'
   if tag=='meta' and dict(attrs).get('property')=='og:locale' and key=='content':nv='en_US'
   if tag=='meta' and dict(attrs).get('property') in ['og:url','og:image'] and key=='content':nv='https://www.premilac.com'+url(value)
   if tag=='link' and dict(attrs).get('rel')=='canonical' and key=='href':nv='https://www.premilac.com'+url(value)
   if key=='style':nv=re.sub(r'url\(([\"\']?)([^)\"\']+)\1\)',lambda m:'url("'+url(m[2])+'")',value)
   if nv!=value:raw=re.sub(r'\b'+re.escape(key)+r'\s*=\s*([\"\']).*?\1',lambda m:key+'="'+html.escape(nv,quote=True)+'"',raw,count=1,flags=re.S)
  self.out.append(raw)
  if tag in ['script','style']:self.inside=tag
 def handle_startendtag(self,t,a):self.handle_starttag(t,a)
 def handle_endtag(self,t):
  self.out.append('</'+t+'>')
  if t==self.inside:self.inside=None
 def handle_data(self,d):
  if self.inside=='style':d=re.sub(r'url\(([\"\']?)([^)\"\']+)\1\)',lambda m:'url("'+url(m[2])+'")',d)
  elif self.inside=='script':d=js(d).replace('"inLanguage":"vi-VN"','"inLanguage":"en"')
  else:d=html.escape(trans(d),quote=False)
  self.out.append(d)
 def handle_comment(self,d):self.out.append('<!--'+d+'-->')
 def handle_decl(self,d):self.out.append('<!'+d+'>')
def data(v):
 if isinstance(v,dict):return {k:(url(a) if k in ['image','link'] and isinstance(a,str) else data(a)) for k,a in v.items()}
 if isinstance(v,list):return [data(a) for a in v]
 if isinstance(v,str):return trans(v)
 return v
(ROOT/'en').mkdir(exist_ok=True)
for name in PAGES:
 source=(ROOT/name).read_text()
 source=re.sub(r'<link rel="alternate"[^>]+>', '', source)
 source=source.replace('<link rel="stylesheet" href="/premilac-language.css">','').replace('<script src="/premilac-language.js"></script>','')
 parser=Localize();parser.feed(source);out=''.join(parser.out)
 vi='https://www.premilac.com/'+('' if name=='index.html' else name)
 en='https://www.premilac.com/en/'+('' if name=='index.html' else name)
 links=f'<link rel="alternate" hreflang="vi" href="{vi}"><link rel="alternate" hreflang="en" href="{en}"><link rel="alternate" hreflang="x-default" href="{vi}"><link rel="stylesheet" href="/premilac-language.css">'
 # Use absolute URLs in structured data and keep the original support language.
 def fix_schema(m):
  obj=json.loads(m[1])
  def walk(v):
   if isinstance(v,dict):
    v={k:walk(a) for k,a in v.items()}
    if 'availableLanguage' in v:v['availableLanguage']='Vietnamese'
    if v.get('@type')=='WebSite':v.update({'@id':'https://www.premilac.com/en/#website','url':'https://www.premilac.com/en/','inLanguage':'en'})
    if v.get('@type')=='ListItem' and v.get('position')==1 and v.get('name')=='Home':v['item']='https://www.premilac.com/en/'
    return v
   if isinstance(v,list):return [walk(a) for a in v]
   if isinstance(v,str) and v.startswith('/'):return 'https://www.premilac.com'+v
   return v
  return '<script type="application/ld+json">'+json.dumps(walk(obj),ensure_ascii=False,separators=(',',':'))+'</script>'
 out=re.sub(r'<script type="application/ld\+json">(.*?)</script>',fix_schema,out,flags=re.S)
 out=re.sub(r'(<meta name="twitter:image" content=")([^"]+)',lambda m:m[1]+'https://www.premilac.com'+url(m[2]),out)
 out=out.replace('</head>',links+'</head>').replace('</body>','<script src="/premilac-language.js"></script></body>')
 (ROOT/'en'/name).write_text(out)
for name in SCRIPTS:(ROOT/'en'/name).write_text(js((ROOT/name).read_text()))
for name in ['noi-dung.json','tin-tuc.json']:(ROOT/'en'/name).write_text(json.dumps(data(json.loads((ROOT/name).read_text())),ensure_ascii=False,indent=2))
print('Built',len(PAGES),'English pages')
