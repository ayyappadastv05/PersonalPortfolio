const root = document.documentElement;
const glow = document.querySelector('.mouse-glow');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth ambient pointer-following light using interpolation instead of jumpy pointer animation.
if (!reducedMotion && glow) {
  let targetX = window.innerWidth * .5, targetY = window.innerHeight * .3;
  let currentX = targetX, currentY = targetY;
  window.addEventListener('pointermove', (e) => {
    targetX = e.clientX; targetY = e.clientY;
    root.style.setProperty('--mx', `${e.clientX}px`);
    root.style.setProperty('--my', `${e.clientY}px`);
  }, { passive: true });
  const follow = () => {
    currentX += (targetX - currentX) * 0.075;
    currentY += (targetY - currentY) * 0.075;
    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;
    requestAnimationFrame(follow);
  };
  follow();
}

// Mobile navigation.
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
}));

// Scroll reveal.
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
revealEls.forEach(el => revealObserver.observe(el));

// Active navigation section.
const sections = [...document.querySelectorAll('main section[id]')];
const links = [...document.querySelectorAll('.nav-link')];
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
}, { threshold: [0.15, 0.35, 0.6], rootMargin: '-15% 0px -55% 0px' });
sections.forEach(s => sectionObserver.observe(s));

// Magnetic interaction.
if (!reducedMotion) {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// 3D tilt cards.
if (!reducedMotion) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 8;
      const ry = (px - 0.5) * 9;
      card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.008)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

// Tiny interactive particle field.
const canvas = document.getElementById('particles');
if (canvas && !reducedMotion) {
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, dpr = Math.min(devicePixelRatio || 1, 2);
  const pointer = { x: -9999, y: -9999 };
  const particles = [];
  const count = Math.min(72, Math.floor(window.innerWidth / 18));
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i=0;i<count;i++) particles.push({ x: Math.random()*width, y: Math.random()*height, vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22, r:Math.random()*1.5+.5 });
  window.addEventListener('pointermove', e => { pointer.x=e.clientX; pointer.y=e.clientY; });
  function draw(){
    ctx.clearRect(0,0,width,height);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>width)p.vx*=-1; if(p.y<0||p.y>height)p.vy*=-1;
      const dx=p.x-pointer.x, dy=p.y-pointer.y, dist=Math.hypot(dx,dy);
      if(dist<160 && dist>0){p.x += dx/dist*.45; p.y += dy/dist*.45;}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(135,210,255,.48)'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}
