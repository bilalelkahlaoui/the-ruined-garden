(function initHeroBackground(){
  const wrap = document.getElementById('heroBg');
  if(!wrap) return;
  const layers = Array.from(wrap.querySelectorAll('.hero-bg-layer'));
  if(!layers.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const video = document.getElementById('heroVideo');

  let pool = layers;
  if(reduceMotion){
    pool = layers.filter(l => l.dataset.variant !== 'video');
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)];

  layers.forEach(layer=>{
    if(layer === chosen){
      layer.classList.add('is-active');
    } else {
      layer.classList.remove('is-active');
    }
  });

  if(chosen === video){
    video.preload = 'auto';
    const tryPlay = ()=> video.play().catch(()=>{});
    if(video.readyState >= 2){ tryPlay(); }
    else video.addEventListener('loadeddata', tryPlay, { once:true });
  }
})();

(function initCursor(){
  const ring = document.getElementById('cursorRing');
  const dot  = document.getElementById('cursorDot');
  if(!ring || !dot) return;
  if(window.matchMedia('(hover: none)').matches) return;

  let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener('mousemove', (e)=>{
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function loop(){
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('[data-hover]').forEach(el=>{
    el.addEventListener('mouseenter', ()=> ring.classList.add('is-active'));
    el.addEventListener('mouseleave', ()=> ring.classList.remove('is-active'));
  });
})();

(function initNav(){
  const nav = document.getElementById('nav');
  if(!nav) return;
  const onScroll = ()=>{
    if(window.scrollY > 40){
      nav.style.background = 'rgba(9,28,23,0.82)';
      nav.style.borderColor = 'rgba(238,244,238,0.2)';
    } else {
      nav.style.background = 'rgba(9,28,23,0.55)';
      nav.style.borderColor = 'rgba(238,244,238,0.14)';
    }
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

(function initScrollspy(){
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if(!links.length) return;

  const map = links
    .map(link=>({
      link,
      section: document.getElementById(link.getAttribute('href').slice(1))
    }))
    .filter(entry => entry.section);
  if(!map.length) return;

  function setActive(id){
    map.forEach(({link, section})=>{
      link.classList.toggle('is-active', section.id === id);
    });
  }

  const io = new IntersectionObserver((entries)=>{
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b)=> a.boundingClientRect.top - b.boundingClientRect.top);
    if(visible.length){
      setActive(visible[0].target.id);
    }
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  map.forEach(({section}) => io.observe(section));
})();

(function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  items.forEach((el, i)=>{
    el.style.transitionDelay = (i % 4) * 0.06 + 's';
    io.observe(el);
  });
})();

(function initTilt(){
  const cards = document.querySelectorAll('.dish-card, .garden-figure');
  if(!cards.length) return;
  if(window.matchMedia('(hover: none)').matches) return;

  cards.forEach(card=>{
    let bounds;
    card.addEventListener('mouseenter', ()=>{
      bounds = card.getBoundingClientRect();
    });
    card.addEventListener('mousemove', (e)=>{
      if(!bounds) bounds = card.getBoundingClientRect();
      const relX = (e.clientX - bounds.left) / bounds.width;
      const relY = (e.clientY - bounds.top) / bounds.height;
      const ry = (relX - 0.5) * 10;
      const rx = (0.5 - relY) * 8;
      card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

(function initBlobCanvas(){
  const canvas = document.getElementById('blobCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth = canvas.parentElement.offsetWidth;
    h = canvas.clientHeight = canvas.parentElement.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  const palette = [
    { r: 47,  g: 158, b: 131 },
    { r: 85,  g: 227, b: 171 },
    { r: 95,  g: 199, b: 217 },
    { r: 14,  g: 47,  b: 66  },
  ];

  const blobs = Array.from({ length: 6 }).map((_, i)=>{
    const c = palette[i % palette.length];
    return {
      baseX: Math.random(),
      baseY: Math.random()*0.6 + 0.15,
      r: 0.18 + Math.random()*0.16,
      speed: 0.15 + Math.random()*0.12,
      phase: Math.random()*Math.PI*2,
      swirl: 0.6 + Math.random()*0.8,
      color: c,
    };
  });

  let pointer = { x: 0.5, y: 0.5, active: false };
  canvas.parentElement.addEventListener('mousemove', (e)=>{
    const b = canvas.parentElement.getBoundingClientRect();
    pointer.x = (e.clientX - b.left) / b.width;
    pointer.y = (e.clientY - b.top) / b.height;
    pointer.active = true;
  });
  canvas.parentElement.addEventListener('mouseleave', ()=>{ pointer.active = false; });

  let t = 0;
  function draw(){
    t += reduceMotion ? 0 : 0.0045;
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'blur(46px)';

    blobs.forEach(b=>{
      const drift = t * b.speed;
      let x = b.baseX + Math.sin(drift + b.phase) * 0.09 * b.swirl;
      let y = b.baseY + Math.cos(drift * 0.8 + b.phase) * 0.07 * b.swirl;

      if(pointer.active){
        const dx = pointer.x - x, dy = pointer.y - y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        const pull = Math.max(0, 0.22 - dist) * 0.5;
        x += dx * pull;
        y += dy * pull;
      }

      const cx = x * w, cy = y * h;
      const radius = b.r * Math.max(w,h);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const { r, g, b: bl } = b.color;
      grad.addColorStop(0, `rgba(${r},${g},${bl},0.55)`);
      grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI*2);
      ctx.fill();
    });

    ctx.filter = 'none';
    requestAnimationFrame(draw);
  }
  draw();
})();
(function initReserveModal(){
  const WHATSAPP_NUMBER = '212643230045';

  const openBtn   = document.getElementById('reserveOpenBtn');
  const overlay   = document.getElementById('reserveOverlay');
  const closeBtn  = document.getElementById('reserveCloseBtn');
  const form      = document.getElementById('reserveForm');
  if(!openBtn || !overlay || !form) return;

  function openModal(){
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstField = document.getElementById('reserveName');
    if(firstField) firstField.focus();
  }

  function closeModal(){
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e)=>{
    if(e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && overlay.classList.contains('is-active')) closeModal();
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();

    const name   = document.getElementById('reserveName').value.trim();
    const tables = document.getElementById('reserveTables').value;
    const people = document.getElementById('reservePeople').value;
    const date   = document.getElementById('reserveDate').value;
    const time   = document.getElementById('reserveTime').value;
    const notes  = document.getElementById('reserveNotes').value.trim();

    const lines = [
      `Hello, I'd like to reserve a table at The Ruined Garden.`,
      `Name: ${name}`,
      `Tables: ${tables}`,
      `Guests per table: ${people}`
    ];
    if(date) lines.push(`Date: ${date}`);
    if(time) lines.push(`Time: ${time}`);
    if(notes) lines.push(`Notes: ${notes}`);

    const message = encodeURIComponent(lines.join('\n'));
    const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    window.open(waURL, '_blank');
    closeModal();
    form.reset();
  });
})();
