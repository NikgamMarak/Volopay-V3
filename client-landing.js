// The landing page film. Scrolling moves through one deal, from the evening
// message to the morning signature. Each caption sets the scene on the stage.
(function () {
  const stage = document.getElementById('stage');
  const frame = document.getElementById('frame');
  if (!stage || !frame) return;

  const shots = Array.from(document.querySelectorAll('.shot'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 900px)');
  const typed = document.getElementById('bubble-text');
  const message = typed.dataset.full;
  let current = -1;
  let typing = false;

  // Fit the fixed-size scene canvas into whatever space the stage has.
  function fit() {
    const r = stage.getBoundingClientRect();
    const scale = Math.min(1.08, r.width / 560, r.height / 700);
    frame.style.setProperty('--fit', String(Math.max(0.45, scale)));
  }

  // Scene 1: the message types itself out, once.
  function type() {
    if (typing) return;
    typing = true;
    if (reduce) { typed.textContent = message; stage.classList.add('typed'); return; }
    let i = 0;
    const tick = () => {
      i = Math.min(message.length, i + 2);
      typed.textContent = message.slice(0, i);
      if (i < message.length) setTimeout(tick, 24);
      else stage.classList.add('typed');
    };
    tick();
  }

  // Scene 3: totals count to their new values when the rush line is added.
  const fmt = (n) => '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
  const before = { subtotal: 120000, gst: 21600, total: 141600 };
  const after = { subtotal: 135000, gst: 24300, total: 159300 };
  const shown = { ...before };
  const cells = Array.from(frame.querySelectorAll('[data-count]'));
  function countTo(target) {
    const from = { ...shown };
    const start = performance.now();
    const duration = reduce ? 0 : 800;
    function step(now) {
      const k = duration ? Math.min(1, (now - start) / duration) : 1;
      const eased = 1 - Math.pow(1 - k, 3);
      for (const cell of cells) {
        const key = cell.dataset.count;
        shown[key] = from[key] + (target[key] - from[key]) * eased;
        cell.textContent = fmt(shown[key]);
      }
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setScene(n) {
    if (n === current) return;
    const previous = current;
    current = n;
    stage.dataset.scene = String(n);
    document.body.dataset.scene = String(n);
    for (const shot of shots) shot.classList.toggle('is-on', Number(shot.dataset.scene) === n);
    if (n >= 1) type();
    if (previous !== -1 && (n >= 3) !== (previous >= 3)) countTo(n >= 3 ? after : before);
  }

  let ticking = false;
  function update() {
    ticking = false;
    const line = window.innerHeight * (narrow.matches ? 0.8 : 0.55);
    let n = 0;
    for (const shot of shots) if (shot.getBoundingClientRect().top <= line) n = Number(shot.dataset.scene);
    setScene(n);
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', () => { fit(); update(); });
  fit();
  update();
})();
