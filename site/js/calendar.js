// "Add to calendar": builds an .ics for the event and hands it to the OS.

const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escIcs = (s = "") => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

/** event: { title, start, end, location, description, url } (ISO dates with offset) */
export function downloadIcs(event) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${stamp(event.start)}-${Math.random().toString(36).slice(2)}@invitation`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(event.start)}`,
    `DTEND:${stamp(event.end || event.start)}`,
    `SUMMARY:${escIcs(event.title)}`,
    `LOCATION:${escIcs(event.location)}`,
    `DESCRIPTION:${escIcs(event.description)}`,
    ...(event.url ? [`URL:${event.url}`] : []),
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
    download: `${(event.title || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.ics`,
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
