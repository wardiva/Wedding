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

    <button class="intro" id="tapToOpen" type="button" aria-label="${esc(c.intro.tapToOpen)}: ${esc(inv.eventTitle)} ${esc(inv.ceremonyLabel)} ${esc(cp.groom.name)} ${esc(cp.joiner)} ${esc(cp.bride.name)}">
      <span class="intro__names">
        <span class="intro__line">${esc(inv.eventTitle)} ${esc(inv.ceremonyLabel)}</span>
        <span class="script">${esc(cp.groom.name)}</span>
        <span class="intro__amp">${esc(cp.joiner)}</span>
        <span class="script">${esc(cp.bride.name)}</span>
      </span>
      <span class="intro__tap"><span class="script">${esc(c.intro.tapToOpen)}</span></span>
    </button>

    <div class="invite">
      <div class="arabic invite__bismillah" lang="ar" ${r(0)}>${esc(inv.bismillah)}</div>
      <span ${r(1, "fade")}>${icon.divider}</span>
      <p class="invite__lines" ${r(2)}>${inv.lines.map(esc).join("<br />")}</p>
      <h1 class="invite__heading">
        <span class="script script--gold invite__event" ${r(3)}>${esc(inv.eventTitle)}</span>
        <span class="caps invite__ceremony" ${r(4)}>${esc(inv.ceremonyLabel)}</span>
        <span class="script invite__name invite__name--groom" ${r(5)}>${esc(cp.groom.name)}</span>
        <span class="invite__amp" ${r(6)}>${esc(cp.joiner)}</span>
        <span class="script invite__name" ${r(7)}>${esc(cp.bride.name)}</span>
      </h1>
      <span class="caps invite__date" ${r(9)}>${esc(inv.dateLine)}</span>
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
  const e = c.event;
  return `
  <section class="section s-events" data-section="events">
    <div class="bg" style="background-image:url('${c.media.venuePoster}')">
      <video class="bg__video" muted playsinline preload="none" data-lazy
             poster="${c.media.venuePoster}" disablepictureinpicture disableremoteplayback aria-hidden="true">
        <source data-src="${c.media.venueVideo}" type="video/mp4" />
        <source data-src="${c.media.venueVideoWebm}" type="video/webm" />
      </video>
    </div>
    <div class="wash"></div>
    <article class="event-card" ${r(0, "card")}>
      <h2 class="script script--light event-card__title" ${r(1)}>${esc(e.title)}</h2>
      <div class="event-card__rule" ${r(2, "fade")}></div>
      <div class="event-row" ${r(3)}>${icon.calendar}
        <div><div class="event-row__main">${esc(e.dateLine)}</div><div class="event-row__sub">${esc(e.timeLine)}</div></div>
      </div>
      <div class="event-row" ${r(4)}>${icon.pin}
        <div><div class="event-row__main">${esc(e.venue)}</div><div class="event-row__sub">${esc(e.address)}</div></div>
      </div>
      <div class="event-card__actions" ${r(5)}>
        <a class="caps btn-gold" href="${esc(e.mapsUrl)}" target="_blank" rel="noopener">${icon.pin}<span>${esc(c.eventLabels.openLocation)}</span></a>
        <button class="caps btn-ghost" type="button" data-ics>${icon.calendarPlus}<span>${esc(c.eventLabels.addToCalendar)}</span></button>
      </div>
    </article>
  </section>`;
}

function schedule(c) {
  const s = c.schedule, d = c.dressCode;
  return `
  <section class="section s-paper s-schedule" data-section="schedule">
    <div class="bg"></div>
    ${icon.medallion}
    <div class="schedule">
      <h2 class="script schedule__title" ${r(0)}>${esc(s.title)}</h2>
      <span ${r(1, "fade")}>${icon.divider}</span>
      <ol class="timeline">
        ${s.items
          .map(
            (it, i) => `<li class="timeline__item" ${r(2 + i)}>
              <span class="caps timeline__time">${esc(it.time)}</span>
              <span class="timeline__label">${esc(it.label)}</span>
            </li>`
          )
          .join("")}
      </ol>
      <div class="dress" ${r(2 + s.items.length)}>
        <span class="caps dress__title">${esc(d.title)}</span>
        <span class="dress__attire">${esc(d.attire)}</span>
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
      <span class="script closing__name" ${r(5)}>${esc(cp.bride.name)}</span>
      <span ${r(6, "fade")}>${icon.divider}</span>
      <div class="arabic closing__verse" lang="ar" ${r(7)}>${esc(k.verseArabic)}</div>
      <span class="caps closing__ref" ${r(8)}>${esc(k.verseReference)}</span>
    </div>
  </section>`;
}

export function renderSections(c) {
  return [opening, countdown, venue, schedule, closing]
    .map((fn) => fn(c))
    .join("");
}
