// Petal shower: ivory and sage petals tumble down over the whole column after
// the date is revealed, carrying on as the guest scrolls to the venue card.

const IVORY = [
  ["#fffdf8", "#ece4d6"],
  ["#fbf7f0", "#e3d9c8"],
  ["#ffffff", "#efe8dc"],
  ["#f6f1e8", "#ddd2c1"],
];
const SAGE = [
  ["#cfdccc", "#9fb59f"],
  ["#bccdb9", "#8fa690"],
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const colour = () => pick(Math.random() < 0.2 ? SAGE : IVORY);

export function createPetals(canvas, { reducedMotion = false } = {}) {
  const ctx = canvas.getContext("2d");
  let petals = [];
  let raf = 0;
  let w = 0, h = 0, dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  };
  window.addEventListener("resize", resize);

  const spawn = (count, spread) => {
    const unit = w / 504;
    const now = Math.ceil(count * 0.4); // first wave: already on screen, no wait
    for (let i = 0; i < count; i++) {
      const first = i < now;
      const [c1, c2] = colour();
      const size = (10 + Math.random() * 14) * unit;
      petals.push({
        x: Math.random() * w,
        y: first ? Math.random() * h * 0.55 : -20 - Math.random() * 40,
        delay: first ? Math.random() * 0.25 : 0.3 + Math.random() * spread,
        size,
        aspect: 0.62 + Math.random() * 0.25,
        vy: (120 + Math.random() * 150) * (h / 800),
        vx: (Math.random() - 0.5) * 30 * unit,
        sway: (10 + Math.random() * 28) * unit,
        swayF: 0.6 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 3,
        flipF: 1 + Math.random() * 2.2,
        c1, c2,
      });
    }
  };

  const drawPetal = (p, t) => {
    const flip = Math.cos(t * p.flipF + p.phase); // 3D tumble
    ctx.save();
    ctx.globalAlpha = Math.min(1, (t - p.delay) / 0.25); // fade in, never pop
    ctx.translate(p.x + Math.sin(t * p.swayF + p.phase) * p.sway, p.y);
    ctx.rotate(p.rot + t * p.vr);
    ctx.scale(1, 0.25 + 0.75 * Math.abs(flip));
    const L = p.size, W = p.size * p.aspect;
    const g = ctx.createLinearGradient(-W / 2, -L / 2, W / 2, L / 2);
    g.addColorStop(0, flip > 0 ? p.c1 : p.c2);
    g.addColorStop(1, flip > 0 ? p.c2 : p.c1);
    ctx.fillStyle = g;
    ctx.beginPath();
    // rounded teardrop petal with a small notch at the tip
    ctx.moveTo(0, L / 2);
    ctx.bezierCurveTo(W * 0.62, L * 0.32, W * 0.6, -L * 0.42, W * 0.12, -L / 2);
    ctx.quadraticCurveTo(0, -L * 0.42, -W * 0.12, -L / 2);
    ctx.bezierCurveTo(-W * 0.6, -L * 0.42, -W * 0.62, L * 0.32, 0, L / 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(150,130,100,0.12)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  };

  let t0 = 0, prev = 0;
  const frame = (now) => {
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    let alive = 0;
    for (const p of petals) {
      if (t < p.delay) { alive++; continue; }
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      if (p.y < h + 40) { alive++; drawPetal(p, t); }
    }
    if (alive) raf = requestAnimationFrame(frame);
    else { petals = []; ctx.clearRect(0, 0, w, h); raf = 0; }
  };

  return {
    burst() {
      resize();
      // a light scatter, not a blizzard: few petals, spread out in time
      spawn(reducedMotion ? 10 : 44, reducedMotion ? 1.5 : 3);
      if (!raf) {
        t0 = prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
  };
}
