// The signature: a lattice of points melting into disorder and crystallising back
// to order, a phase transition. Cheap canvas animation (~700 dots, one lerp + arc
// each). Paused off-screen and when the tab is hidden; a single static frame under
// prefers-reduced-motion. The static dotfield.svg is the no-JS fallback (noscript).
(() => {
  const canvas = document.getElementById("phase");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const COLS = 44, ROWS = 16, PAD = 14, PERIOD = 15000;
  const EMBER = [191, 83, 29], TEAL = [14, 124, 134];
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

  let dots = [], W = 0, H = 0, raf = 0, visible = true;

  function build() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height || 1;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gw = (W - 2 * PAD) / (COLS - 1), gh = (H - 2 * PAD) / (ROWS - 1);
    let s = 20260628 >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    dots = [];
    for (let row = 0; row < ROWS; row++) for (let c = 0; c < COLS; c++) {
      const lx = PAD + c * gw, ly = PAD + row * gh, a = rnd() * 6.283, m = 0.5 + rnd() * 0.6;
      dots.push({ lx, ly, cx: lx + Math.cos(a) * gw * 1.8 * m, cy: ly + Math.sin(a) * gh * 1.8 * m, ph: c / (COLS - 1) });
    }
  }

  // order 0 = disorder (scattered, warm); 1 = crystal (lattice, cool).
  const orderAt = (T) => (d) => smooth(T * 1.5 - 0.25 - d.ph * 0.3);

  function render(orderOf) {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      const o = orderOf(d);
      const x = lerp(d.cx, d.lx, o), y = lerp(d.cy, d.ly, o);
      ctx.globalAlpha = 0.3 + o * 0.55;
      ctx.fillStyle = `rgb(${Math.round(lerp(EMBER[0], TEAL[0], o))},${Math.round(lerp(EMBER[1], TEAL[1], o))},${Math.round(lerp(EMBER[2], TEAL[2], o))})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.4 + o * 1.0, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    render(orderAt(Math.sin((now / PERIOD) * 6.283) * 0.5 + 0.5)); // temperature ping-pongs 0..1
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && visible && !reduce) raf = requestAnimationFrame(frame); };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  function setup() { build(); reduce ? render(orderAt(0.85)) : start(); }

  // test hook: freeze a chosen temperature (0 disorder .. 1 order).
  window.__phaseT = (T) => { stop(); build(); render(orderAt(T)); };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0 }).observe(canvas);
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { stop(); setup(); }, 200); });
  setup();
})();
