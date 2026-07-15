const slides=[...document.querySelectorAll('.hero-slide')];
const dots=[...document.querySelectorAll('.dot')];
let current=0,timer;
function showSlide(i){current=i;slides.forEach((s,n)=>s.classList.toggle('active',n===i));dots.forEach((d,n)=>d.classList.toggle('active',n===i));}
function startAuto(){clearInterval(timer);timer=setInterval(()=>showSlide((current+1)%slides.length),5500)}
dots.forEach((dot,i)=>dot.addEventListener('click',()=>{showSlide(i);startAuto()}));startAuto();
const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.main-nav');
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const topBtn=document.querySelector('.to-top');
window.addEventListener('scroll',()=>topBtn.classList.toggle('show',window.scrollY>500));topBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
