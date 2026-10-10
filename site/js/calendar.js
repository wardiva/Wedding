// "Add to calendar": builds an .ics for the event and hands it to the OS.

const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escIcs = (s = "") => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

export function downloadIcs(event) {
  const cal = event.calendar || {};
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${stamp(cal.start)}-${Math.random().toString(36).slice(2)}@invitation`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(cal.start)}`,
    `DTEND:${stamp(cal.end || cal.start)}`,
    `SUMMARY:${escIcs(cal.title || event.title)}`,
    `LOCATION:${escIcs(`${event.venue}, ${event.address}`)}`,
    `DESCRIPTION:${escIcs(`${event.dateLine} — ${event.timeLine}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) {
    // Safari on iOS offers "Add to Calendar" for a text/calendar navigation.
    window.location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    return;
  }
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: `${(event.title || "event").toLowerCase().replace(/\s+/g, "-")}.ics`,
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
