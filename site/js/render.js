// Section templates. Content comes exclusively from content.js; layout and
// styling live in CSS. Each function returns the markup for one screen.
import * as icon from "./icons.js";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** data-reveal helper: r(2) → stagger step 2 */
const r = (i, kind = "") => `data-reveal${kind ? `="${kind}"` : ""} style="--i:${i}"`;

/** A string or a list of lines → escaped lines joined with <br> */
const lines = (v) => (Array.isArray(v) ? v : [v]).map(esc).join("<br />");

// Hairlines tapering into a small gold diamond
const fineRule = (i, cls = "") => `<span class="fine-rule ${cls}" ${r(i, "fade")} aria-hidden="true"><i></i><b></b><i></i></span>`;

function opening(c) {
  const { couple: cp, hero: h, media: m } = c;
  return `
  <section class="section s-opening is-intro" id="opening" data-section="opening">
    <div class="bg" style="background-image:url('${m.curtainPoster}')">
      <video class="bg__video" muted playsinline preload="auto" poster="${m.curtainPoster}"
             disablepictureinpicture disableremoteplayback>
        <source src="${m.curtainVideo}" type="video/mp4" />
        <source src="${m.curtainVideoWebm}" type="video/webm" />
      </video>
      <img class="bg__end" src="${m.curtainEndFrame}" alt="" decoding="async" />
      <img class="hero__poster" data-src="${m.heroPoster}" alt="" decoding="async" />
      <video class="hero__video" muted playsinline preload="none"
             disablepictureinpicture disableremoteplayback>
        <source data-src="${m.heroVideo}" type="video/mp4" />
        <source data-src="${m.heroVideoWebm}" type="video/webm" />
      </video>
    </div>
    <div class="wash"></div>

    <button class="intro" id="tapToOpen" type="button" aria-label="${esc(c.intro.tapToOpen)}">
      <span class="intro__tap">
        <span class="intro__halo" aria-hidden="true"></span>
        <span class="caps">${esc(c.intro.tapToOpen)}</span>
      </span>
    </button>

    <div class="hero__shade" aria-hidden="true"></div>
    <h1 class="hero__text">
      <span class="script hero__name" ${r(0)}>${esc(cp.groom.name)}</span>
      <span class="hero__amp" ${r(1)}>${esc(cp.joiner)}</span>
      <span class="script hero__name" ${r(2)}>${esc(cp.bride.name)}</span>
      <span class="hero__saying" ${r(3)}>${esc(h.saying)}</span>
      <span class="hero__vow" ${r(4)}>${esc(h.vow)}</span>
    </h1>
  </section>`;
}

function countdown(c) {
  const k = c.countdown;
  const units = ["days", "hours", "minutes", "seconds"];
  return `
  <section class="section s-tent s-countdown" data-section="countdown" data-bg="${c.media.tentLight}">
    <div class="bg"></div>
    <div class="wash"></div>
    <div class="glass-card cd-card" id="countdown" data-target="${esc(k.target)}" ${r(0, "card")}>
      <span class="card-eyebrow" ${r(1)}>${esc(k.eyebrow)}</span>
      <span class="script card-title" ${r(2)}>${esc(k.title)}</span>
      ${fineRule(3)}
      <span class="cd__day" ${r(4)}>${esc(k.day)}</span>
      <span class="cd__date" ${r(5)}>${esc(k.date)}</span>
      <span class="cd__time" ${r(6)}>${esc(k.time)}</span>
      ${fineRule(7, "fine-rule--wide")}
      <div class="cd__count" ${r(8)}>
        ${units.map((u) => `<div class="cd__cell" data-unit="${u}"><span class="cd__num" data-num>00</span><span class="cd__label">${esc(k.labels[u])}</span></div>`).join("")}
      </div>
    </div>
  </section>`;
}

function venue(c) {
  const v = c.venue;
  return `
  <section class="section s-tent s-venue" data-section="venue" data-bg="${c.media.tentLight}">
    <div class="bg"></div>
    <div class="wash"></div>
    <div class="glass-card venue-card" ${r(0, "card")}>
      <span class="card-eyebrow" ${r(1)}>${esc(v.eyebrow)}</span>
      <span class="script card-title venue__name" ${r(2)}>${esc(v.name)}</span>
      ${fineRule(3)}
      <span class="venue__addr" ${r(4)}>${esc(v.address)}</span>
      <span class="venue__city" ${r(5)}>${esc(v.city)}</span>
      <a class="caps btn btn--gold" href="${esc(v.mapsUrl)}" target="_blank" rel="noopener" ${r(6)}>${icon.pin}<span>${esc(v.openLocation)}</span></a>
    </div>
  </section>`;
}

function schedule(c) {
  const s = c.schedule;
  const row = (it, i) => `
        <li class="tl__row${it.highlight ? " is-key" : ""}" ${r(4 + i)}>
          <span class="tl__time">${esc(it.time)}${it.period ? `<small>${esc(it.period)}</small>` : ""}</span>
          <span class="tl__node" aria-hidden="true"></span>
          <span class="tl__what">${esc(it.title)}</span>
        </li>`;
  return `
  <section class="section s-floral s-schedule" data-section="schedule" data-bg="${c.media.floralTent}">
    <div class="bg"></div>
    <div class="wash"></div>
    <div class="glass-card sched-card" ${r(0, "card")}>
      <span class="card-eyebrow" ${r(1)}>${esc(s.eyebrow)}</span>
      <h2 class="script card-title" ${r(2)}>${esc(s.title)}</h2>
      ${fineRule(3)}
      <ol class="tl">${s.items.map(row).join("")}
      </ol>
    </div>
  </section>`;
}

function letter(c) {
  const l = c.letter, cp = c.couple;
  return `
  <section class="section s-floral s-letter" data-section="letter" data-bg="${c.media.floralTent}">
    <div class="bg"></div>
    <div class="wash"></div>
    <div class="glass-card letter-card" ${r(0, "card")}>
      <div class="arabic letter-card__bismillah" lang="ar" ${r(1)}>${esc(l.bismillah)}</div>
      ${fineRule(2)}
      <p class="letter-card__lead" ${r(3)}>${lines(l.lines)}</p>
      <span class="letter-card__event" ${r(4)}>${esc(l.eventLine)}</span>
      <span class="script letter-card__name" ${r(5)}>${esc(cp.groom.name)}</span>
      <span class="letter-card__amp" ${r(6)}>${esc(cp.joiner)}</span>
      <span class="script letter-card__name" ${r(7)}>${esc(cp.bride.name)}</span>
      ${fineRule(8, "fine-rule--after-names")}
      <div class="arabic letter-card__verse" lang="ar" ${r(9)}>${esc(l.verseArabic)}</div>
      <span class="caps letter-card__ref" ${r(10)}>${esc(l.verseReference)}</span>
    </div>
  </section>`;
}

function closing(c) {
  const k = c.closing, cp = c.couple;
  return `
  <section class="section s-floral s-closing" data-section="closing" data-bg="${c.media.floralTent}">
    <div class="bg"></div>
    <div class="wash"></div>
    <div class="glass-card closing-card" ${r(0, "card")}>
      <span class="ornament-heart" ${r(1)}>${icon.heart}</span>
      <p class="closing__line" ${r(2)} style="margin-bottom:0">${esc(k.line)}</p>
      <span class="script closing__name" ${r(3)}>${esc(cp.groom.name)}</span>
      <span class="closing__amp" ${r(4)}>${esc(cp.joiner)}</span>
      <span class="script closing__name" ${r(5)}>${esc(cp.bride.name)}</span>
      <span ${r(6, "fade")}>${icon.divider}</span>
      <div class="arabic closing__verse" lang="ar" ${r(7)}>${esc(k.verseArabic)}</div>
      <span class="caps closing__ref" ${r(8)}>${esc(k.verseReference)}</span>
    </div>
  </section>`;
}

export function renderSections(c) {
  return [opening, letter, countdown, schedule, venue, closing]
    .map((fn) => fn(c))
    .join("");
}
