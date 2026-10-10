// Section templates. Content comes exclusively from content.js; layout and
// styling live in CSS. Each function returns the markup for one screen.
import * as icon from "./icons.js";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** data-reveal helper: r(2) → stagger step 2 */
const r = (i, kind = "") => `data-reveal${kind ? `="${kind}"` : ""} style="--i:${i}"`;

function opening(c) {
  const { couple: cp, invitation: inv, media: m } = c;
  return `
  <section class="section s-opening is-intro" id="opening" data-section="opening">
    <div class="bg" style="background-image:url('${m.curtainPoster}')">
      <video class="bg__video" muted playsinline preload="auto" poster="${m.curtainPoster}"
             disablepictureinpicture disableremoteplayback>
        <source src="${m.curtainVideo}" type="video/mp4" />
        <source src="${m.curtainVideoWebm}" type="video/webm" />
      </video>
      <img class="bg__end" src="${m.curtainEndFrame}" alt="" decoding="async" />
      <img class="bg__light" src="${m.tentLight}" alt="" decoding="async" />
    </div>
    <div class="wash"></div>

    <button class="intro" id="tapToOpen" type="button" aria-label="${esc(c.intro.tapToOpen)}">
      <span class="intro__names">
        <span class="script">${esc(cp.groom.name)}</span>
        <span class="intro__amp">${esc(cp.joiner)}</span>
        <span class="intro__line">${esc(cp.bride.introLine)}</span>
        <span class="script">${esc(cp.bride.name)}</span>
      </span>
      <span class="intro__tap"><span class="script">${esc(c.intro.tapToOpen)}</span></span>
    </button>

    <div class="invite">
      <div class="arabic invite__bismillah" lang="ar" ${r(0)}>${esc(inv.bismillah)}</div>
      <span ${r(1, "fade")}>${icon.divider}</span>
      <p class="invite__lines" ${r(2)}>${inv.lines.map(esc).join("<br />")}</p>
      <span class="script script--gold invite__event" ${r(3)}>${esc(inv.eventTitle)}</span>
      <span class="caps invite__ceremony" ${r(4)}>${esc(inv.ceremonyLabel)}</span>
      <span class="script invite__name invite__name--groom" ${r(5)}>${esc(cp.groom.name)}</span>
      <span class="invite__amp" ${r(6)}>${esc(cp.joiner)}</span>
      <span class="invite__intro-line" ${r(7)}>${esc(cp.bride.introLine)}</span>
      <span class="script invite__name" ${r(8)}>${esc(cp.bride.name)}</span>
      <span class="caps invite__date" ${r(9)}>${esc(inv.dateLine)}</span>
    </div>
  </section>`;
}

function families(c) {
  const f = c.families;
  const side = (s, i) => `
    <div class="side" ${r(i)}>
      <span class="caps side__label">${esc(s.label)}</span>
      <img class="side__art" src="${s.illustration}" alt="" loading="lazy" decoding="async" />
      <p class="side__family">${esc(s.family)}</p>
    </div>`;
  return `
  <section class="section s-tent s-families" data-section="families" data-bg="${c.media.tentLight}">
    <div class="bg"></div>
    <div class="wash"></div>
    <div class="glass-card families-card" ${r(0, "card")}>
      <span class="script families-card__title" ${r(1)}>${esc(f.title)}</span>
      <span ${r(2, "fade")}>${icon.divider}</span>
      <div class="families-card__cols">${side(f.groomSide, 3)}${side(f.brideSide, 4)}</div>
      <div class="families-card__buttons" ${r(5)}>
        <span class="pill-dark">${esc(f.groomSide.button)}</span>
        <span class="pill-dark">${esc(f.brideSide.button)}</span>
      </div>
    </div>
  </section>`;
}

function letter(c) {
  const l = c.letter;
  return `
  <section class="section s-floral s-letter" data-section="letter" data-bg="${c.media.floralTent}">
    <div class="bg"></div>
    <div class="wash"></div>
    <div class="glass-card letter-card" ${r(0, "card")}>
      <span class="caps letter-card__from" ${r(1)}>${esc(l.from)} ${icon.heart}</span>
      <span class="caps letter-card__daughter" ${r(2)}>${esc(c.couple.bride.shortLine)}</span>
      <span class="script letter-card__salutation" ${r(3)}>${esc(l.salutation)}</span>
      <span ${r(4, "fade")}>${icon.divider}</span>
      <p class="letter-card__body" ${r(5)}>${esc(l.body)}</p>
      <span class="caps tag-pill" ${r(6)}>${esc(l.tag)}</span>
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

function events(c) {
  const list = c.events;
  const total = String(list.length).padStart(2, "0");
  const slide = (e, i) => `
    <div class="event-slide">
      <article class="event-card" ${r(0, "card")}>
        <span class="caps event-card__count" ${r(1)}>${String(i + 1).padStart(2, "0")} / ${total}</span>
        <span class="script script--light event-card__title" ${r(2)}>${esc(e.title)}</span>
        <div class="event-card__rule" ${r(2, "fade")}></div>
        <div class="event-row" ${r(3)}>${icon.calendar}
          <div><div class="event-row__main">${esc(e.dateLine)}</div><div class="event-row__sub">${esc(e.timeLine)}</div></div>
        </div>
        <div class="event-row" ${r(4)}>${icon.pin}
          <div><div class="event-row__main">${esc(e.venue)}</div><div class="event-row__sub">${esc(e.address)}</div></div>
        </div>
        <div class="event-card__actions" ${r(5)}>
          <a class="caps btn-gold" href="${esc(e.mapsUrl)}" target="_blank" rel="noopener">${icon.pin}<span>${esc(c.eventLabels.openLocation)}</span></a>
          <button class="caps btn-ghost" type="button" data-ics="${i}">${icon.calendarPlus}<span>${esc(c.eventLabels.addToCalendar)}</span></button>
        </div>
      </article>
    </div>`;
  return `
  <section class="section s-events" data-section="events">
    <div class="bg" style="background-image:url('${c.media.venuePoster}')">
      <video class="bg__video" muted playsinline preload="none" data-lazy
             poster="${c.media.venuePoster}" disablepictureinpicture disableremoteplayback>
        <source data-src="${c.media.venueVideo}" type="video/mp4" />
        <source data-src="${c.media.venueVideoWebm}" type="video/webm" />
      </video>
    </div>
    <div class="wash"></div>
    <div class="events-track" id="eventsTrack">${list.map(slide).join("")}</div>
    ${list.length > 1 ? `<div class="events-dots">${list.map((_, i) => `<span class="${i ? "" : "is-current"}"></span>`).join("")}</div>` : ""}
  </section>`;
}

function coupleSection(c) {
  const s = c.coupleSection, cp = c.couple;
  return `
  <section class="section section--tall s-paper s-couple" data-section="couple">
    <div class="bg"></div>
    ${icon.medallion}
    <span class="script couple__title" ${r(0)}>${esc(s.title)}</span>
    <figure class="arch-photo" ${r(1, "card")} style="margin-left:0;margin-right:0;margin-bottom:0">
      <img src="${s.portrait}" alt="${esc(s.portraitAlt)}" loading="lazy" decoding="async" />
    </figure>
    <span class="script couple__name" ${r(2)}>${esc(cp.groom.name)}</span>
    <span class="couple__amp" ${r(3)}>${esc(cp.joiner)}</span>
    <span class="couple__intro" ${r(3)}>${esc(cp.bride.introLine)}</span>
    <span class="script couple__name" ${r(4)}>${esc(cp.bride.name)}</span>
  </section>`;
}

function dressCode(c) {
  const d = c.dressCode;
  if (!d.enabled) return "";
  return `
  <section class="section s-paper s-dress" data-section="dress">
    <div class="bg"></div>
    <div class="dress">
      <h2 class="dress__title" ${r(0)} style="margin:0">${esc(d.title)}</h2>
      <div class="dress__rule" ${r(1, "fade")}></div>
      <p class="dress__intro" ${r(2)}>${esc(d.intro)}</p>
      ${d.items
        .map(
          (it, i) => `<div class="dress__item" ${r(3 + i)}>
            <div class="dress__event">${esc(it.event)}</div>
            <div class="dress__attire">${esc(it.attire)}</div>
          </div>`
        )
        .join("")}
    </div>
  </section>`;
}

function faq(c) {
  const f = c.faq;
  if (!f.enabled) return "";
  return `
  <section class="section s-paper s-faq" data-section="faq">
    <div class="bg"></div>
    ${icon.medallion}
    <div class="faq">
      <span class="script faq__title" ${r(0)}>${esc(f.title)}</span>
      <span ${r(1, "fade")}>${icon.divider}</span>
      <div class="faq__list">
        ${f.items
          .map(
            (it, i) => `
          <div class="faq-item${i === 0 ? " is-open" : ""}" ${r(2 + i)}>
            <button class="faq-item__q" type="button" aria-expanded="${i === 0}" aria-controls="faq-a-${i}">
              <span>${esc(it.q)}</span><span class="faq-item__icon" aria-hidden="true"></span>
            </button>
            <div class="faq-item__a" id="faq-a-${i}" role="region"><div><p>${esc(it.a)}</p></div></div>
          </div>`
          )
          .join("")}
      </div>
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
      <span class="closing__intro" ${r(4)}>${esc(cp.bride.introLine)}</span>
      <span class="script closing__name" ${r(5)}>${esc(cp.bride.name)}</span>
      <span ${r(6, "fade")}>${icon.divider}</span>
      <div class="arabic closing__verse" lang="ar" ${r(7)}>${esc(k.verseArabic)}</div>
      <span class="caps closing__ref" ${r(8)}>${esc(k.verseReference)}</span>
    </div>
  </section>`;
}

export function renderSections(c) {
  return [opening, families, letter, countdown, events, coupleSection, dressCode, faq, closing]
    .map((fn) => fn(c))
    .join("");
}
