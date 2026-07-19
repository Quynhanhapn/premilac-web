/* PREMILAC V24.4 — MENU MOBILE */
(function(){
  function initMobileMenu(){
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.getElementById('siteNav');
    const backdrop = document.querySelector('.mobile-menu-backdrop');
    const closeButton = document.querySelector('.mobile-menu-close');
    if(!toggle || !nav || !backdrop) return;

    const mobileQuery = window.matchMedia('(max-width: 900px)');

    function closeMenu(){
      nav.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
      document.body.classList.remove('mobile-nav-open');
      nav.querySelectorAll('.nd.is-open').forEach(item => item.classList.remove('is-open'));
    }

    function openMenu(){
      nav.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded','true');
      document.body.classList.add('mobile-nav-open');
    }

    toggle.addEventListener('click', function(){
      nav.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    if(closeButton) closeButton.addEventListener('click', closeMenu);

    nav.querySelectorAll('.nd > a').forEach(function(parentLink){
      parentLink.addEventListener('click', function(event){
        if(!mobileQuery.matches) return;
        event.preventDefault();
        const parent = parentLink.closest('.nd');
        nav.querySelectorAll('.nd.is-open').forEach(function(item){
          if(item !== parent) item.classList.remove('is-open');
        });
        parent.classList.toggle('is-open');
      });
    });

    nav.querySelectorAll('a').forEach(function(link){
      if(link.parentElement && link.parentElement.classList.contains('nd')) return;
      link.addEventListener('click', function(){
        if(mobileQuery.matches) closeMenu();
      });
    });

    document.addEventListener('keydown', function(event){
      if(event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function(){
      if(!mobileQuery.matches) closeMenu();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  }else{
    initMobileMenu();
  }
})();
