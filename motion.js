/* Progressive motion layer. No tracking, no third-party dependency. */
document.addEventListener('DOMContentLoaded',()=>{
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  // Scroll progress, passive listener, scheduled into animation frames.
  const progress=$('.scroll-progress'),header=$('.site-header');
  let scrollScheduled=false;
  const updateScroll=()=>{
    scrollScheduled=false;
    const limit=document.documentElement.scrollHeight-window.innerHeight;
    if(progress)progress.style.setProperty('--scroll-progress',(limit>0?Math.min(100,Math.max(0,window.scrollY/limit*100)):0)+'%');
    if(header)header.classList.toggle('is-scrolled',window.scrollY>16);
  };
  window.addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateScroll)}},{passive:true});
  window.addEventListener('resize',updateScroll,{passive:true});updateScroll();
  // Reveal only in supported contexts; on no-JS content is never hidden.
  if(!reduceMotion&&'IntersectionObserver' in window){
    const targets=$$('[data-reveal], .feature-card, .price-card, .step, .faq-items details, .product-layout, .cta-box');
    for(const [index,el] of targets.entries()){
      if(el.closest('.work-card')&&el!==el.closest('.work-card'))continue;
      el.setAttribute('data-reveal','');
      el.classList.add('before-show');
      if(el.classList.contains('work-card')||el.classList.contains('feature-card')||el.classList.contains('step')){
        el.style.setProperty('--reveal-delay',Math.min(index%3,2)*85+'ms');
      }
    }
    document.documentElement.classList.add('motion-on');
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;entry.target.classList.remove('before-show');entry.target.classList.add('is-visible');observer.unobserve(entry.target)}},{threshold:.08,rootMargin:'0px 0px -25px 0px'});
    targets.forEach(el=>observer.observe(el));
  }
  if(!reduceMotion&&finePointer){
    const hero=$('.hero');
    if(hero){
      let frame=0;
      hero.addEventListener('pointermove',e=>{
        if(frame)return;
        const x=e.clientX,y=e.clientY;
        frame=requestAnimationFrame(()=>{
          frame=0;const r=hero.getBoundingClientRect();hero.style.setProperty('--hero-x',((x-r.left)/r.width-.5)*32+'px');hero.style.setProperty('--hero-y',((y-r.top)/r.height-.5)*28+'px');
        });
      },{passive:true});
      hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--hero-x','0px');hero.style.setProperty('--hero-y','0px')});
    }
    for(const card of $$('[data-tilt]')){
      let frame=0;
      card.addEventListener('pointermove',e=>{
        if(frame)return;const x=e.clientX,y=e.clientY;
        frame=requestAnimationFrame(()=>{
          frame=0;const r=card.getBoundingClientRect();const mx=(x-r.left)/r.width,my=(y-r.top)/r.height;
          card.style.setProperty('--tilt-x',((.5-my)*3).toFixed(2)+'deg');
          card.style.setProperty('--tilt-y',((mx-.5)*3).toFixed(2)+'deg');
          card.style.setProperty('--spot-x',(mx*100).toFixed(2)+'%');
          card.style.setProperty('--spot-y',(my*100).toFixed(2)+'%');
        });
      },{passive:true});
      card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg')});
    }
  }
  // Filter home-page work cards without removing their existing links or keyboard access.
  const filters=$$('[data-work-filter]');
  const cards=$$('[data-work]');
  filters.forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.workFilter;
    filters.forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});
    cards.forEach(card=>{
      const visible=filter==='all'||card.dataset.work===filter;
      card.classList.toggle('is-filtered-out',!visible);
      card.setAttribute('aria-hidden',String(!visible));
      if(visible){card.classList.remove('before-show');card.classList.add('is-visible')}
    });
  }));
  // This page doesn't load app.js, so its mobile navigation needs its own handler.
  if(document.body.classList.contains('portfolio-page')){
    const menu=$('#main-nav'),toggle=$('#menu-toggle');
    if(menu&&toggle){
      toggle.addEventListener('click',()=>{const open=menu.classList.toggle('show');toggle.setAttribute('aria-expanded',String(open))});
      $$('a',menu).forEach(link=>link.addEventListener('click',()=>{menu.classList.remove('show');toggle.setAttribute('aria-expanded','false')}));
      document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.classList.remove('show');toggle.setAttribute('aria-expanded','false')}});
    }
    const year=$('#year');if(year)year.textContent=new Date().getFullYear();
  }
});
