(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const y=document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();

  // Nav background on scroll
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Count-up stats
  const fmt = n => n.toLocaleString('en-US');
  const counter = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      counter.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
      if (reduce) return;
      const t0 = performance.now(), dur = 1400;
      const tick = t => {
        const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(Math.round(end * eased)) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, {threshold:.6});
  document.querySelectorAll('[data-count]').forEach(el => counter.observe(el));

  // Statement: words light up while scrolling
  const st = document.querySelector('[data-words]');
  if (st && !reduce) {
    const wrapWords = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrapWords(n);
      });
    };
    wrapWords(st);
    const words = st.querySelectorAll('.w');
    const update = () => {
      const r = st.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(Math.max((vh * .85 - r.top) / (r.height + vh * .45), 0), 1);
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    addEventListener('scroll', update, {passive:true}); update();
  }
})();

// Case study: highlight active TOC entry
(() => {
  const links = document.querySelectorAll('.toc a[href^="#"]');
  if (!links.length) return;
  const map = new Map([...links].map(a => [a.getAttribute('href').slice(1), a]));
  const obs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { links.forEach(l => l.classList.remove('active')); map.get(e.target.id)?.classList.add('active'); }
  }), {rootMargin:'-30% 0px -60% 0px'});
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) obs.observe(s); });
})();
