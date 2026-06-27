// The signature: a phase transition by nucleation and growth. A crystal front (or a
// melt front) starts at a random point and propagates outward as an expanding ring;
// the moment it covers the field it flips and a fresh front nucleates elsewhere. No
// dwell at the extremes, no fixed direction. Cheap canvas (~700 dots, one hypot + arc
// each). Paused off-screen and when hidden; static frame under reduced-motion; the
// static dotfield.svg is the no-JS fallback.
(() => {
  const canvas = document.getElementById("phase");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PAD = 14;
  // 1944 sites either way (the year Onsager solved the 2D Ising model): a wide 72×27
  // lattice, re-tiled to a taller 36×54 when the canvas is portrait, so the dots are
  // not crushed on a phone held upright. Both tilings are 72×27 = 36×54 = 1944.
  const GRID_WIDE = [72, 27], GRID_TALL = [36, 54];
  let COLS = 72, ROWS = 27;

  // Front growth scales with the canvas, so a transition takes the same wall-clock
  // time at any size (≈0.12 px/ms at the 760×260 reference). A constant px-speed made
  // a small portrait canvas, with its short diagonal, cycle about twice as fast.
  const SPEED_REF = 0.12, DIAG_REF = Math.hypot(760, 260);
  let speed = SPEED_REF;
  // For the physicists: this is a 2D Ising-style transition. T_C is the exact critical
  // temperature at which order spontaneously appears, from Onsager's 1944 solution.
  const T_C = 2 / Math.log(1 + Math.SQRT2); // = 2.269185314…
  const BAND = 31 * T_C;                    // ≈70px front thickness, in cheeky units of T_c
  const EMBER = [191, 83, 29], TEAL = [14, 124, 134];
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

  let dots = [], W = 0, H = 0, raf = 0, visible = true, last = 0;
  let cryst = true, nx = 0, ny = 0, maxD = 1, R = 0; // front state

  function nucleate() {
    nx = Math.random() * W; ny = Math.random() * H;
    maxD = Math.max(Math.hypot(nx, ny), Math.hypot(nx - W, ny), Math.hypot(nx, ny - H), Math.hypot(nx - W, ny - H));
    R = 0;
  }

  function build() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height || 1;
    [COLS, ROWS] = H > W ? GRID_TALL : GRID_WIDE;          // re-tile the 1944 sites for the shape
    speed = SPEED_REF * Math.hypot(W, H) / DIAG_REF;       // constant cycle time at any size
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gw = (W - 2 * PAD) / (COLS - 1), gh = (H - 2 * PAD) / (ROWS - 1);
    let s = 20260628 >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    dots = [];
    for (let row = 0; row < ROWS; row++) for (let c = 0; c < COLS; c++) {
      const lx = PAD + c * gw, ly = PAD + row * gh, a = rnd() * 6.283, m = 0.5 + rnd() * 0.6;
      dots.push({ lx, ly, cx: lx + Math.cos(a) * gw * 1.8 * m, cy: ly + Math.sin(a) * gh * 1.8 * m });
    }
  }

  // order 0 = disorder (scattered, warm); 1 = crystal (lattice, cool).
  // A dot's order is set purely by whether the expanding front has passed it.
  function paint() {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      const dist = Math.hypot(d.lx - nx, d.ly - ny);
      const edge = smooth((R - dist) / BAND);     // 0 ahead of the front, 1 behind it
      const o = cryst ? edge : 1 - edge;
      const x = lerp(d.cx, d.lx, o), y = lerp(d.cy, d.ly, o);
      ctx.globalAlpha = 0.3 + o * 0.55;
      ctx.fillStyle = `rgb(${Math.round(lerp(EMBER[0], TEAL[0], o))},${Math.round(lerp(EMBER[1], TEAL[1], o))},${Math.round(lerp(EMBER[2], TEAL[2], o))})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.1 + o * 0.85, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    const dt = Math.min(100, now - (last || now)); last = now;
    R += speed * dt;
    if (R > maxD + BAND) { cryst = !cryst; nucleate(); } // front done -> flip, nucleate anew
    paint();
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && visible && !reduce) { last = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  function setup() {
    build(); nucleate();
    if (reduce) { cryst = true; nx = W * 0.42; ny = H * 0.45;
      maxD = Math.max(Math.hypot(nx, ny), Math.hypot(nx - W, ny), Math.hypot(nx, ny - H), Math.hypot(nx - W, ny - H));
      R = 0.62 * (maxD + BAND); paint(); }     // a transition frozen mid-growth
    else start();
  }

  // test hook: freeze a front. (isCryst, fraction 0..1, nucleusX 0..1, nucleusY 0..1)
  window.__phaseTest = (isCryst, frac, px = 0.5, py = 0.5) => {
    stop(); build(); cryst = isCryst; nx = px * W; ny = py * H;
    maxD = Math.max(Math.hypot(nx, ny), Math.hypot(nx - W, ny), Math.hypot(nx, ny - H), Math.hypot(nx - W, ny - H));
    R = frac * (maxD + BAND); paint();
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0 }).observe(canvas);
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { stop(); setup(); }, 200); });
  setup();
})();
