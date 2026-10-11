// Inline SVG ornaments and icons, drawn to match the reference.

/* line · open diamond with side curls · line */
export const divider = `
<svg class="divider" viewBox="0 0 156 14" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round">
    <path d="M2 7H62" />
    <path d="M94 7H154" />
    <path d="M62 7c3-3.2 6.5-3.2 8 0c-1.5 3.2-5 3.2-8 0z" />
    <path d="M94 7c-3-3.2-6.5-3.2-8 0c1.5 3.2 5 3.2 8 0z" />
    <path d="M78 1.6L83.4 7L78 12.4L72.6 7Z" />
  </g>
  <circle cx="78" cy="7" r="1.7" fill="currentColor" />
</svg>`;

export const heart = `
<svg viewBox="0 0 24 21" aria-hidden="true">
  <path fill="currentColor" d="M12 21s-1.2-.9-3.1-2.5C4.3 14.6 0 11.1 0 6.4 0 2.8 2.7 0 6.2 0c2.2 0 4.3 1.1 5.8 3 1.5-1.9 3.6-3 5.8-3C21.3 0 24 2.8 24 6.4c0 4.7-4.3 8.2-8.9 12.1C13.2 20.1 12 21 12 21z"/>
</svg>`;

/* Gold swag garland strung across five studs */
export const garland = `
<svg class="garland" viewBox="0 0 448 26" preserveAspectRatio="none" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M4 4 C 40 26, 76 26, 114 6" />
    <path d="M114 6 C 150 26, 186 26, 224 6" />
    <path d="M224 6 C 262 26, 298 26, 334 6" />
    <path d="M334 6 C 372 26, 408 26, 444 4" />
  </g>
  <g fill="currentColor">
    <circle cx="4" cy="4" r="3.2" />
    <circle cx="114" cy="6" r="3.2" />
    <circle cx="224" cy="6" r="3.2" />
    <circle cx="334" cy="6" r="3.2" />
    <circle cx="444" cy="4" r="3.2" />
  </g>
</svg>`;

export const calendar = `
<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`;

export const calendarPlus = `
<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8.5 13.5v4M6.5 15.5h4"/></svg>`;

export const clock = `
<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`;

export const pin = `
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>`;
