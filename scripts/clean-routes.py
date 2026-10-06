"""Generate clean bilingual routes and preserve legacy URLs."""
import json,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
routes=json.loads((R/'translations/routes.json').read_text())
mapping={'/en/'+k:'/en/'+v for k,v in routes.items()}
mapping.update({'/'+p.name:('/' if p.name=='index.html' else '/'+p.stem) for p in R.glob('*.html')})
mapping['/en/index.html']='/en/'
def replace(s):
 for old,new in sorted(mapping.items(),key=lambda x:-len(x[0])):
  s=s.replace(old,new)
 # Relative Vietnamese links become canonical clean root paths.
 for p in R.glob('*.html'):
  dest='/' if p.name=='index.html' else '/'+p.stem
  s=re.sub(r'([\"\'])(?:\./)?'+re.escape(p.stem)+r'(?:\.html)?(?=[#?\"\'])',lambda m:m[1]+dest,s)
 s=s.replace(".replace(/^\\.\\//, '')", ".replace(/^\\.?\\//, '')")
 return s
changed=[]
for p in list(R.glob('*.html'))+list((R/'en').glob('*.html'))+list(R.glob('*.js'))+list((R/'en').glob('*.js'))+list(R.glob('*.json'))+list((R/'en').glob('*.json'))+[R/'sitemap.xml']:
 if p.name in ['vercel.json','package.json','package-lock.json']:continue
 old=p.read_text();new=replace(old)
 if old!=new:p.write_text(new);changed.append(str(p.relative_to(R)))
for name,slug in routes.items():
 if slug and slug!=Path(name).stem:
  p=R/'en'/(slug+'.html');p.write_text((R/'en'/name).read_text());changed.append(str(p.relative_to(R)))
config=json.loads((R/'vercel.json').read_text());config['cleanUrls']=True
for rd in config['redirects']:rd['destination']=replace(rd['destination'])
existing={x['source'] for x in config['redirects']}
for name,slug in routes.items():
 if slug and slug!=Path(name).stem:
  for old in ['/en/'+name,'/en/'+Path(name).stem]:
   if old not in existing:config['redirects'].append({'source':old,'destination':'/en/'+slug,'statusCode':301});existing.add(old)
(R/'vercel.json').write_text(json.dumps(config,indent=2));changed.append('vercel.json')
(R/'route-changes.json').write_text(json.dumps(sorted(set(changed))))
print('Updated',len(set(changed)),'route files')
