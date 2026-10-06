(function(){
  const isEn = document.documentElement.lang === 'en';
  const page = location.pathname.split('/').pop() || 'index.html';
  const vi = '/' + (page === 'index.html' ? '' : page);
  const en = '/en/' + (page === 'index.html' ? '' : page);
  const header = document.querySelector('.header-inner');
  if(header){
    const nav=document.createElement('nav');
    nav.className='premilac-language';nav.setAttribute('aria-label','Language');
    [['VI',vi,!isEn,'vi'],['EN',en,isEn,'en']].forEach(([label,href,current,lang])=>{
      const a=document.createElement('a');a.textContent=label;a.href=href+location.hash;
      a.hreflang=lang;a.lang=lang;a.title=label==='VI'?'Tiếng Việt':'English';
      if(current)a.setAttribute('aria-current','page');nav.append(a);
    });
    header.insertBefore(nav,header.querySelector('.nav'));
  }
  if(isEn){
    function markLinks(root){root.querySelectorAll('a[href]').forEach(a=>{
      const u=new URL(a.href,location.href);
      if(u.origin===location.origin && /\.html$/.test(u.pathname) && !u.pathname.startsWith('/en/')){
        a.hreflang='vi';a.classList.add('premilac-vi-link');a.title='Available in Vietnamese';
      }
    });}
    markLinks(document);
    new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)markLinks(n);}).observe(document.body,{childList:true,subtree:true});
  }
})();
