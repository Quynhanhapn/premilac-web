/* PREMILAC V24.5 — MENU MOBILE TOÀN WEBSITE */
(function(){
  function createElement(tag, className, attributes){
    var element = document.createElement(tag);
    if(className) element.className = className;
    Object.keys(attributes || {}).forEach(function(key){
      element.setAttribute(key, attributes[key]);
    });
    return element;
  }

  function ensureMobileMenuMarkup(){
    var headerInner = document.querySelector('.header .header-inner');
    if(!headerInner) return null;

    var nav = headerInner.querySelector('.nav');
    if(!nav) return null;

    var logoLink = Array.prototype.find.call(headerInner.children, function(child){
      return child.tagName === 'A' && child.querySelector('img');
    });
    if(logoLink && (!logoLink.getAttribute('href') || logoLink.getAttribute('href') === '#')){
      logoLink.setAttribute('href','index.html');
    }

    nav.id = nav.id || 'siteNav';

    /* V29: sửa toàn bộ liên kết trong menu Thông Tin Dinh Dưỡng trên mọi trang */
    var nutritionRoutes = {
      'thông tin dinh dưỡng cần biết': 'thong-tin-dinh-duong-can-biet.html',
      'đánh giá tình trạng dinh dưỡng': 'danh-gia-tinh-trang-dinh-duong.html',
      'kiến thức dinh dưỡng cho trẻ sơ sinh': 'kien-thuc-dinh-duong-cho-tre-so-sinh.html',
      'kiến thức dinh dưỡng cho trẻ trên 1 tuổi': 'kien-thuc-dinh-duong-cho-tre-tren-1-tuoi.html',
      'kiến thức dinh dưỡng cho người trưởng thành': 'kien-thuc-dinh-duong-cho-nguoi-truong-thanh.html'
    };
    nav.querySelectorAll('.dm a').forEach(function(link){
      var route = nutritionRoutes[link.textContent.trim().toLowerCase()];
      if(route) link.setAttribute('href', route);
    });

    /* V28: thêm công cụ Đánh Giá Tình Trạng Dinh Dưỡng vào menu */
    nav.querySelectorAll('.dm').forEach(function(menu){
      var nutritionLink = Array.prototype.find.call(menu.querySelectorAll('a'), function(link){
        return link.textContent.trim().toLowerCase() === 'thông tin dinh dưỡng cần biết';
      });
      if(!nutritionLink) return;
      var bmiLink = Array.prototype.find.call(menu.querySelectorAll('a'), function(link){
  var text = link.textContent.trim().toLowerCase();
  return text === 'đánh giá tình trạng dinh dưỡng'
      || text === 'đánh giá tình trạng dinh dưỡng bằng bmi';
});
      if(!bmiLink){
        bmiLink = createElement('a','',{href:'danh-gia-tinh-trang-dinh-duong.html'});
        bmiLink.textContent = 'Đánh Giá Tình Trạng Dinh Dưỡng';
        nutritionLink.insertAdjacentElement('afterend', bmiLink);
      }else{
        bmiLink.setAttribute('href','danh-gia-tinh-trang-dinh-duong.html');
      }
    });

    var toggle = headerInner.querySelector('.mobile-menu-toggle');
    if(!toggle){
      toggle = createElement('button','mobile-menu-toggle',{
        type:'button',
        'aria-label':'Mở menu',
        'aria-controls':nav.id,
        'aria-expanded':'false'
      });
      toggle.innerHTML = '<span></span><span></span><span></span>';
      if(logoLink && logoLink.nextSibling){
        headerInner.insertBefore(toggle, logoLink.nextSibling);
      }else{
        headerInner.insertBefore(toggle, nav);
      }
    }

    var hotline = headerInner.querySelector('.mobile-header-hotline');
    if(!hotline){
      hotline = createElement('a','mobile-header-hotline',{href:'tel:02462998299'});
      hotline.innerHTML = '☎ <span>024.6299.8299</span>';
      headerInner.insertBefore(hotline, nav);
    }

    var backdrop = headerInner.querySelector('.mobile-menu-backdrop');
    if(!backdrop){
      backdrop = createElement('div','mobile-menu-backdrop',{'aria-hidden':'true'});
      headerInner.insertBefore(backdrop, nav);
    }

    var menuHead = nav.querySelector('.mobile-menu-head');
    if(!menuHead){
      menuHead = createElement('div','mobile-menu-head');
      menuHead.innerHTML = '<span class="mobile-menu-brand">MENU PREMILAC</span><button class="mobile-menu-close" type="button" aria-label="Đóng menu">×</button>';
      nav.insertBefore(menuHead, nav.firstChild);
    }

    return {
      toggle:toggle,
      nav:nav,
      backdrop:backdrop,
      closeButton:menuHead.querySelector('.mobile-menu-close')
    };
  }

  function initMobileMenu(){
    var elements = ensureMobileMenuMarkup();
    if(!elements) return;

    var toggle = elements.toggle;
    var nav = elements.nav;
    var backdrop = elements.backdrop;
    var closeButton = elements.closeButton;
    var mobileQuery = window.matchMedia('(max-width: 900px)');

    function closeMenu(){
      nav.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
      document.body.classList.remove('mobile-nav-open');
      nav.querySelectorAll('.nd.is-open').forEach(function(item){
        item.classList.remove('is-open');
      });
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
        var parent = parentLink.closest('.nd');
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
