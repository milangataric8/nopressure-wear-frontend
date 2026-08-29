/**
 * Strip whitespace noise that WYSIWYG / contenteditable editors introduce:
 * `&nbsp;` entities on every inter-word space, non-breaking spaces, zero-width
 * characters, soft hyphens and runs of plain whitespace.
 *
 * This is a plain strip only. Typography rules (re-inserting `&nbsp;` for money
 * amounts, abbreviations, initials, ...) are the backend's job, applied in one
 * place on save. Do not duplicate them here. After save, the value returned by
 * the API is the source of truth for the preview.
 */

// Invisible characters that carry no meaning in body text:
// zero-width space / non-joiner / joiner, BOM, soft hyphen.
const INVISIBLE = new Set([0x200b, 0x200c, 0x200d, 0xfeff, 0x00ad]);
const NBSP = 0x00a0;

export const normalizeWhitespace = (html) => {
  if (!html) return html;

  let out = "";
  for (const ch of html) {
    const cp = ch.codePointAt(0);
    if (INVISIBLE.has(cp)) continue;
    out += cp === NBSP ? " " : ch;
  }

  return out
    .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
    .replace(/[^\S\r\n]{2,}/g, " ")
    .trim();
};
