// Scratch-to-reveal gold foil over the countdown's date block.
// A finger (or mouse) wipes the foil away; once enough is gone the rest
// fades out and `onReveal` fires (the petal shower). Keyboard and
// reduced-motion users reveal it with a single tap or Enter.

const REVEAL_AT = 0.45; // fraction of foil cleared → reveal everything

function paintFoil(canvas, hint) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width: w, height: h } = canvas;
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // brushed gold
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#b8955a");
  g.addColorStop(0.22, "#ead7a7");
  g.addColorStop(0.42, "#c7a466");
  g.addColorStop(0.58, "#f1e1b6");
  g.addColorStop(0.78, "#b18d53");
  g.addColorStop(1, "#d6bb83");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += Math.max(1, h / 120)) {
    ctx.fillStyle = `rgba(${rand() > 0.5 ? "255,246,220" : "120,90,45"},${0.04 + rand() * 0.06})`;
    ctx.fillRect(0, y, w, Math.max(1, h / 260));
  }
  // diagonal sheen
  const s = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, h);
  s.addColorStop(0.35, "rgba(255,255,255,0)");
  s.addColorStop(0.5, "rgba(255,250,232,0.4)");
  s.addColorStop(0.65, "rgba(255,255,255,0)");
  ctx.fillStyle = s;
  ctx.fillRect(0, 0, w, h);
  // glitter
  for (let i = 0; i < 14; i++) {
    const x = w * (0.06 + rand() * 0.88), y = h * (0.1 + rand() * 0.8), rr = (0.8 + rand() * 1.6) * (h / 90);
    const rg = ctx.createRadialGradient(x, y, 0, x, y, rr * 3);
    rg.addColorStop(0, "rgba(255,255,255,0.95)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(x, y, rr * 3, 0, Math.PI * 2); ctx.fill();
  }
  // "✦ SCRATCH TO REVEAL"
  // sized to fit: at most 15% of the panel's height, 80% of its width
  const text = `✦   ${hint.toUpperCase()}   ✦`;
  let fs = Math.round(h * 0.15);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(92, 66, 30, 0.85)";
  const set = () => {
    ctx.font = `600 ${fs}px "Cormorant Garamond", Georgia, serif`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${(fs * 0.2).toFixed(1)}px`;
  };
  set();
  while (ctx.measureText(text).width > w * 0.8 && fs > 8) { fs -= 1; set(); }
  ctx.fillText(text, w / 2, h / 2);
}

export function initScratch(root, { onReveal, reducedMotion }) {
  const panel = root.querySelector(".cd__when");
  const canvas = panel.querySelector(".cd__foil");
  const hint = panel.dataset.hint || "Scratch to reveal";
  let revealed = false, scale = 1, brush = 30;

  const size = () => {
    if (revealed) return;
    const r = panel.getBoundingClientRect();
    if (!r.width) return;
    scale = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(r.width * scale);
    canvas.height = Math.round(r.height * scale);
    brush = Math.max(22, r.height * 0.32);
    paintFoil(canvas, hint);
  };

  const reveal = () => {
    if (revealed) return;
    revealed = true;
    panel.classList.add("is-revealed");
    panel.removeAttribute("role");
    panel.removeAttribute("tabindex");
    panel.removeAttribute("aria-label");
    onReveal?.();
  };

  const cleared = () => {
    const data = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < data.length; i += 4 * 16) { n++; if (data[i] < 40) clear++; }
    return clear / n;
  };

  const stroke = (x0, y0, x1, y1) => {
    const r = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.lineWidth = brush * scale;
    ctx.beginPath();
    ctx.moveTo((x0 - r.left) * scale, (y0 - r.top) * scale);
    ctx.lineTo((x1 - r.left) * scale + 0.01, (y1 - r.top) * scale);
    ctx.stroke();
  };

  let last = null, lastCheck = 0;
  panel.addEventListener("pointerdown", (e) => {
    if (revealed) return;
    if (reducedMotion) return reveal();
    e.preventDefault();
    panel.setPointerCapture?.(e.pointerId);
    last = [e.clientX, e.clientY];
    stroke(e.clientX, e.clientY, e.clientX, e.clientY);
  });
  panel.addEventListener("pointermove", (e) => {
    if (!last || revealed) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs.length ? evs : [e]) {
      stroke(last[0], last[1], ev.clientX, ev.clientY);
      last = [ev.clientX, ev.clientY];
    }
    const now = performance.now();
    if (now - lastCheck > 120) { lastCheck = now; if (cleared() >= REVEAL_AT) reveal(); }
  });
  const end = () => { if (last) { last = null; if (cleared() >= REVEAL_AT) reveal(); } };
  panel.addEventListener("pointerup", end);
  panel.addEventListener("pointercancel", end);

  panel.setAttribute("role", "button");
  panel.setAttribute("tabindex", "0");
  panel.setAttribute("aria-label", hint);
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); }
  });

  document.fonts.ready.then(() => requestAnimationFrame(size));
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(size, 150); });
  return { reveal };
}
