document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const config = Object.assign({brandName:'RED DIGITAL',telegramUsername:'',contactEmail:''},window.STUDIO_CONFIG||{});
  const $ = (selector,root=document) => root.querySelector(selector);
  const $$ = (selector,root=document) => Array.from(root.querySelectorAll(selector));
  const money = n => new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)+' BYN';

  const products = [
    {id:'p1',name:'Наушники Orbit',tag:'Беспроводные',cat:'Техника',price:159,img:'assets/headphones.svg'},
    {id:'p2',name:'Смарт-часы Luna',tag:'Аксессуары',cat:'Техника',price:249,img:'assets/watch.svg'},
    {id:'p3',name:'Колонка Pulse',tag:'Портативная',cat:'Техника',price:129,img:'assets/speaker.svg'},
    {id:'p4',name:'Камера Frame',tag:'Для творчества',cat:'Техника',price:349,img:'assets/camera.svg'},
    {id:'p5',name:'Лампа Glow',tag:'Уют и комфорт',cat:'Для дома',price:89,img:'assets/lamp.svg'},
    {id:'p6',name:'Клавиатура Nova',tag:'Для работы',cat:'Аксессуары',price:179,img:'assets/keyboard.svg'},
    {id:'p7',name:'Сумка Daily',tag:'На каждый день',cat:'Аксессуары',price:109,img:'assets/bag.svg'}
  ];
  const categories = ['Все','Техника','Аксессуары','Для дома'];
  let category = 'Все', query = '', cart = {}, orders = [], currentPage = 'catalog';
  const showToast = text => { const toast=$('#toast');toast.textContent=text;toast.classList.add('show');clearTimeout(showToast._timer);showToast._timer=setTimeout(()=>toast.classList.remove('show'),3100); };
  const escapeHTML = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function renderCategories(){
    $('#shop-categories').innerHTML=categories.map(cat=>`<button type="button" class="${cat===category?'active':''}" data-category="${escapeHTML(cat)}">${escapeHTML(cat)}</button>`).join('');
  }
  function renderProducts(){
    const visible=products.filter(p=>(category==='Все'||p.cat===category)&&p.name.toLowerCase().includes(query.toLowerCase()));
    $('#shop-count').textContent=`${visible.length} ${visible.length===1?'товар':visible.length<5?'товара':'товаров'}`;
    $('#shop-products').innerHTML=visible.length?visible.map(p=>`<article class="product-card"><img class="product-image" src="${p.img}" alt="${escapeHTML(p.name)}" loading="lazy"><div class="product-name">${escapeHTML(p.name)}</div><div class="product-tag">${escapeHTML(p.tag)}</div><div class="product-bottom"><strong>${money(p.price)}</strong><button class="product-add" type="button" data-add="${p.id}" aria-label="Добавить ${escapeHTML(p.name)} в корзину">+</button></div></article>`).join(''):'<div class="empty-state" style="grid-column:1/-1">По вашему запросу ничего не найдено.</div>';
  }
  function countItems(){return Object.values(cart).reduce((a,b)=>a+b,0)}
  function countSuffix(n){return n===1?'товар':n>=2&&n<=4?'товара':'товаров'}
  function total(){return products.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0)}
  function updateBadge(){const n=countItems();const badge=$('#cart-badge');badge.textContent=n;badge.hidden=n===0;$('#cart-total-items').textContent=`${n} ${countSuffix(n)}`;}
  function renderCart(){
    updateBadge(); const items=products.filter(p=>cart[p.id]);
    $('#cart-items').innerHTML=items.length?items.map(p=>`<div class="cart-line"><img src="${p.img}" alt=""><div class="cart-line-copy"><strong>${escapeHTML(p.name)}</strong><small>${money(p.price)}</small></div><div class="qty-controls"><button type="button" data-qty="${p.id}" data-delta="-1" aria-label="Уменьшить количество ${escapeHTML(p.name)}">−</button><b>${cart[p.id]}</b><button type="button" data-qty="${p.id}" data-delta="1" aria-label="Увеличить количество ${escapeHTML(p.name)}">+</button></div></div>`).join(''):'<div class="empty-state"><svg viewBox="0 0 24 24"><use href="#i-cart"/></svg><strong>Корзина пока пуста</strong>Добавь что-нибудь из каталога.</div>';
    $('#cart-summary').innerHTML=items.length?`<div class="cart-summary"><div class="cart-total-row"><span>Итого</span><strong>${money(total())}</strong></div><button type="button" class="shop-primary" id="checkout-trigger">Оформить демо-заказ →</button></div>`:'';
  }
  function renderOrders(){
    $('#orders-list').innerHTML=orders.length?orders.slice().reverse().map(o=>`<article class="order-card"><div class="order-top"><strong>Заказ #${o.id}</strong><b>Демо</b></div><p>${o.quantity} ${countSuffix(o.quantity)} · ${escapeHTML(o.delivery)}<br>Сумма: ${money(o.total)}</p><small>Демо-заказ создан только в вашем браузере</small></article>`).join(''):'<div class="empty-state"><svg viewBox="0 0 24 24"><use href="#i-box"/></svg><strong>Заказов пока нет</strong>Оформите любой заказ в демонстрационном магазине.</div>';
  }
  function openPage(page){
    currentPage=page;
    $$('.shop-page').forEach(el=>el.classList.toggle('active',el.id==='shop-'+page));
    $$('.shop-tab').forEach(el=>el.classList.toggle('active',el.dataset.page===page||(page==='checkout'&&el.dataset.page==='cart')));
    if(page==='cart')renderCart();if(page==='orders')renderOrders();
    if(page==='checkout')$('#checkout-total').innerHTML=`<span>Итого к оформлению</span><strong>${money(total())}</strong>`;
    $('#shop-app').scrollTop=0;
  }
  $('#shop-categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;renderCategories();renderProducts();});
  $('#shop-products').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b)return;const id=b.dataset.add;cart[id]=(cart[id]||0)+1;updateBadge();showToast('Товар добавлен в демо-корзину');});
  $('#shop-search').addEventListener('input',e=>{query=e.target.value.trim();renderProducts();});
  $('#shop-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)openPage(b.dataset.page);});
  $('#shop-cart').addEventListener('click',e=>{const button=e.target.closest('[data-qty]');if(button){const id=button.dataset.qty;cart[id]=Math.max(0,(cart[id]||0)+Number(button.dataset.delta));if(cart[id]===0)delete cart[id];renderCart();return;}if(e.target.closest('#checkout-trigger'))openPage('checkout');});
  $('#checkout-back').addEventListener('click',()=>openPage('cart'));
  $('#place-demo-order').addEventListener('click',()=>{
    if(!countItems()){openPage('cart');return;}
    orders.push({id:String(1000+orders.length+1),total:total(),quantity:countItems(),delivery:$('#delivery-choice').value});cart={};$('#checkout-comment').value='';updateBadge();openPage('orders');showToast('Демо-заказ оформлен. Реальные данные не отправлялись.');
  });
  renderCategories();renderProducts();updateBadge();renderOrders();

  const menu=$('#main-nav'),menuToggle=$('#menu-toggle');
  menuToggle.addEventListener('click',()=>{const showing=menu.classList.toggle('show');menuToggle.setAttribute('aria-expanded',String(showing));});
  $$('a',menu).forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('show');menuToggle.setAttribute('aria-expanded','false');}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('show')){menu.classList.remove('show');menuToggle.setAttribute('aria-expanded','false');}});

  const modal=$('#lead-modal'),leadForm=$('#lead-form');
  const openModal = (plan) => {if(plan){$('#lead-type').value=plan;}$('#lead-result').hidden=true;leadForm.hidden=false;modal.showModal();document.body.classList.add('modal-open');};
  $$('[data-open-lead]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.plan||null)));
  $('#modal-close').addEventListener('click',()=>modal.close());
  modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
  modal.addEventListener('close',()=>document.body.classList.remove('modal-open'));
  const submit = e => {
    e.preventDefault();
    const fd=new FormData(leadForm);
    const lines=[
      'Здравствуйте! Хочу обсудить разработку проекта.',
      '',
      'Имя: '+String(fd.get('name')).trim(),
      'Бизнес: '+(String(fd.get('business')).trim()||'Не указан'),
      'Тип проекта: '+String(fd.get('type')),
      'Контакт для связи: '+String(fd.get('contact')).trim(),
      'Описание: '+(String(fd.get('notes')).trim()||'Обсудим в переписке')
    ];
    const result=lines.join('\n');
    $('#lead-result-text').value=result;
    leadForm.hidden=true;$('#lead-result').hidden=false;
    const telegram=(config.telegramUsername||'').replace(/^@/,'').trim();
    const contactLink=$('#open-telegram-contact');contactLink.hidden=!/^[a-zA-Z0-9_]{5,32}$/.test(telegram);
    if(!contactLink.hidden)contactLink.href='https://t.me/'+encodeURIComponent(telegram);
    $('#lead-result-intro').textContent=contactLink.hidden?'Скопируйте готовый текст и отправьте его продавцу. Контакт для заявок ещё не подключён.':'Скопируйте готовый текст, откройте наш Telegram и вставьте сообщение в чат.';
  };
  leadForm.addEventListener('submit',submit);
  $('#copy-lead').addEventListener('click',async()=>{
    const text=$('#lead-result-text').value;
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text)}else{const textarea=$('#lead-result-text');textarea.focus();textarea.select();if(!document.execCommand('copy'))throw Error('copy unsupported');}showToast('Текст заявки скопирован');}
    catch{const t=$('#lead-result-text');t.focus();t.select();showToast('Выделите текст и скопируйте его вручную');}
  });
  $('#lead-again').addEventListener('click',()=>{$('#lead-result').hidden=true;leadForm.hidden=false;});
  $('#year').textContent=String(new Date().getFullYear());
});
