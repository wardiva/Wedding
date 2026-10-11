// Section templates. Content comes exclusively from content.js; layout and
// styling live in CSS. Each function returns the markup for one screen.
import * as icon from "./icons.js";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** data-reveal helper: r(2) → stagger step 2 */
const r = (i, kind = "") => `data-reveal${kind ? `="${kind}"` : ""} style="--i:${i}"`;

/** A string or a list of lines → escaped lines joined with <br> */
const lines = (v) => (Array.isArray(v) ? v : [v]).map(esc).join("<br />");

/* Gold ornament (assets/card/ornament.svg) and the thin star rule */
const ornament = (i) => `<span class="ornament" ${r(i, "fade")} aria-hidden="true"></span>`;
const starRule = (i) => `<span class="star-rule" ${r(i, "fade")} aria-hidden="true"><i></i><b></b><i></i></span>`;

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

function invitation(c) {
  const { couple: cp, invitation: inv } = c;
  return `
  <section class="section s-paper s-invite" data-section="invitation">
    <div class="bg"></div>
    <div class="wash"></div>
    <div class="invite__frame" ${r(0, "fade")}></div>
    <div class="invite__sprig invite__sprig--top" ${r(0, "fade")}></div>
    <div class="invite__sprig invite__sprig--bottom" ${r(1, "fade")}></div>
    <div class="invite">
      <div class="arabic invite__bismillah" lang="ar" ${r(0)}>${esc(inv.bismillah)}</div>
      ${ornament(1)}
      <p class="invite__lead" ${r(2)}>${lines(inv.lines)}</p>
      <span class="caps-serif invite__event" ${r(3)}>${esc(inv.eventTitle)}</span>
      <span class="caps-serif invite__ceremony" ${r(4)}>${esc(inv.ceremonyLabel)}</span>
      <span class="script script--gold invite__name invite__name--first" ${r(5)}>${esc(cp.groom.name)}</span>
      <span class="invite__amp" ${r(6)}>${esc(cp.joiner)}</span>
      <span class="script script--gold invite__name" ${r(7)}>${esc(cp.bride.name)}</span>
      ${starRule(8)}
      <span class="caps-serif invite__date" ${r(9)}>${esc(inv.dateLine)}</span>
      <span class="invite__time" ${r(10)}>${esc(inv.timeLine)}</span>
    </div>
  </section>`;
}

function countdown(c) {
  const k = c.countdown;
  const units = ["days", "hours", "minutes", "seconds"];
  return `
  <section class="section s-tent s-countdown" data-section="countdown" data-bg="${c.media.tentLight}">
    <div class="bg"></div>
    <div class="wash"></div>
    <div class="countdown" id="countdown" data-target="${esc(k.target)}">
      <span class="caps countdown__eyebrow" ${r(0)}>${esc(k.eyebrow)}</span>
      <span class="script countdown__title" ${r(1)}>${esc(k.title)}</span>
      <span ${r(2, "fade")}>${icon.garland}</span>
      <div class="arches" ${r(3)}>
        ${units
          .map(
            (u) => `
          <div class="arch" data-unit="${u}">
            <div class="arch__face">
              <span class="arch__num" data-num>00</span>
              <span class="caps arch__label">${esc(k.labels[u])}</span>
            </div>
            <canvas class="arch__scratch" aria-hidden="true"></canvas>
          </div>`
          )
          .join("")}
      </div>
      <span class="caps countdown__hint" ${r(4)}>${esc(k.scratchHint)}</span>
      <span class="countdown__date">${esc(k.revealedDateLine)}</span>
    </div>
  </section>`;
}

function venue(c) {
  const v = c.venue;
  return `
  <section class="section s-venue" data-section="venue">
    <div class="bg"></div>
    <div class="wash"></div>
    <article class="venue-card" ${r(0, "card")}>
      <div class="venue-card__in">
        <span class="caps-serif eyebrow" ${r(1)}>${esc(v.eyebrow)}</span>
        <span class="script venue__name" ${r(2)}>${esc(v.name)}</span>
        ${ornament(3)}
        <span class="venue__addr" ${r(4)}>${esc(v.address)}</span>
        <span class="caps-serif venue__city" ${r(4)}>${esc(v.city)}</span>
        <div class="facts" ${r(5)}>
          <div class="fact">${icon.calendar}<span>${esc(v.dateLine)}</span></div>
          <div class="fact">${icon.clock}<span>${esc(v.timeLine)}</span></div>
        </div>
        <div class="venue__btns" ${r(6)}>
          <a class="caps btn btn--gold" href="${esc(v.mapsUrl)}" target="_blank" rel="noopener">${icon.pin}<span>${esc(v.openLocation)}</span></a>
          <button class="caps btn btn--ghost" type="button" data-ics>${icon.calendarPlus}<span>${esc(v.addToCalendar)}</span></button>
        </div>
      </div>
    </article>
  </section>`;
}

function schedule(c) {
  const s = c.schedule;
  const row = (it, i) => `
        <li class="tl__row${it.highlight ? " is-key" : ""}" ${r(3 + i)}>
          <span class="tl__time">${esc(it.time)}${it.period ? `<small>${esc(it.period)}</small>` : ""}</span>
          <span class="tl__node" aria-hidden="true"></span>
          <span class="tl__what">${esc(it.title)}${it.note ? `<em>${esc(it.note)}</em>` : ""}</span>
        </li>`;
  return `
  <section class="section s-paper s-schedule" data-section="schedule">
    <div class="bg"></div>
    <div class="wash"></div>
    <span class="caps-serif eyebrow" ${r(0)}>${esc(s.eyebrow)}</span>
    <h2 class="script sched__title" ${r(1)}>${esc(s.title)}</h2>
    ${ornament(2)}
    <ol class="tl">${s.items.map(row).join("")}
    </ol>
  </section>`;
}

function dressCode(c) {
  const d = c.dressCode;
  return `
  <section class="section s-paper s-dress" data-section="dress">
    <div class="bg"></div>
    <div class="wash"></div>
    <span class="caps-serif eyebrow" ${r(0)}>${esc(d.eyebrow)}</span>
    <h2 class="script dress__title" ${r(1)}>${esc(d.title)}</h2>
    ${ornament(2)}
    <div class="dress__figs" ${r(3, "card")}>
      <img class="dress__groom" src="${d.groomArt}" alt="" loading="lazy" decoding="async" />
      <img class="dress__bride" src="${d.brideArt}" alt="" loading="lazy" decoding="async" />
    </div>
    <div class="dress__card" ${r(4)}>
      <div class="caps-serif dress__attire">${esc(d.attire)}</div>
      <p class="dress__note">${lines(d.note)}</p>
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
      <span ${r(2, "fade")}>${icon.divider}</span>
      <p class="letter-card__lead" ${r(3)}>${lines(l.lines)}</p>
      <span class="letter-card__event" ${r(4)}>${esc(l.eventLine)}</span>
      <span class="script letter-card__name" ${r(5)}>${esc(cp.groom.name)}</span>
      <span class="letter-card__amp" ${r(6)}>${esc(cp.joiner)}</span>
      <span class="script letter-card__name" ${r(7)}>${esc(cp.bride.name)}</span>
      <span class="letter-card__rule" ${r(8, "fade")}>${icon.divider}</span>
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
  return [opening, letter, invitation, countdown, venue, schedule, dressCode, closing]
    .map((fn) => fn(c))
    .join("");
}
